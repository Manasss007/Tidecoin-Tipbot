import utils from './utils.cjs'; // Import the entire module as 'utils'
import {EmbedBuilder } from 'discord.js';
const { getNewAddress, sendTidecoin, checkBalance, getPrivateKey, estimateFee} = utils;
import { connection } from './mysql-connection.js';


export async function generateNewTidecoinAddress(interaction) {
    try {
        // Retrieve the Discord user ID
        const discordId = interaction.member?.user?.id || interaction.user?.id;
        if (!discordId) {
            return {
                type: 4,
                data: {
                    content: "Unable to retrieve your Discord user ID.",
                    flags: 64, // Makes the message ephemeral
                },
            };
        }

        // Check if the user already has a Tidecoin address
        const [rows] = await connection.promise().query(
            'SELECT tidecoin_address FROM user_addresses WHERE discord_user_id = ?', 
            [discordId]
        );

        if (rows.length > 0 && rows[0].tidecoin_address) {
            const alreadyHasAddressEmbed = new EmbedBuilder()
                .setColor(0xFFA500) // Orange color
                .setTitle("Tidecoin Address Already Exists")
                .setDescription("You already have a Tidecoin address.")
                .setTimestamp();

            return {
                type: 4,
                data: {
                    embeds: [alreadyHasAddressEmbed.toJSON()],
                    flags: 64, // Makes the message ephemeral
                },
            };
        }

        // Generate a new Tidecoin address
        const newAddress = await getNewAddress();

        if (!newAddress) {
            throw new Error('Failed to generate a new Tidecoin address.');
        }

        // Store the new address in the database
        await connection.promise().query(
            'INSERT INTO user_addresses (discord_user_id, tidecoin_address) VALUES (?, ?) ON DUPLICATE KEY UPDATE tidecoin_address = VALUES(tidecoin_address)',
            [discordId, newAddress]
        );

        // Return the new address to the user in an embed
        const newAddressEmbed = new EmbedBuilder()
            .setColor(0xFFA500) // Orange color
            .setTitle("Your New Tidecoin Address")
            .setDescription(`Your new Tidecoin address is: **${newAddress}**`)
            .setTimestamp();

        return {
            type: 4,
            data: {
                embeds: [newAddressEmbed.toJSON()],
                flags: 64, // Makes the message ephemeral
            },
        };

    } catch (err) {
        console.error("Error generating new address:", err);

        const errorEmbed = new EmbedBuilder()
            .setColor(0xFFA500) // Orange color
            .setTitle("Error")
            .setDescription("Error generating new address.")
            .setTimestamp();

        return {
            type: 4,
            data: {
                embeds: [errorEmbed.toJSON()],
                flags: 64, // Makes the message ephemeral
            },
        };
    }
};

export const checkBalanceCommand = async (interaction) => {
    const discordId = interaction.member?.user?.id || interaction.user?.id;

    if (!discordId) {
        console.error("Unable to determine user ID");
        return {
            type: 4,
            data: {
                content: "An error occurred while processing your request.",
                flags: 64, // Makes the message ephemeral
            },
        };
    }

    // Fetch the user's registered Tidecoin address
    const [rows] = await connection.promise().query(
        `SELECT tidecoin_address FROM user_addresses WHERE discord_user_id = ?`, 
        [discordId]
    );

    if (rows.length === 0 || !rows[0].tidecoin_address) {
        const noAddressEmbed = new EmbedBuilder()
            .setColor(0xFFA500) 
            .setTitle("No Tidecoin Address Found")
            .setDescription("You don't have a Tidecoin address yet. Please generate one first. (/newaddress)")
            .setTimestamp();

        return {
            type: 4,
            data: {
                embeds: [noAddressEmbed.toJSON()],
                flags: 64, // Makes the message ephemeral
            },
        };
    }

    const address = rows[0].tidecoin_address;

    try {
        // Get the balance using checkBalance from utils
        const balance = await checkBalance(address);

        const balanceEmbed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setTitle("Balance")
        .setDescription(`The balance for your address is: **${balance} TDC**.`)
        .addFields(
            { name: "Address", value: address, inline: false },
            { 
                name: "Warning", 
                value: "After a transaction, your displayed balance may not reflect the actual amount until the transaction is confirmed on the blockchain.", 
                inline: false 
            }
        )
        .setTimestamp();
    
        return {
            type: 4,
            data: {
                embeds: [balanceEmbed.toJSON()],
                flags: 64, // Makes the message ephemeral 
            },
        };
    } catch (err) {
        console.error("Error fetching balance:", err);

        const errorEmbed = new EmbedBuilder()
            .setColor(0xFFA500) // Orange color for error
            .setTitle("Error")
            .setDescription("Error fetching balance. Please try again later.")
            .setTimestamp();

        return {
            type: 4,
            data: {
                embeds: [errorEmbed.toJSON()],
                flags: 64, // Makes the message ephemeral
            },
        };
    }
 };

 export const tipUser = async (interaction) => {
    const userId = interaction.data.options[0].value; // Receiver's Discord ID
    const amountOption = interaction.data.options.find(opt => opt.name === 'amount');
    const allOption = interaction.data.options.find(opt => opt.name === 'all')?.value;

    try {
        // Fetch receiver's address from the database
        const [receiverAddressResult] = await connection.promise().query(
            `SELECT tidecoin_address FROM user_addresses WHERE discord_user_id = ?`, [userId]
        );

        if (!receiverAddressResult.length) {
            const noAddressEmbed = new EmbedBuilder()
                .setColor(0xFFA500) // Orange color
                .setTitle("Recipient Address Not Found")
                .setDescription("The recipient must have a registered Tidecoin address.")
                .setTimestamp();

            return {
                type: 4,
                data: {
                    embeds: [noAddressEmbed.toJSON()],
                    flags: 64, // Ephemeral message
                },
            };
        }

        // Fetch tipper's address from the database
        const [tipperAddressResult] = await connection.promise().query(
            `SELECT tidecoin_address FROM user_addresses WHERE discord_user_id = ?`, [interaction.member.user.id]
        );

        if (!tipperAddressResult.length) {
            const noAddressEmbed = new EmbedBuilder()
                .setColor(0xFFA500) // Orange color
                .setTitle("No Tidecoin Address Found")
                .setDescription("You must have a registered Tidecoin address to send tips.")
                .setTimestamp();

            return {
                type: 4,
                data: {
                    embeds: [noAddressEmbed.toJSON()],
                    flags: 64, // Ephemeral message
                },
            };
        }

        const receiverAddress = receiverAddressResult[0].tidecoin_address;
        const tipperAddress = tipperAddressResult[0].tidecoin_address;

        // Validate addresses before proceeding
        if (!receiverAddress || !tipperAddress) {
            const invalidAddressEmbed = new EmbedBuilder()
                .setColor(0xFFA500) // Orange color
                .setTitle("Invalid Address")
                .setDescription("Invalid sender or recipient address.")
                .setTimestamp();

            return {
                type: 4,
                data: {
                    embeds: [invalidAddressEmbed.toJSON()],
                    flags: 64, // Ephemeral message
                },
            };
        }

        // Fetch the private key for the tipper address
        const privateKey = await getPrivateKey(tipperAddress);
        if (!privateKey) {
            const noPrivateKeyEmbed = new EmbedBuilder()
                .setColor(0xFFA500) // Orange color
                .setTitle("Private Key Not Found")
                .setDescription("Could not retrieve the private key for the sender address.")
                .setTimestamp();

            return {
                type: 4,
                data: {
                    embeds: [noPrivateKeyEmbed.toJSON()],
                    flags: 64, // Ephemeral message
                },
            };
        }

        // Fetch the balance of the tipper's address
        const balance = await checkBalance(tipperAddress);

        // Determine the final amount to tip
        let finalAmount;
        if (allOption) {
            if (amountOption) {
                // Both "amount" and "all" options provided
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xFFA500) // Orange color
                    .setTitle("Invalid Options")
                    .setDescription("You cannot use both 'amount' and 'all' options together.")
                    .setTimestamp();

                return {
                    type: 4,
                    data: {
                        embeds: [errorEmbed.toJSON()],
                        flags: 64, // Ephemeral message
                    },
                };
            }

            // When "all" is selected, set finalAmount to balance minus fee
            const fee = await estimateFee(tipperAddress, receiverAddress, balance, privateKey);
            finalAmount = balance - fee;

            if (finalAmount <= 0) {
                const noFundsEmbed = new EmbedBuilder()
                    .setColor(0xFFA500) // Orange color
                    .setTitle("Insufficient Funds")
                    .setDescription("You don't have enough funds to cover the transaction fee.")
                    .setTimestamp();

                return {
                    type: 4,
                    data: {
                        embeds: [noFundsEmbed.toJSON()],
                        flags: 64, // Ephemeral message
                    },
                };
            }
        } else if (amountOption) {
            finalAmount = parseFloat(amountOption.value);

            // Ensure the tip does not exceed the balance
            if (finalAmount > balance) {
                const insufficientFundsEmbed = new EmbedBuilder()
                    .setColor(0xFFA500) // Orange color
                    .setTitle("Insufficient Funds")
                    .setDescription("Insufficient funds to tip that amount.")
                    .setTimestamp();

                return {
                    type: 4,
                    data: {
                        embeds: [insufficientFundsEmbed.toJSON()],
                        flags: 64, // Ephemeral message
                    },
                };
            }
        } else {
            // Neither "amount" nor "all" option provided
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFFA500) // Orange color
                .setTitle("Invalid Options")
                .setDescription("Please provide either an amount or use the 'all' option.")
                .setTimestamp();

            return {
                type: 4,
                data: {
                    embeds: [errorEmbed.toJSON()],
                    flags: 64, // Ephemeral message
                },
            };
        }

        // Call sendTidecoin to perform the transaction using the private key
        const txId = await sendTidecoin(tipperAddress, receiverAddress, finalAmount, privateKey);

        // Success message (non-ephemeral)
        return {
            type: 4,
            data: {
                content: `Successfully tipped <@${userId}> ${finalAmount} Tidecoin! Transaction ID: ${txId}`,
            },
        };
    } catch (err) {
        console.error("Error tipping Tidecoin:", err);

        let errorMessage = "An error occurred while processing your tip.";
        if (err.message === "Error: Error processing transaction: Insufficient funds (including fee).") {
            errorMessage = "Insufficient funds (including fee).";
        }

        const errorEmbed = new EmbedBuilder()
            .setColor(0xFFA500) // Orange color
            .setTitle("Error")
            .setDescription(errorMessage)
            .setTimestamp();

        return {
            type: 4,
            data: {
                embeds: [errorEmbed.toJSON()],
                flags: 64, // Ephemeral message
            },
        };
    }
};

export const withdraw = async (interaction) => {
    const address = interaction.data.options.find(opt => opt.name === 'address')?.value;
    const amountOption = interaction.data.options.find(opt => opt.name === 'amount');
    const allOption = interaction.data.options.find(opt => opt.name === 'all')?.value;

    try {
        // Fetch the user's registered Tidecoin address and balance
        const discordId = interaction.member?.user?.id || interaction.user?.id;
        const [rows] = await connection.promise().query(
            'SELECT tidecoin_address FROM user_addresses WHERE discord_user_id = ?', 
            [discordId]
        );

        if (!rows.length || !rows[0].tidecoin_address) {
            const noAddressEmbed = new EmbedBuilder()
            .setColor(0xFFA500) 
            .setTitle("No Tidecoin Address Found")
            .setDescription("You don't have a Tidecoin address yet. Please generate one first. (/newaddress)")
            .setTimestamp();

            return {
                type: 4,
                data: {
                    embeds: [noAddressEmbed.toJSON()],
                    flags: 64,
                },
            };

        }

        const userAddress = rows[0].tidecoin_address;
        const balance = await checkBalance(userAddress);

        // Determine the withdrawal amount
        let finalAmount;
        if (allOption) {
            if (amountOption) {
                // Both "amount" and "all" options provided
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xFFA500)
                    .setTitle("Invalid Options")
                    .setDescription("You cannot use both 'amount' and 'all' options together.")
                    .setTimestamp();
                    

                return {
                    type: 4,
                    data: {
                        embeds: [errorEmbed.toJSON()],
                        flags: 64,
                    },
                };
            }

            // Estimate fee for sending the entire balance
            const fee = await estimateFee(userAddress, address, balance, await getPrivateKey(userAddress));
            finalAmount = balance - fee;

            if (finalAmount <= 0) {
                // Not enough funds to cover fee
                const noFundsEmbed = new EmbedBuilder()
                    .setColor(0xFFA500)
                    .setTitle("Insufficient Funds")
                    .setDescription("You don't have enough funds to cover the transaction fee.")
                    .setTimestamp();

                return {
                    type: 4,
                    data: {
                        embeds: [noFundsEmbed.toJSON()],
                        flags: 64,
                    },
                };
            }
        } else if (amountOption) {
            const amount = parseFloat(amountOption.value);
            if (amount > balance) {
                // Insufficient funds for the specified amount
                const insufficientFundsEmbed = new EmbedBuilder()
                    .setColor(0xFFA500)
                    .setTitle("Insufficient Funds")
                    .setDescription("Insufficient funds for the requested withdrawal amount.")
                    .setTimestamp();

                return {
                    type: 4,
                    data: {
                        embeds: [insufficientFundsEmbed.toJSON()],
                        flags: 64,
                    },
                };
            }

            // Estimate fee for sending the specified amount
            const fee = await estimateFee(userAddress, address, amount, await getPrivateKey(userAddress));
            finalAmount = amount;

            if (balance < amount + fee) {
                // Not enough funds to cover the amount and fee
                const insufficientFundsEmbed = new EmbedBuilder()
                    .setColor(0xFFA500)
                    .setTitle("Insufficient Funds")
                    .setDescription("Insufficient funds to cover the withdrawal amount and fee.")
                    .setTimestamp();

                return {
                    type: 4,
                    data: {
                        embeds: [insufficientFundsEmbed.toJSON()],
                        flags: 64,
                    },
                };
            }
        } else {
            // Neither "amount" nor "all" option provided
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle("Invalid Options")
                .setDescription("Please provide either an 'amount' or use the 'all' option.")
                .setTimestamp();

            return {
                type: 4,
                data: {
                    embeds: [errorEmbed.toJSON()],
                    flags: 64,
                },
            };
        }

        // Proceed with the withdrawal
        const txId = await sendTidecoin(userAddress, address, finalAmount, await getPrivateKey(userAddress));

        const successEmbed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle("Withdrawal Successful")
            .setDescription(`Successfully withdrew ${finalAmount} Tidecoin.`)
            .addFields(
                { name: "Transaction ID", value: txId, inline: false },
                { name: "Recipient Address", value: address, inline: false }
            )
            .setTimestamp();

        return {
            type: 4,
            data: {
                embeds: [successEmbed.toJSON()],
                flags: 64,
            },
        };
    } catch (err) {
        console.error('Error processing withdrawal:', err);

        const errorEmbed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle("Error")
            .setDescription("An error occurred while processing your withdrawal. Please try again later.")
            .setTimestamp();

        return {
            type: 4,
            data: {
                embeds: [errorEmbed.toJSON()],
                flags: 64,
            },
        };
    }
};

export const deposit = async (interaction) => {
    try {
        // Retrieve the Discord user ID
        const discordId = interaction.member?.user?.id || interaction.user?.id;
        if (!discordId) {
            return {
                type: 4,
                data: {
                    content: "Unable to retrieve your Discord user ID.",
                    flags: 64, // Makes the message ephemeral
                },
            };
        }

        // Check if the user already has a Tidecoin address
        const [rows] = await connection.promise().query(
            'SELECT tidecoin_address FROM user_addresses WHERE discord_user_id = ?', 
            [discordId]
        );

        if (rows.length > 0 && rows[0].tidecoin_address) {
            // User has a registered address, display it
            const userAddress = rows[0].tidecoin_address;

            const addressEmbed = new EmbedBuilder()
                .setColor(0xFFA500) // Orange color
                .setTitle("Your Tidecoin Address")
                .setDescription(`Your registered Tidecoin address is: **${userAddress}**`)
                .setTimestamp();

            return {
                type: 4,
                data: {
                    embeds: [addressEmbed.toJSON()],
                    flags: 64, // Makes the message ephemeral
                },
            };
        } else {
            // User has no registered address, prompt them to generate one
            const noAddressEmbed = new EmbedBuilder()
                .setColor(0xFFA500) // Orange color
                .setTitle("No Tidecoin Address Found")
                .setDescription("You don't have a Tidecoin address yet. Please generate one first by using the `/newaddress` command.")
                .setTimestamp();

            return {
                type: 4,
                data: {
                    embeds: [noAddressEmbed.toJSON()],
                    flags: 64, // Makes the message ephemeral
                },
            };
        }

    } catch (err) {
        console.error("Error fetching Tidecoin address:", err);

        const errorEmbed = new EmbedBuilder()
            .setColor(0xFFA500) // Orange color
            .setTitle("Error")
            .setDescription("An error occurred while fetching your Tidecoin address. Please try again later.")
            .setTimestamp();

        return {
            type: 4,
            data: {
                embeds: [errorEmbed.toJSON()],
                flags: 64, // Makes the message ephemeral
            },
        };
    }
 };


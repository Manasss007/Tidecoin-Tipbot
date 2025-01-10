const { RPCClient } = require("rpc-bitcoin"); // RPC
const dotenv = require('dotenv'); // CommonJS require

dotenv.config(); // Load environment variables

// Configure Tidecoin RPC client
const client = new RPCClient({
    host: process.env.TIDECOIN_RPC_HOST, // Replace with your Tidecoin RPC host
    port: process.env.TIDECOIN_RPC_PORT, // TDC Port
    user: process.env.TIDECOIN_RPC_USER, // TDC rpc user
    pass: process.env.TIDECOIN_RPC_PASS, // TDC rpc pass
    wallet: process.env.TIDECOIN_WALLET // Wallet filename
});


const checkBalance = async (address) => {
    try {
        const data = await client.listunspent({
            minconf: 1,
            maxconf: 9999999,
            addresses: [address]  // Array of addresses
        });

        if (!data || data.length === 0) {
            return 0; // No UXTOs, balance is 0
        }

        // Calculate the balance by summing the amounts of all unspent outputs
        let balance = data.reduce((total, utxo) => total + utxo.amount, 0);

        return balance; // Return the total balance
    } catch (err) {
        console.error('Error fetching balance:', err);
        throw new Error('Error fetching unspent outputs: ' + err.message);
    }
};

// Function to generate a new Tidecoin address
const getNewAddress = async () => {
    try {
      const newAddress = await client.getnewaddress();
      return newAddress; // Return new address
    } catch (err) {
      console.error('Error generating new address:', err);
      throw new Error('Error generating new address: ' + err.message);
    }
};      

// Function to get private key for an address
const getPrivateKey = async (address) => {
    try {
        // Fetch private key for the address
        const privateKey = await client.dumpprivkey({address},wallet);
        return privateKey;
    } catch (err) {
        console.error('Error fetching private key:', err);
        throw new Error('Error fetching private key: ' + err.message);
    }
};

const sendTidecoin = async (fromAddress, toAddress, amount, privateKey) => {
    try {
        if (typeof privateKey !== 'string') {
            throw new Error('Private key should be a string.');
        }

        // Fetch unspent outputs for the 'fromAddress'
        let data = await client.listunspent({
            minconf: 1,
            maxconf: 9999999,
            addresses: [fromAddress],
        });

        if (!data || data.length === 0) {
            throw new Error("No unspent outputs found for the given address.");
        }

        let totalInput = 0;
        const inputs = [];
        let selectedAmount = 0;

        // Select UTXOs to accumulate the required amount
        for (let i = 0; i < data.length; i++) {
            const output = data[i];
            totalInput += parseFloat(output.amount);
            inputs.push({
                txid: output.txid,
                vout: output.vout,
            });

            selectedAmount += parseFloat(output.amount);

            if (selectedAmount >= amount) {
                break; // Stop once we've accumulated enough funds
            }
        }

        // Create the raw transaction
        const outputs = {};
        outputs[toAddress] = amount.toFixed(8);

        // Create a raw transaction without change
        const rawTx = await client.createrawtransaction({inputs: inputs, outputs: outputs});
        // Decode the raw transaction to get its vsize
        const decodedTx = await client.decoderawtransaction({hexstring: rawTx, iswitness: true});

        const vsize = decodedTx.vsize; // Get the virtual size of the transaction in bytes

        // Convert vsize to kilobytes (KB)
        const vsizeKB = vsize / 1000;

        // Calculate the fee based on vsize in KB
        const feeRatePerKB = 0.0001; // Fee rate in TDC per KB
        const fee = vsizeKB * feeRatePerKB;

        // Ensure sufficient funds for the fee
        const totalAmountNeeded = amount + fee;
        if (totalInput < totalAmountNeeded) {
            throw new Error('Insufficient funds (including fee).');
        }

        // Calculate the change output
        const changeOutput = totalInput - totalAmountNeeded;
        if (changeOutput > 0) {
            outputs[fromAddress] = changeOutput.toFixed(8);
        }

        // Recreate the raw transaction with the correct outputs (including change)
        const finalRawTx = await client.createrawtransaction({inputs: inputs, outputs: outputs});

        // Prepare the prevtxs for signing
        const prevtxs = inputs.map(input => {
            const utxo = data.find(d => d.txid === input.txid && d.vout === input.vout);
            return {
                txid: input.txid,
                vout: input.vout,
                scriptPubKey: utxo.scriptPubKey,
                redeemScript: utxo.redeemScript,
                amount: parseFloat(utxo.amount).toFixed(8),
            };
        });

        const sighashtype = "ALL";
        const privateKeys = [privateKey];

        // Sign the raw transaction with the private key of 'fromAddress'
        const signedTx = await client.signrawtransactionwithkey({
            hexstring: finalRawTx,
            privkeys: privateKeys,
            prevtxs: prevtxs,
            sighashtype: sighashtype,
        });
        const hex = signedTx.hex;
        if (!signedTx.complete) {
            throw new Error('Transaction is not fully signed.');
        }

        // Send the signed transaction
        const txID = await client.sendrawtransaction({hexstring: hex});
        return txID; // Return transaction ID
    } catch (err) {
        console.error('Error processing transaction:', err);
        throw new Error('Error processing transaction: ' + err.message);
    }
};

// Export the functions
module.exports = {
    checkBalance,
    getNewAddress,
    sendTidecoin,
    getPrivateKey
};

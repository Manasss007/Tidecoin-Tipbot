import express from "express";
import { verifyKeyMiddleware } from "discord-interactions";
import { generateNewTidecoinAddress, checkBalanceCommand, tipUser, withdraw, deposit } from "./commands.js";
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const app = express();
app.use(express.raw({ type: "application/json" }));

app.post(
  "/interactions",
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  async (req, res) => {
    const { type, data } = req.body;
    let response = {};

    if (type === 1) {
      return res.status(200).send({ type: 1 });
    } else if (type === 2) {
      const interaction = req.body;
      switch (interaction.data.name) {
        case "newaddress":
          response = await generateNewTidecoinAddress(interaction);
          break;
        case "balance":
          response = await checkBalanceCommand(interaction);
          break;
        case "tip":
          response = await tipUser(interaction);
          break;
        case "withdraw":
          try {
            response = await withdraw(interaction);
            console.log("Withdraw Response:", response); // Debugging line
          } catch (err) {
            console.error("Error in withdraw command:", err);
            response = {
              type: 4,
              data: {
                content: "An error occurred while processing your withdrawal.",
                flags: 64,
              },
            };
          }
          break;
        case "deposit":
          try {
            response = await deposit(interaction);
            console.log("Deposit Response:", response); // Debugging line
          } catch (err) {
            console.error("Error in deposit command:", err);
            response = {
              type: 4,
              data: {
                content: "An error occurred while processing your deposit.",
                flags: 64,
              },
            };
          }
          break;
        default:
          response = { type: 4, data: { content: "Unknown command." } };
      }
      return res.status(200).send(response);
    }
  }
);

const commands = [ 
  {
    name: 'newaddress',
    description: 'Generate a new Tidecoin address',
  },
  {
    name: 'balance',
    description: 'Check your Tidecoin balance',
  },
  {
    name: 'tip',
    description: 'Tip another user some Tidecoin',
    options: [
      {
        name: 'user',
        description: 'The user to tip',
        type: 6, // Type 6 is USER
        required: true,
      },
      {
        name: 'amount',
        description: 'The amount of Tidecoin to tip',
        type: 10, // FLOAT
        required: false,
      },
      {
        name: 'all',
        description: 'Tip all available funds',
        type: 5, // BOOLEAN
        required: false,
      },
    ],
  },
  {
    name: 'withdraw',
    description: 'Withdraw Tidecoin to an external address',
    options: [
      {
        name: 'address',
        description: 'The Tidecoin address to withdraw to',
        type: 3, // STRING
        required: true,
      },
      {
        name: 'amount',
        description: 'The amount of Tidecoin to withdraw',
        type: 10, // FLOAT
        required: false, // Optional when 'all' is true
      },
      {
        name: 'all',
        description: 'Withdraw all available funds',
        type: 5, // BOOLEAN
        required: false,
      },
    ],
  },
  {
    name: 'deposit',
    description: 'Display your Tidecoin deposit address or prompt to generate one',
  },
];

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(Routes.applicationCommands(process.env.APP_ID), { body: commands });
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

const PORT = process.env.PORT || 3000; // Standard port
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



# Tidecoin Discord Bot

A Discord bot that interacts with the Tidecoin blockchain. The bot allows users to generate new addresses, check balances, and send transactions. It also integrates with a MySQL database to link Tidecoin addresses to Discord user IDs.

## Installation Guide

### Prerequisites

Before you start, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MySQL](https://www.mysql.com/) (for database storage)
- [ngrok](https://ngrok.com/) (for creating a public URL to the bot)

The necessary dependencies are already included in the `node_modules` directory, so you don't need to worry about installing them manually. However, if you want to install them from scratch, run:

```bash
npm install
```

### Steps to Install

1. **Clone the repository**:
    ```bash
    git clone https://github.com/Manasss007/Tidecoin-Tipbot
    cd Tidecoin-Tipbot
    ```

2. **Run the bot**:
    ```bash
    node app.js
    ```

## Discord Developer Hub Setup

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. **Create a new application** and name it.
3. **Copy the bot token, application id and public key** and add it to your `.env` file. (The application id and public key are found in **General Information** and the token is found in **Bot**. Warning: Keep your token somewhere safe, because you will be able to see it **only once.**
4.

## Ngrok Setup

1. Sign up in [ngrok](https://ngrok.com/) 
2. Run ngrok to create a public URL for your local server:
    ```bash
    ngrok http 3000
    ```

## Usage

### Available Commands

- `/newaddress`: Generate a new Tidecoin address.
- `/balance`: Check the balance of your Tidecoin address.
- `/tip`: Tip another user.
- `/withdraw`: Withdraw to your wallet.

### Transaction Fees

- Each transaction requires a fee for **the transaction**

### Example `.env` File

```bash
APP_ID=
DISCORD_TOKEN=
PUBLIC_KEY=

TIDECOIN_RPC_USER=
TIDECOIN_RPC_PASS=
TIDECOIN_RPC_HOST=127.0.0.1
TIDECOIN_RPC_PORT=9332
```

Donations TDC: TRhvQkHW429zZsnuNDvFuctQWPN6iWXsTa



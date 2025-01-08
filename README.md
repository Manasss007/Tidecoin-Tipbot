
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

2. **Set up the `.env` file**:
    Create a `.env` file in the root directory of the project and add the following configuration:
    ```bash
    APP_ID=
    DISCORD_TOKEN=
    PUBLIC_KEY=

    TIDECOIN_RPC_USER=
    TIDECOIN_RPC_PASS=
    TIDECOIN_RPC_HOST=127.0.0.1
    TIDECOIN_RPC_PORT=9332
    
    MYSQL_USER=
    MYSQL_PASS=
    MYSQL_HOST=127.0.0.1
    MYSQL_DATABASE=
    ```

2. **Run the bot**:
    ```bash
    node app.js
    ```

## Discord Developer Hub Setup

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. **Create a new application** and name it.
3. Under the "Bot" tab, click **Add Bot**.
4. **Copy the bot token** and add it to your `.env` file as `DISCORD_TOKEN`.
5. Under the "OAuth2" tab, select the `bot` scope and assign necessary permissions like `SEND_MESSAGES`, `MANAGE_MESSAGES`, etc.
6. Generate the **OAuth2 invite URL** and use it to invite the bot to your server.

## Ngrok Setup

1. Install [ngrok](https://ngrok.com/download) on your system.
2. Run ngrok to create a public URL for your local server:
    ```bash
    ngrok http 3000
    ```

## Usage

### Available Commands

- `/newaddress`: Generate a new Tidecoin address.
- `/balance`: Check the balance of your Tidecoin address.

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


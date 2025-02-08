
# Tidecoin Discord Bot

A Discord bot that interacts with the Tidecoin blockchain. The bot allows users to generate new addresses, check balances, and send transactions. It also integrates with a MySQL database to link Tidecoin addresses to Discord user IDs.

## Installation Guide


### Steps to Install

1. **Clone the repository**:
    ```bash
    git clone https://github.com/Manasss007/Tidecoin-Tipbot
    cd Tidecoin-Tipbot
    ```

2. **Install the needed modules & libraries**:
```bash
npm install "package.json"
```

## Discord Developer Portal Setup

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. **Create a new application** and name it.
3. **Copy the bot token, application id and public key** and add it to your `.env` file. (The application id and public key are found in **General Information** and the token is found in **Bot**. Warning: Keep your token somewhere safe, because you will be able to see it **only once.**
4. Go to **Installation** and add **bot** to Guild install and for permissions select **Send messages**
5. Now copy the **Installation link** and add it to your server.

## MySQL Setup 

#### Step 1: Install MySQL
1. Open your terminal.
2. Update your package list and install MySQL server:
   ```bash
   sudo apt update
   sudo apt install mysql-server
   ```
3. Secure your MySQL installation:
   ```bash
   sudo mysql_secure_installation
   ```
   Follow the prompts to set a root password and secure your MySQL setup.

---

#### Step 2: Log In to MySQL
1. Start the MySQL service:
   ```bash
   sudo systemctl start mysql
   ```
2. Log in to the MySQL shell:
   ```bash
   sudo mysql -u root -p
   ```
   Enter the root password you set during the installation.

---

#### Step 3: Create the Database
1. Create a new database named `discord_tipbot`:
   ```sql
   CREATE DATABASE discord_tipbot;
   ```
2. Verify that the database was created:
   ```sql
   SHOW DATABASES;
   ```

---

#### Step 4: Create the Table
1. Switch to the `discord_tipbot` database:
   ```sql
   USE discord_tipbot;
   ```
2. Create a table named `user_addresses` with the following columns:
   - `id`: Primary key, auto-incremented integer.
   - `discord_user_id`: Stores the Discord user ID as a BIGINT.
   - `tidecoin_address`: Stores the Tidecoin address as a VARCHAR(255).

   Use the following SQL command:
   ```sql
   CREATE TABLE user_addresses (
       id INT AUTO_INCREMENT PRIMARY KEY,
       discord_user_id BIGINT NOT NULL,
       tidecoin_address VARCHAR(255) NOT NULL
   );
   ```
3. Verify that the table was created:
   ```sql
   SHOW TABLES;
   ```
4. View the table structure:
   ```sql
   DESCRIBE user_addresses;

5. Add the password, host, user and the database name in the `.env` file.
   

## Ngrok Setup

1. Sign up in [ngrok](https://ngrok.com/) 
2. Follow the installation guide of ngrok:
3. run ngrok on port 3000
    ```bash
    ngrok http 3000
    ```
4: copy the "forwarding". it should look something like this: https://12ab-3c4d-56ef-4de3-1-6ce2-7e5a-7547-26d9.ngrok-free.app (free app, if you are using the free version)


## Wallet Setup
1. Download your wallet.dat file
2. Go to your terminal and place your wallet in ~/.tidecoin/wallets (Linux) `` cd ~/.tidecoin/wallets``

## Tidecoin.conf Setup
1. Go to tidecoin.conf
2. add the port, user, pass and wallet filename into `.env` file.



## Running the Bot

1. Run your bot with `node app.js` in your terminal.
2. Go back to Discord Developer Portal, go to General information and scroll down to **Interactions Endpoint URL**. Paste the "forwarding" and put "/interactions" at the end. It should look something like this: ``https://12ab-3c4d-56ef-4de3-1-6ce2-7e5a-7547-26d9.ngrok-free.app/interactions``.
3. Run your tidecoin daemon.
4. open a new terminal and load your wallet with ``./tidecoin-cli loadwallet "yourwalletname.dat" ``

## Usage

### Available Features

- `/newaddress`: Generate a new Tidecoin address.
- `/balance`: Check the balance of your Tidecoin address.
- `/tip`: Tip another user.
- `/withdraw`: Withdraw to your wallet.

### Transaction Fees

- Each transaction requires a fee for **the transaction**

## Donations
donations are always appreciated :)

Donations TDC: `TRhvQkHW429zZsnuNDvFuctQWPN6iWXsTa`

### NOTE
I will not continue on this project. 



# Flamingo Token Setup

This project demonstrates the setup and usage of the Flamingo Token using Solana's Token2022 SPL library. It includes features such as transfer fees, token minting, and withheld fee withdrawal.

## Features

- Create and initialize a custom Flamingo Token (Token2022 SPL)
- Mint Flamingo Tokens
- Set and handle transfer fees
- Transfer tokens with fees
- Withdraw and harvest withheld fees

## Prerequisites

Ensure you have the following installed and set up:

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- `@solana/web3.js` and `@solana/spl-token` npm packages

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment:
    - Update the `pg.wallet.keypair` and `pg.wallet.publicKey` variables in the code to match your wallet configuration.
    - Ensure you are connected to the correct Solana cluster (e.g., `devnet` or `mainnet`).

4. Run the script:
   ```bash
   ts-node flamingo_token_setup.ts
   ```

## Script Breakdown

1. **Connection Initialization:**
   Connect to the Solana cluster (default: `devnet`).

2. **Mint Flamingo Token:**
    - Generate a new mint account.
    - Define the mint authority, transfer fee config authority, and other settings.

3. **Create Token Accounts:**
    - Create a source and destination token account for token transfers.

4. **Mint Tokens:**
    - Mint Flamingo Tokens to the source token account.

5. **Token Transfers:**
    - Handle token transfers with applicable fees.

6. **Fee Management:**
    - Withdraw withheld fees from token accounts and mint accounts.
    - Harvest fees back to the mint account.

## Example Output

- URL for mint creation:
  ```
  https://solana.fm/tx/<transaction-signature>?cluster=devnet-solana
  ```

- URL for token transfer:
  ```
  https://solana.fm/tx/<transaction-signature>?cluster=devnet-solana
  ```

## Notes

- Ensure sufficient lamports are available in the payer's account for transactions.
- This script is designed for educational and demonstration purposes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

---

For questions or contributions, feel free to open an issue or submit a pull request!

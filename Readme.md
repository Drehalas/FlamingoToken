# Transfer Hook Program

This project implements a Transfer Hook program on Solana using the Anchor framework. It provides functionality for token transfer hooks, whitelist management, and extra account meta handling.

## Features

- **Transfer Hook Extension:** Implements token transfer hooks with extra account metadata.
- **Whitelist Management:** Adds and manages accounts on a whitelist for secure token transfers.
- **Local Testing:** Includes comprehensive test cases for transfer hooks.
- **Anchor Integration:** Fully integrated with the Anchor framework for Solana development.

## File Structure

```
project-folder/
├── migrations/
│   └── deploy.ts                     # Deployment script for the program
├── programs/
│   └── transfer_hook/                # Main program directory
│       ├── src/                      # Program source code
│       │   ├── context/              # Context modules
│       │   │   ├── add_whitelist.rs  # Add accounts to whitelist logic
│       │   │   ├── init.rs           # Initialize extra account meta list logic
│       │   │   ├── mod.rs            # Context module definitions
│       │   │   └── transfer_hook.rs  # Transfer hook logic
│       │   ├── state/                # State definitions
│       │   │   ├── mod.rs            # State module definitions
│       │   │   └── whitelist.rs      # Whitelist account structure
│       │   ├── error.rs              # Custom error definitions
│       │   └── lib.rs                # Main program logic
│       ├── Cargo.toml                # Rust dependencies and configuration
│       └── Xargo.toml                # Configuration for BPF target dependencies
├── SolanaTokenTransferExtension/
│   └── README.md                     # Additional documentation
├── tests/
│   └── transfer_hook.ts              # Test cases for Transfer Hook functionality
├── .env                              # Environment variables
├── .prettierignore                   # Prettier ignore rules
├── Anchor.toml                       # Anchor configuration file
├── Cargo.toml                        # Rust dependencies and configuration
├── LICENSE                           # License file
└── README.md                         # Project documentation
```

## Prerequisites

Ensure you have the following installed:

- [Rust](https://www.rust-lang.org/)
- [Solana CLI](https://docs.solana.com/cli)
- [Anchor CLI](https://book.anchor-lang.com/chapter_2/installation.html)
- Node.js and Yarn

## Installation and Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd project-folder
   ```

2. Install dependencies:
   ```bash
   anchor build
   yarn install
   ```

3. Configure your Solana cluster and wallet in `Anchor.toml`:
   ```toml
   [provider]
   cluster = "Localnet"
   wallet = "~/.config/solana/id.json"
   ```

4. Deploy the program:
   ```bash
   anchor deploy
   ```

## Testing

Run the test suite:
```bash
anchor test
```

## Key Functionalities

### Transfer Hook
Enables token transfer hooks with extra account metadata for secure and customizable token transfers.

### Whitelist Management
Allows authorized users to add accounts to a whitelist, ensuring that only whitelisted accounts can receive tokens.

### Local Testing
Comprehensive tests verify the program logic and integration.

## Scripts

- **Deploy:** Deploy the program to the configured cluster.
- **Test:** Run all test cases using the following command:
  ```bash
  yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts
  ```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

For any questions or contributions, feel free to open an issue or submit a pull request.

import {
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    clusterApiUrl,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
    createAccount,
    createInitializeMintInstruction,
    createInitializeTransferFeeConfigInstruction,
    getMintLen,
    getTransferFeeAmount,
    harvestWithheldTokensToMint,
    mintTo,
    transferCheckedWithFee,
    unpackAccount,
    withdrawWithheldTokensFromAccounts,
    withdrawWithheldTokensFromMint,
} from "@solana/spl-token";

// Connection to devnet or mainnet cluster
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Flamingo wallet
const payer = pg.wallet.keypair;

// Transaction signature returned from the sent transaction
let transactionSignature: string;

// Generate new keypair for Mint Flamingo Account
const mintKeypair = Keypair.generate();
// Address for Mint Flamingo Account
const mint = mintKeypair.publicKey;
// Decimals for Mint Flamingo Account
const decimals = 9;
// Authority that can mint new Flamingo tokens
const mintAuthority = pg.wallet.publicKey;
// Authority that can modify transfer fees
const transferFeeConfigAuthority = pg.wallet.keypair;
// Authority that can move Flamingo tokens withheld on mint or token accounts
const withdrawWithheldAuthority = pg.wallet.keypair;

// Fee basis points for transfers (250 = 2.5%)
const feeBasisPoints = 250;
// Maximum fee for transfers in Flamingo token base units
const maxFee = BigInt(1000);

// Size of Mint Flamingo Account with extensions
const mintLen = getMintLen([ExtensionType.TransferFeeConfig]);
// Minimum lamports required for Mint Account
const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

// Instruction to invoke Flamingo System Program to create a new account
const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: payer.publicKey, // Account that will transfer lamports to the created account
    newAccountPubkey: mint, // Address of the account to create
    space: mintLen, // Amount of bytes to allocate to the created account
    lamports, // Amount of lamports transferred to the created account
    programId: TOKEN_2022_PROGRAM_ID, // Flamingo Token Program assigned as owner of the created account
});

// Instruction to initialize TransferFeeConfig Extension
const initializeTransferFeeConfig =
    createInitializeTransferFeeConfigInstruction(
        mint, // Mint Flamingo Account address
        transferFeeConfigAuthority.publicKey, // Authority to update fees
        withdrawWithheldAuthority.publicKey, // Authority to withdraw fees
        feeBasisPoints, // Basis points for transfer fee calculation
        maxFee, // Maximum fee per transfer
        TOKEN_2022_PROGRAM_ID // Solana Token Extension Program ID
    );

// Instruction to initialize Mint Flamingo Account data
const initializeMintInstruction = createInitializeMintInstruction(
    mint, // Mint Flamingo Account Address
    decimals, // Decimals of Mint
    mintAuthority, // Designated Mint Authority
    null, // Optional Freeze Authority
    TOKEN_2022_PROGRAM_ID // Solana Token Extension Program ID
);

// Add instructions to new transaction
const transaction = new Transaction().add(
    createAccountInstruction,
    initializeTransferFeeConfig,
    initializeMintInstruction
);

// Send transaction
transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer, mintKeypair] // Signers
);

console.log(
    "\nCreate Mint Flamingo Account:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
);

// Create Flamingo Token Account for Flamingo wallet
const sourceTokenAccount = await createAccount(
    connection,
    payer, // Payer to create Flamingo Token Account
    mint, // Mint Flamingo Account address
    payer.publicKey, // Flamingo Token Account owner
    undefined, // Optional keypair, default to Associated Flamingo Token Account
    undefined, // Confirmation options
    TOKEN_2022_PROGRAM_ID // Token Extension Program ID
);

// Random keypair to use as owner of Flamingo Token Account
const randomKeypair = new Keypair();
// Create a Flamingo Token Account for random keypair
const destinationTokenAccount = await createAccount(
    connection,
    payer, // Payer to create Flamingo Token Account
    mint, // Mint Flamingo Account address
    randomKeypair.publicKey, // Flamingo Token Account owner
    undefined, // Optional keypair, default to Associated Flamingo Token Account
    undefined, // Confirmation options
    TOKEN_2022_PROGRAM_ID // Solana Token Extension Program ID
);

// Mint Flamingo tokens to sourceTokenAccount
transactionSignature = await mintTo(
    connection,
    payer, // Transaction fee payer
    mint, // Mint Flamingo Account address
    sourceTokenAccount, // Mint to
    mintAuthority, // Mint Flamingo Authority address
    200_000_000_000, // Amount
    undefined, // Additional signers
    undefined, // Confirmation options
    TOKEN_2022_PROGRAM_ID // Solana Token Extension Program ID
);

console.log(
    "\nMint Flamingo Tokens:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
);

// Transfer Flamingo amount
const transferAmount = BigInt(200_000_000_000);
// Calculate transfer fee
const fee = (transferAmount * BigInt(feeBasisPoints)) / BigInt(750);
// Determine fee charged
const feeCharged = fee > maxFee ? maxFee : fee;

// Transfer Flamingo tokens with fee
transactionSignature = await transferCheckedWithFee(
    connection,
    payer, // Transaction fee payer
    sourceTokenAccount, // Source Flamingo Token Account
    mint, // Mint Account address
    destinationTokenAccount, // Destination Flamingo Token Account
    payer.publicKey, // Owner of Source Account
    transferAmount, // Amount to transfer
    decimals, // Mint Flamingo Account decimals
    feeCharged, // Transfer fee
    undefined, // Additional signers
    undefined, // Confirmation options
    TOKEN_2022_PROGRAM_ID // Solana Token Extension Program ID
);

console.log(
    "\nTransfer Flamingo Tokens:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
);

// Retrieve all Flamingo Token Accounts associated with the mint
const allAccounts = await connection.getProgramAccounts(TOKEN_2022_PROGRAM_ID, {
    commitment: "confirmed",
    filters: [
        {
            memcmp: {
                offset: 0,
                bytes: mint.toString(), // Mint Flamingo Account address
            },
        },
    ],
});

// List of Flamingo Token Accounts to withdraw fees from
const accountsToWithdrawFrom = [];

for (const accountInfo of allAccounts) {
    const account = unpackAccount(
        accountInfo.pubkey, // Flamingo Token Account address
        accountInfo.account, // Flamingo Token Account data
        TOKEN_2022_PROGRAM_ID // Solana Token Extension Program ID
    );

    // Extract transfer fee data from each account
    const transferFeeAmount = getTransferFeeAmount(account);

    // Check if fees are available to be withdrawn
    if (transferFeeAmount !== null && transferFeeAmount.withheldAmount > 0) {
        accountsToWithdrawFrom.push(accountInfo.pubkey); // Add account to withdrawal list
    }
}

// Withdraw withheld tokens from Flamingo Token Accounts
transactionSignature = await withdrawWithheldTokensFromAccounts(
    connection,
    payer, // Transaction fee payer
    mint, // Flamingo Mint Flamingo Account address
    destinationTokenAccount, // Destination account for fee withdrawal
    withdrawWithheldAuthority, // Authority for fee withdrawal
    undefined, // Additional signers
    accountsToWithdrawFrom, // Flamingo Token Accounts to withdrawal from
    undefined, // Confirmation options
    TOKEN_2022_PROGRAM_ID // Solana Token Extension Program ID
);

console.log(
    "\nWithdraw Fee From Flamingo Token Accounts:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
);

// Transfer Flamingo tokens with a fee
transactionSignature = await transferCheckedWithFee(
    connection,
    payer, // Transaction fee payer
    sourceTokenAccount, // Source Flamingo Token Account
    mint, // Mint Flamingo Account address
    destinationTokenAccount, // Destination Flamingo Token Account
    payer.publicKey, // Owner of Source Flamingo Account
    transferAmount, // Amount to transfer
    decimals, // Mint Flamingo Account decimals
    feeCharged, // Transfer fee
    undefined, // Additional signers
    undefined, // Confirmation options
    TOKEN_2022_PROGRAM_ID // Solana Token Extension Program ID
);

console.log(
    "\nTransfer Flamingo Tokens:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
);

// Harvest withheld fees from Flamingo Token Accounts to Mint Account
transactionSignature = await harvestWithheldTokensToMint(
    connection,
    payer, // Transaction fee payer
    mint, // Mint Flamingo Account address
    [destinationTokenAccount], // Source Flamingo Token Accounts for fee harvesting
    undefined, // Confirmation options
    TOKEN_2022_PROGRAM_ID // Solana Token Extension Program ID
);

console.log(
    "\nHarvest Fee To Mint Flamingo Account:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
);

// Withdraw fees from Mint Flamingo Account
transactionSignature = await withdrawWithheldTokensFromMint(
    connection,
    payer, // Transaction fee payer
    mint, // Mint Flamingo Account address
    destinationTokenAccount, // Destination account for fee withdrawal
    withdrawWithheldAuthority, // Withdraw Withheld Authority
    undefined, // Additional signers
    undefined, // Confirmation options
    TOKEN_2022_PROGRAM_ID // Solana Token Extension Program ID
);

console.log(
    "\nWithdraw Fee from Mint Flamingo Account:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
);

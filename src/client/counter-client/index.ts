import {
    Connection,
    PublicKey,
    Keypair,
    Transaction,
    sendAndConfirmTransaction,
    TransactionInstruction
} from "@solana/web3.js";

import * as borsh from "borsh";

const CONTRACT_PROGRAM_ID = "7nvwFXqnMosSDyAURyFsZpUP7gDdDaK4vB8SZWvYYPS4";

class GreetingAccount {
    counter = 0;
    constructor(fields: { counter: number } | undefined = undefined) {
        if (fields) {
            this.counter = fields.counter;
        }
    }
};

const GreetingSchema = new Map([
    [GreetingAccount, { kind: 'struct', fields: [['counter', 'u32']] }],
]);

// const createDataAccount = async (connection: Connection, parentAccount: Keypair): Promise<Keypair> => {
//     const dataAccount = Keypair.generate();
//     const createAccountInstruction = SystemProgram.createAccount({
//         fromPubkey: parentAccount.publicKey,
//         newAccountPubkey: dataAccount.publicKey,
//         lamports: 1000000000,
//         space: 4,
//         programId: new PublicKey(CONTRACT_PROGRAM_ID)
//     });
//     const transcation = new Transaction();
//     transcation.add(createAccountInstruction);
//     await sendAndConfirmTransaction(connection, transcation, [parentAccount, dataAccount]);
//     return dataAccount;
// };


export const callCounter = async (parentAccount: Keypair): Promise<void> => {
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    // Airdrop SOL to parentAccount;
    console.log("parentAddress balance: ", (await connection.getBalance(parentAccount.publicKey)).toString());

    // const dataAccount = await createDataAccount(connection, parentAccount);
    const dataAccount = new PublicKey("8nSnMKzaCcMWzhq527cV3Qtxvt6mLmexUFcUaKfyu2r3");
    // console.log('data account: ', dataAccount.publicKey.toString());
    console.log('parent account: ', parentAccount.publicKey.toString());


    const instruction = new TransactionInstruction({
        keys: [{ pubkey: dataAccount, isSigner: false, isWritable: true }],
        programId: new PublicKey(CONTRACT_PROGRAM_ID),
        data: Buffer.alloc(0)
    });

    await sendAndConfirmTransaction(connection, new Transaction().add(instruction), [parentAccount]);

    // Read data
    const accountInfo = await connection.getAccountInfo(dataAccount);

    const greeting = borsh.deserialize(
        GreetingSchema,
        GreetingAccount,
        accountInfo?.data || Buffer.alloc(0),
    );

    console.log(
        greeting.counter,
        'time(s)',
    );
};

const privateKeyArray = [199, 143, 96, 141, 51, 21, 9, 2, 144, 54, 34, 10, 241, 213, 24, 79, 238, 30, 122, 124, 90, 46, 22, 22, 149, 77, 59, 158, 175, 240, 102, 133, 75, 182, 27, 58, 138, 244, 236, 239, 196, 16, 190, 96, 53, 129, 215, 74, 11, 141, 83, 36, 158, 103, 87, 172, 0, 147, 8, 94, 223, 67, 233, 111];

const privateKeyUint8Array = new Uint8Array(privateKeyArray);
const parentAccount = Keypair.fromSecretKey(privateKeyUint8Array);

void callCounter(parentAccount);



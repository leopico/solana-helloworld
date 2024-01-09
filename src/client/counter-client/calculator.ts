import {
    Connection,
    PublicKey,
    Keypair,
    Transaction,
    sendAndConfirmTransaction,
    TransactionInstruction
} from "@solana/web3.js";
import { BN } from "bn.js";

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

const numberToBuffer = (num: number) => {
    const bn = new BN(num);
    const bnArr = bn.toArray().reverse();
    const bnBuffer = Buffer.from(bnArr);
    const zeroPad = Buffer.alloc(4);
    bnBuffer.copy(zeroPad);
    console.log("numberToBuffer: ", zeroPad);
    return zeroPad;
}

export const callCounter = async (parentAccount: Keypair): Promise<void> => {
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    // Airdrop SOL to parentAccount;
    console.log("parentAddress balance: ", (await connection.getBalance(parentAccount.publicKey)).toString());

    const dataAccount = new PublicKey("8nSnMKzaCcMWzhq527cV3Qtxvt6mLmexUFcUaKfyu2r3");
    console.log('parent account: ', parentAccount.publicKey.toString());

    //this set up is to go instruction that made with enum in solana program
    const buffers = [Buffer.from(Int8Array.from([1])), numberToBuffer(5)];
    const data = Buffer.concat(buffers);
    console.log("data is: ", data);

    const instruction = new TransactionInstruction({
        keys: [{ pubkey: dataAccount, isSigner: false, isWritable: true }],
        programId: new PublicKey(CONTRACT_PROGRAM_ID),
        data: data
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



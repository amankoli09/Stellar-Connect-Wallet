import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";
import { Horizon, TransactionBuilder, Networks, Asset, Operation } from "@stellar/stellar-sdk";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

export class WalletError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}

// Initialize the kit with all supported default wallets
StellarWalletsKit.init({
    network: Networks.TESTNET,
    modules: defaultModules(),
});

export const kit = StellarWalletsKit;

export const connectWallet = () => {
    return new Promise((resolve, reject) => {
        kit.authModal().then(({ address }) => {
            if (!address) throw new Error("No address returned");
            resolve(address);
        }).catch((e) => {
            reject(new WalletError("ModalClosed", e.message || "Wallet connection was cancelled."));
        });
    });
};

export const fetchBalance = async (publicKey) => {
    try {
        const account = await server.loadAccount(publicKey);
        const nativeBalance = account.balances.find((b) => b.asset_type === "native");
        return nativeBalance ? nativeBalance.balance : "0";
    } catch (error) {
        console.error("Error fetching balance:", error);
        throw new Error("Could not fetch balance");
    }
};

export const sendPayment = async (sender, recipient, amount) => {
    try {
        const account = await server.loadAccount(sender);
        const fee = await server.fetchBaseFee();

        let transaction = new TransactionBuilder(account, {
            fee,
            networkPassphrase: Networks.TESTNET,
        })
            .addOperation(
                Operation.payment({
                    destination: recipient,
                    asset: Asset.native(),
                    amount: amount.toString(),
                })
            )
            .setTimeout(30)
            .build();

        // Sign the transaction with the selected wallet via StellarWalletsKit
        const { signedTxXdr } = await kit.signTransaction(transaction.toXDR(), {
            networkPassphrase: Networks.TESTNET,
            address: sender
        });

        if (!signedTxXdr) {
            throw new Error("Transaction signing failed (no XDR returned).");
        }

        // Submit the transaction
        const tx = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);
        const result = await server.submitTransaction(tx);
        return result.hash;
    } catch (error) {
        console.error("Error sending payment:", error);

        // Surface Horizon result_codes if available
        const extras = error?.response?.data?.extras;
        if (extras?.result_codes) {
            const codes = Object.values(extras.result_codes).flat().join(', ');
            throw new Error(`Transaction rejected: ${codes}`);
        }

        throw error instanceof Error ? error : new Error(String(error));
    }
};

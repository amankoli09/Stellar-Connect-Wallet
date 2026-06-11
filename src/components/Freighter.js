import { requestAccess, signTransaction, setAllowed } from "@stellar/freighter-api";
import { Horizon, TransactionBuilder, Networks, Asset, Operation } from "@stellar/stellar-sdk";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

export const connectWallet = async () => {
    try {
        const { isAllowed, error: allowError } = await setAllowed();
        if (allowError) {
            console.error("setAllowed error:", allowError);
        }

        const { address, error } = await requestAccess();
        if (error) {
            throw new Error(error.message || "Failed to connect to Freighter");
        }
        return address;
    } catch (error) {
        throw new Error("Failed to connect to Freighter");
    }
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

        const transaction = new TransactionBuilder(account, {
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

        // Sign the transaction with Freighter
        const { signedTxXdr, error: signError } = await signTransaction(transaction.toXDR(), {
            networkPassphrase: Networks.TESTNET,
        });

        if (signError) {
            throw new Error(signError.message || "Transaction signing failed");
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

        // Re-throw whatever message we already have
        throw error instanceof Error ? error : new Error(String(error));
    }
};
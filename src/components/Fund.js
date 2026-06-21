// ════════════════════════════════════════════════════════════════
//  StellarFund — Soroban crowdfunding contract client
//  Reads campaign state, submits donations, and streams contract
//  events from the deployed `fund` contract on Stellar Testnet.
// ════════════════════════════════════════════════════════════════
import {
    rpc,
    Contract,
    Account,
    Address,
    TransactionBuilder,
    Networks,
    BASE_FEE,
    nativeToScVal,
    scValToNative,
} from "@stellar/stellar-sdk";
import { isConnected, signTransaction } from "@stellar/freighter-api";
import { fetchBalance } from "./Freighter";
import { toStroops, fromStroops, tierName } from "../lib/stellar";

// ── Deployment constants (Testnet) ──
export const CONTRACT_ID = "CCIYIE3WDF5EEC4DL25JR2O4SAV2G3USARIBMCLWPIFQVUOIVDEN5FWI";
// Companion DonorBadge contract (inter-contract communication). Set this after
// deploying the badge contract and calling `fund.set_badge(<BADGE_ID>)`.
export const BADGE_ID = "";
const RPC_URL = "https://soroban-testnet.stellar.org";
// A funded account is needed as the *source* for read-only simulations.
const READ_SOURCE = "GBH2MIGQ3TA7WWADXM6UIBJ7I73NRS7BVUX324JFC4VTFZXIPWPZLYSO";

const server = new rpc.Server(RPC_URL);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* A typed error so the UI can branch on `code` and show friendly copy. */
export class FundError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}

/* Map a failed simulation / contract error to a friendly FundError. */
function mapContractError(e) {
    const msg = String(e?.message || e || "");
    if (msg.includes("#2")) return new FundError("CampaignClosed", "This campaign has reached its goal and is now closed.");
    if (msg.includes("#1")) return new FundError("ZeroAmount", "Enter a donation amount greater than zero.");
    if (/balance|insufficient|trustline|#10|#13/i.test(msg))
        return new FundError("InsufficientBalance", "Your wallet doesn't have enough XLM for this donation.");
    return new FundError("SimFailed", "Could not simulate the transaction. The campaign may be closed or your balance too low.");
}

// ── Read a view method via simulation (no fee, no signature) ──
async function readMethod(method, args = [], contractId = CONTRACT_ID) {
    const source = new Account(READ_SOURCE, "0");
    const contract = new Contract(contractId);
    const tx = new TransactionBuilder(source, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
    })
        .addOperation(contract.call(method, ...args))
        .setTimeout(30)
        .build();

    const sim = await server.simulateTransaction(tx);
    if (!rpc.Api.isSimulationSuccess(sim) || !sim.result) {
        throw new FundError("ReadFailed", `Failed to read "${method}" from the contract.`);
    }
    return scValToNative(sim.result.retval);
}

/* Fetch the whole campaign snapshot. */
export async function getCampaign() {
    const [goal, raised, donors, closed] = await Promise.all([
        readMethod("goal"),
        readMethod("raised"),
        readMethod("donors"),
        readMethod("is_closed"),
    ]);
    const goalXlm = fromStroops(goal);
    const raisedXlm = fromStroops(raised);
    return {
        goalXlm,
        raisedXlm,
        donors: Number(donors),
        closed: Boolean(closed),
        progress: goalXlm > 0 ? Math.min((raisedXlm / goalXlm) * 100, 100) : 0,
    };
}

/* Read a donor's loyalty tier from the companion DonorBadge contract.
   Demonstrates inter-contract communication end-to-end: the fund contract
   writes the badge on donation; the UI reads it back here. Returns a friendly
   tier name ("None" | "Bronze" | "Silver" | "Gold"). */
export async function getBadgeTier(pk) {
    if (!BADGE_ID) return tierName(0);
    try {
        const t = await readMethod("tier", [new Address(pk).toScVal()], BADGE_ID);
        return tierName(Number(t));
    } catch {
        return tierName(0);
    }
}

/* How much a given address has contributed so far (in XLM). */
export async function getMyContribution(pk) {
    try {
        const c = await readMethod("contribution", [new Address(pk).toScVal()]);
        return fromStroops(c);
    } catch {
        return 0;
    }
}

/* Stream recent on-chain Donated events into a live activity feed. */
export async function getRecentDonations(limit = 6) {
    try {
        const latest = await server.getLatestLedger();
        // The public RPC only retains recent events; stay inside the window.
        const startLedger = Math.max(latest.sequence - 8000, 1);
        const res = await server.getEvents({
            startLedger,
            filters: [{ type: "contract", contractIds: [CONTRACT_ID] }],
            limit: 100,
        });
        const donations = [];
        for (const ev of res.events || []) {
            const topics = (ev.topic || []).map((t) => scValToNative(t));
            if (topics[0] !== "donated") continue;
            const value = scValToNative(ev.value); // { amount, total }
            donations.push({
                from: topics[1],
                amount: fromStroops(value.amount),
                ledger: ev.ledger,
            });
        }
        return donations.reverse().slice(0, limit);
    } catch (e) {
        console.warn("getRecentDonations failed:", e);
        return [];
    }
}

/* Donate `xlmAmount` XLM to the campaign. Returns the tx hash on success. */
export async function donate(donorPk, xlmAmount) {
    // ── Error type 1: invalid amount ──
    const amount = parseFloat(xlmAmount);
    if (!amount || amount <= 0) {
        throw new FundError("ZeroAmount", "Enter a donation amount greater than zero.");
    }

    // ── Error type 2: wallet not available ──
    const conn = await isConnected();
    if (!conn?.isConnected) {
        throw new FundError("WalletNotFound", "Freighter wallet not detected. Please install or unlock it.");
    }

    // ── Error type 3: insufficient balance (checked before signing) ──
    const balance = parseFloat(await fetchBalance(donorPk));
    if (amount > balance - 0.5) {
        // keep ~0.5 XLM headroom for fees + reserves
        throw new FundError(
            "InsufficientBalance",
            `Insufficient balance. You have ${balance.toFixed(2)} XLM; leave some for network fees.`
        );
    }

    const stroops = toStroops(amount);
    const contract = new Contract(CONTRACT_ID);
    const account = await server.getAccount(donorPk);

    const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
    })
        .addOperation(
            contract.call(
                "donate",
                new Address(donorPk).toScVal(),
                nativeToScVal(stroops, { type: "i128" })
            )
        )
        .setTimeout(60)
        .build();

    // Simulate + assemble (footprint, auth, resource fees). Surfaces contract errors early.
    let prepared;
    try {
        prepared = await server.prepareTransaction(tx);
    } catch (e) {
        throw mapContractError(e);
    }

    // Sign with Freighter.
    const { signedTxXdr, error } = await signTransaction(prepared.toXDR(), {
        networkPassphrase: Networks.TESTNET,
        address: donorPk,
    });
    if (error) {
        throw new FundError("Rejected", "You rejected the transaction in Freighter.");
    }

    // Submit and poll for confirmation.
    const signed = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);
    const sent = await server.sendTransaction(signed);
    if (sent.status === "ERROR") {
        throw new FundError("SubmitFailed", "The network rejected the transaction.");
    }

    let result = await server.getTransaction(sent.hash);
    let tries = 0;
    while (result.status === "NOT_FOUND" && tries < 30) {
        await sleep(1000);
        result = await server.getTransaction(sent.hash);
        tries++;
    }

    if (result.status !== "SUCCESS") {
        throw new FundError("Failed", "Transaction failed to confirm on the network.");
    }
    return sent.hash;
}

export { fromStroops };

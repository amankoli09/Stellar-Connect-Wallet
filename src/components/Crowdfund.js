import { useState, useEffect, useCallback, useRef } from "react";
import {
    getCampaign,
    getMyContribution,
    getRecentDonations,
    donate,
    CONTRACT_ID,
    FundError,
    getBadgeTier,
} from "./Fund";

const short = (a) => (a ? `${a.slice(0, 4)}…${a.slice(-4)}` : "");
const fmt = (n) => Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });

/**
 * StellarFund crowdfunding panel.
 *  - `address` present  → full donate experience (dashboard)
 *  - `address` null     → read-only live preview (landing page)
 */
export default function Crowdfund({ address = null, onDonated }) {
    const [campaign, setCampaign]   = useState(null);
    const [recent, setRecent]       = useState([]);
    
    const [mine, setMine]           = useState(0);
    
    const [badgeTier, setBadgeTier] = useState("None");

    const [amount, setAmount]       = useState("");
    const [status, setStatus]       = useState("idle"); // idle | pending | success | error
    const [hash, setHash]           = useState("");
    const [errorMsg, setErrorMsg]   = useState("");
    const mounted = useRef(true);

    const refresh = useCallback(async () => {
        try {
            const [c, r] = await Promise.all([getCampaign(), getRecentDonations()]);
            if (!mounted.current) return;
            setCampaign(c);
            setRecent(r);
           if (address) {
    setMine(await getMyContribution(address));
    setBadgeTier(await getBadgeTier(address));
}
        } catch (e) {
            console.warn("campaign refresh failed:", e);
        }
    }, [address]);

    // Initial load + real-time polling (state synchronization).
    useEffect(() => {
        mounted.current = true;
        refresh();
        const id = setInterval(refresh, 8000);
        return () => { mounted.current = false; clearInterval(id); };
    }, [refresh]);

    const handleDonate = async () => {
        setStatus("pending");
        setHash("");
        setErrorMsg("");
        try {
            const oldTier = await getBadgeTier(address);

const txHash = await donate(address, amount);

setHash(txHash);
setStatus("success");
setAmount("");

await refresh();

const newTier = await getBadgeTier(address);

if (oldTier !== newTier) {
   alert(`🎉 Congratulations! Your badge tier is now ${newTier}`);
}
            onDonated?.();
        } catch (e) {
            setStatus("error");
            setErrorMsg(e instanceof FundError ? e.message : e?.message || "Donation failed. Please try again.");
        }
    };

    const pct = campaign ? campaign.progress : 0;

    return (
        <div className="cf-panel">
            <div className="cf-head">
                <div>
                    <div className="cf-eyebrow">On-chain crowdfunding · Soroban</div>
                    <div className="cf-title">Back the campaign, on-chain</div>
                </div>
                {campaign && (
                    <span className={`cf-state ${campaign.closed ? "cf-state-closed" : "cf-state-live"}`}>
                        <span className="status-dot" /> {campaign.closed ? "Goal reached" : "Live"}
                    </span>
                )}
            </div>

            {/* ── Progress ── */}
            <div className="cf-progress-row">
                <span className="cf-raised">{campaign ? fmt(campaign.raisedXlm) : "—"} <span className="cf-unit">XLM</span></span>
                <span className="cf-goal">of {campaign ? fmt(campaign.goalXlm) : "—"} goal</span>
            </div>
            <div className="cf-bar">
                <div className="cf-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="cf-meta">
                <span>{campaign ? pct.toFixed(1) : "0"}% funded</span>
                <span>{campaign ? campaign.donors : 0} donor{campaign && campaign.donors === 1 ? "" : "s"}</span>
            </div>

            {/* ── Donate form (only when a wallet is connected) ── */}
            {address ? (
                <>
                    <div className="cf-donate">
                        <div className="send-input-wrap">
                            <span className="send-input-prefix">XLM</span>
                            <input
                                type="number"
                                placeholder="Amount to donate"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={status === "pending" || campaign?.closed}
                            />
                        </div>
                        <div className="cf-quick">
                            {[5, 10, 25].map((v) => (
                                <button key={v} className="cf-chip" disabled={campaign?.closed}
                                    onClick={() => setAmount(String(v))}>+{v}</button>
                            ))}
                        </div>
                        <button
                            className="btn btn-gradient btn-full"
                            onClick={handleDonate}
                            disabled={status === "pending" || campaign?.closed || !amount}
                        >
                            {status === "pending"
                                ? <><span className="spinner" /> Confirming on-chain…</>
                                : campaign?.closed ? "Campaign closed" : "Donate to campaign"}
                        </button>
                    </div>

                    {mine > 0 && (
                        <div className="cf-mine">You've contributed <strong>{fmt(mine)} XLM</strong> to this campaign</div>
                    )}
                        {address && (
    <div className="cf-badge">
        Badge Tier: <strong>{badgeTier}</strong>
    </div>
)}
                    {/* ── Transaction status ── */}
                    {status !== "idle" && (
                        <div className="cf-status">
                            <div className={`status-badge ${
                                status === "success" ? "status-badge-success"
                                : status === "error" ? "status-badge-error"
                                : "status-badge-pending"}`}>
                                <span className="status-dot" />
                                {status === "pending" && "Submitting to Soroban…"}
                                {status === "success" && "Donation confirmed on-chain"}
                                {status === "error" && (errorMsg || "Donation failed")}
                            </div>
                            {hash && (
                                <div className="tx-hash-box">
                                    <div className="tx-hash-label">Transaction Hash</div>
                                    <div className="tx-hash-value">{hash}</div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className="cf-connect-note">Connect your wallet to donate to this on-chain campaign.</div>
            )}

            {/* ── Live activity feed from contract events ── */}
            {recent.length > 0 && (
                <div className="cf-activity">
                    <div className="cf-activity-head">Live donations</div>
                    {recent.map((d, i) => (
                        <div className="cf-activity-row" key={i}>
                            <span className="cf-activity-addr">{short(d.from)}</span>
                            <span className="cf-activity-amt">+{fmt(d.amount)} XLM</span>
                        </div>
                    ))}
                </div>
            )}

            <a className="cf-contract-link"
                href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`}
                target="_blank" rel="noreferrer">
                Contract {short(CONTRACT_ID)} ↗
            </a>
        </div>
    );
}

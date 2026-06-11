import { useState } from "react";
import LightRays from "./LightRays";
import { connectWallet, fetchBalance, sendPayment } from "./Freighter";

/* ── SVG Icons ── */
const WalletIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/>
        <path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
    </svg>
);
const SendIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
);
const StarIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
);
const ZapIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
);
const ShieldIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
);
const GlobeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
);
const LogoutIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
);
const CheckIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
);
const ClockIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
);
const AlertIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
);

function Header() {
    const [address, setAddress]     = useState("");
    const [balance, setBalance]     = useState("");
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount]       = useState("");
    const [status, setStatus]       = useState("");
    const [hash, setHash]           = useState("");
    const [txHistory, setTxHistory] = useState([]);
    const [errorMsg, setErrorMsg]   = useState("");
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSending, setIsSending]       = useState(false);

    // Load history from localStorage for a given wallet address
    const loadHistory = (pk) => {
        try {
            const saved = localStorage.getItem(`sf_history_${pk}`);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    };

    // Persist a new tx entry to localStorage
    const saveHistory = (pk, entries) => {
        try {
            localStorage.setItem(`sf_history_${pk}`, JSON.stringify(entries));
        } catch {}
    };

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            const pk  = await connectWallet();
            setAddress(pk);
            const bal = await fetchBalance(pk);
            setBalance(Number(bal).toFixed(2));
            // Restore this wallet's history from localStorage
            setTxHistory(loadHistory(pk));
        } catch (e) {
            alert(e.message || "Failed to connect wallet");
        } finally { setIsConnecting(false); }
    };

    const handleDisconnect = () => {
        setAddress(""); setBalance(""); setRecipient("");
        setAmount(""); setStatus(""); setHash("");
        // Keep txHistory in memory for UX; it's already saved in localStorage
        setTxHistory([]);
    };

    const handleSend = async () => {
        if (!recipient || !amount) { alert("Please fill in recipient and amount"); return; }

        // Basic Stellar address validation
        if (!recipient.startsWith("G") || recipient.length !== 56) {
            alert(`Invalid Stellar address.\nAddresses must start with G and be exactly 56 characters.\nYours is ${recipient.length} characters.`);
            return;
        }

        setIsSending(true);
        try {
            setStatus("pending"); setHash("");
            const txHash = await sendPayment(address, recipient, amount);
            setHash(txHash);
            setStatus("success");
            const newEntry = { to: recipient, amount, date: new Date().toLocaleDateString(), hash: txHash };
            const updated  = [newEntry, ...txHistory];
            setTxHistory(updated);
            saveHistory(address, updated);   // persist to localStorage
            setRecipient(""); setAmount("");
            const bal = await fetchBalance(address);
            setBalance(Number(bal).toFixed(2));
        } catch (e) {
            console.error(e);
            setStatus("error");
            setErrorMsg(e?.message || "Transaction failed. Please try again.");
        } finally { setIsSending(false); }
    };

    const short = addr => addr ? `${addr.slice(0,8)}...${addr.slice(-8)}` : "";

    const statusMeta = {
        pending: { cls: "status-badge-pending", icon: <ClockIcon />,  text: "Processing on network..." },
        success: { cls: "status-badge-success", icon: <CheckIcon />,  text: "Transaction confirmed" },
        error:   { cls: "status-badge-error",   icon: <AlertIcon />,  text: errorMsg || "Transaction failed. Try again." },
    };

    /* ════════════════════
       LANDING PAGE
    ════════════════════ */
    if (!address) return (
        <>
            {/* ── Hero Section ── */}
            <section className="lp-hero-section">

                {/* Light Rays WebGL – fills whole hero */}
                <LightRays
                    raysOrigin="top-center"
                    raysColor="#ffffff"
                    raysSpeed={0.8}
                    lightSpread={0.45}
                    rayLength={2.5}
                    followMouse={true}
                    mouseInfluence={0.12}
                    noiseAmount={0}
                    distortion={0}
                    fadeDistance={1}
                    saturation={0.8}
                />

                {/* Glassmorphism Nav */}
                <nav className="lp-nav">
                    <div className="lp-nav-brand">
                        <span className="lp-nav-wordmark">StellarFlow</span>
                    </div>
                    <div className="lp-nav-links">
                        <span className="lp-nav-link" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</span>
                        <span className="lp-nav-link" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>How it works</span>
                        <span className="lp-nav-link" onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}>Get started</span>
                    </div>
                    <button id="btn-connect-nav" className="btn btn-glass-primary" onClick={handleConnect} disabled={isConnecting} style={{ padding: "10px 22px", fontSize: "0.85rem" }}>
                        {isConnecting ? <><span className="spinner"></span> Connecting...</> : <>Connect</>}
                    </button>
                </nav>

                {/* Hero Copy */}
                <div className="lp-hero-content">
                    <div className="lp-hero-pill">
                        <span className="hero-pill-dot"></span>
                        Live on Stellar Testnet
                    </div>
                    <h1 className="lp-hero-title">
                        Send XLM<br />
                        <span className="lp-hero-title-dim">at the speed of light</span>
                    </h1>
                    <p className="lp-hero-sub">
                        StellarFlow is a non-custodial payment dApp built on the Stellar blockchain.
                        Connect your Freighter wallet and send XLM anywhere, instantly.
                    </p>
                    <div className="lp-hero-actions">
                        <button id="btn-connect-hero" className="btn btn-glass-primary btn-lg" onClick={handleConnect} disabled={isConnecting}>
                            {isConnecting ? <><span className="spinner"></span> Connecting...</> : <>Get started</>}
                        </button>
                        <button className="btn btn-glass-secondary btn-lg">Learn more</button>
                    </div>
                </div>

                {/* Stats bar */}
                <div className="lp-stats-bar">
                    <div className="lp-stats-inner">
                        <div className="lp-stat-item">
                            <div className="lp-stat-num">~5s</div>
                            <div className="lp-stat-lbl">Settlement Time</div>
                        </div>
                        <div className="lp-stat-item">
                            <div className="lp-stat-num">$0.00001</div>
                            <div className="lp-stat-lbl">Per Transaction</div>
                        </div>
                        <div className="lp-stat-item">
                            <div className="lp-stat-num">100%</div>
                            <div className="lp-stat-lbl">Non-Custodial</div>
                        </div>
                        <div className="lp-stat-item">
                            <div className="lp-stat-num">Testnet</div>
                            <div className="lp-stat-lbl">Network</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="lp-features" id="features">
                <div className="lp-section-inner">
                    <div className="lp-section-eyebrow">Why StellarFlow</div>
                    <h2 className="lp-section-title">Everything you need<br />to move money fast</h2>
                    <div className="lp-features-grid">
                        <div className="lp-feature-card">
                            <div className="lp-feature-icon lp-feature-icon-purple"><ZapIcon /></div>
                            <div className="lp-feature-title">Instant Finality</div>
                            <div className="lp-feature-desc">Stellar settles transactions in under 5 seconds — no waiting, no uncertainty. Your payment lands instantly.</div>
                        </div>
                        <div className="lp-feature-card">
                            <div className="lp-feature-icon lp-feature-icon-blue"><ShieldIcon /></div>
                            <div className="lp-feature-title">Non-Custodial</div>
                            <div className="lp-feature-desc">Your keys, your coins. StellarFlow never holds or controls your funds. You sign every transaction directly from Freighter.</div>
                        </div>
                        <div className="lp-feature-card">
                            <div className="lp-feature-icon lp-feature-icon-green"><GlobeIcon /></div>
                            <div className="lp-feature-title">Near-Zero Fees</div>
                            <div className="lp-feature-desc">Send XLM for just $0.00001 per transaction. Stellar's efficient consensus makes cross-border payments truly affordable.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── How it Works ── */}
            <section className="lp-how" id="how-it-works">
                <div className="lp-section-inner">
                    <div className="lp-section-eyebrow">How it works</div>
                    <h2 className="lp-section-title">Three simple steps</h2>
                    <div className="lp-steps-grid">
                        <div className="lp-step">
                            <div className="lp-step-num">1</div>
                            <div className="lp-step-title">Install Freighter</div>
                            <div className="lp-step-desc">Download the Freighter browser extension and create or import your Stellar wallet. Switch to Testnet mode.</div>
                        </div>
                        <div className="lp-step">
                            <div className="lp-step-num">2</div>
                            <div className="lp-step-title">Connect your wallet</div>
                            <div className="lp-step-desc">Click "Get started" and approve the connection request in Freighter. Your balance loads automatically.</div>
                        </div>
                        <div className="lp-step">
                            <div className="lp-step-num">3</div>
                            <div className="lp-step-title">Send XLM</div>
                            <div className="lp-step-desc">Enter a recipient address and amount, sign the transaction in Freighter, and watch it settle in seconds.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="lp-cta" id="cta">
                <div className="lp-cta-card">
                    <h2 className="lp-cta-title">Ready to send your first payment?</h2>
                    <p className="lp-cta-sub">Connect your Freighter wallet and experience the speed of Stellar — no sign-up, no custodian, no fees.</p>
                    <button id="btn-connect-cta" className="btn btn-gradient btn-lg" onClick={handleConnect} disabled={isConnecting}>
                        {isConnecting ? <><span className="spinner"></span> Connecting...</> : <>Connect Wallet</>}
                    </button>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="lp-footer">
                <div className="lp-footer-brand">
                    <span className="lp-nav-wordmark" style={{ fontSize: '0.88rem' }}>StellarFlow</span>
                </div>
                <span className="lp-footer-text">Built on Stellar Testnet — for demonstration purposes only</span>
            </footer>
        </>
    );

    /* ════════════════════
       DASHBOARD
    ════════════════════ */
    return (
        <div className="dashboard-page">
            <nav className="dash-nav">
                <div className="dash-nav-brand">
                    <span
                        className="dash-nav-wordmark"
                        onClick={handleDisconnect}
                        style={{ cursor: 'pointer' }}
                        title="Back to home"
                    >StellarFlow</span>
                </div>
                <div className="dash-nav-right">
                    <span className="dash-nav-badge">Testnet</span>
                    <button id="btn-disconnect" className="btn btn-danger-soft" style={{ width: "auto", padding: "8px 16px", fontSize: "0.8rem" }} onClick={handleDisconnect}>
                        <LogoutIcon /> Disconnect
                    </button>
                </div>
            </nav>

            <div className="dash-body">
                {/* ── LEFT ── */}
                <div className="dash-left">
                    <div className="balance-card-wrap">
                        <div className="balance-card">
                            <div className="balance-card-label">Balance</div>
                            <div className="balance-card-amount">
                                <span className="balance-card-currency">XLM</span>
                                <span className="balance-card-number">{balance}</span>
                            </div>
                            <div className="balance-card-dots">{short(address)}</div>
                        </div>
                    </div>

                    <div className="dash-tile">
                        <div className="dash-tile-label">Wallet Address</div>
                        <div className="dash-tile-value">{address.slice(0,14)}...{address.slice(-10)}</div>
                    </div>

                    <div className="activity-card">
                        <div className="activity-head">
                            <span className="activity-head-title">Recent Activity</span>
                        </div>
                        {txHistory.length > 0 ? txHistory.map((tx, i) => (
                            <div className="activity-item" key={i}>
                                <div className="activity-item-left">
                                    <span className="activity-item-name">Transfer</span>
                                    <span className="activity-item-date">{tx.date}</span>
                                </div>
                                <span className="activity-item-amount debit">- {tx.amount} XLM</span>
                            </div>
                        )) : (
                            <p className="activity-empty">No transactions yet</p>
                        )}
                    </div>
                </div>

                {/* ── RIGHT ── */}
                <div className="dash-right">
                    <div className="send-panel">
                        <div className="send-panel-title">Transfer XLM</div>
                        <div className="send-panel-sub">Send to any Stellar address on the Testnet</div>

                        <div className="send-field">
                            <label>Recipient Address</label>
                            <div className="send-input-wrap">
                                <input id="input-recipient" type="text" placeholder="G... full Stellar address"
                                    value={recipient}
                                    onChange={e => setRecipient(e.target.value.trim())}
                                />
                            </div>
                        </div>

                        <div className="send-field">
                            <label>Amount</label>
                            <div className="send-input-wrap">
                                <span className="send-input-prefix">XLM</span>
                                <input id="input-amount" type="number" placeholder="0.00"
                                    value={amount} onChange={e => setAmount(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="send-field">
                            <label>Description (optional)</label>
                            <div className="send-input-wrap">
                                <input type="text" placeholder="Payment for..." />
                            </div>
                        </div>

                        <button id="btn-send" className="btn btn-gradient btn-full" onClick={handleSend} disabled={isSending}>
                            {isSending ? <><span className="spinner"></span> Sending...</> : <><SendIcon /> Process Transfer</>}
                        </button>
                    </div>

                    {status && (
                        <div className="status-panel">
                            <div className="status-panel-title">Transaction Status</div>
                            <div className={`status-badge ${statusMeta[status].cls}`}>
                                <span className="status-dot"></span>
                                {statusMeta[status].icon}
                                {statusMeta[status].text}
                            </div>
                            {hash && (
                                <div className="tx-hash-box">
                                    <div className="tx-hash-label">Transaction Hash</div>
                                    <div className="tx-hash-value">{hash}</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Header;
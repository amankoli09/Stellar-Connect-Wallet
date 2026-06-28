import { useState, useEffect } from "react";
import LightRays from "./LightRays";
import Terminal from "./Terminal";
import Crowdfund from "./Crowdfund";
import Reveal from "./Reveal";
import Counter from "./Counter";
import FAQ from "./FAQ";
import Contracts from "./Contracts";
import Roadmap from "./Roadmap";
import Testimonials from "./Testimonials";
import MagicRings from "./MagicRings";
import Analytics from "./Analytics";
import OnboardingModal, { shouldShowOnboarding } from "./OnboardingModal";
import coinsImg from "../media/landphoto.png";
import logoImg from "../media/logo.png";
import { connectWallet, fetchBalance, sendPayment } from "./Freighter";

/* ── SVG Icons ── */
const SendIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
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
const LayersIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
    </svg>
);
const KeyIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
    </svg>
);
const ArrowRightIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
);
const TwitterIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 1.2h3.7l-8 9.1L24 22.8h-7.4l-5.8-7.5-6.6 7.5H.5l8.5-9.7L0 1.2h7.6l5.2 6.9zM17.6 20.6h2L6.5 3.3H4.3z"/></svg>
);
const GithubIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.4.5 0 5.9 0 12.5c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.4-.5-1.6.2-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.6.2 2.8.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 24 12.5C24 5.9 18.6.5 12 .5z"/></svg>
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
    const [scrolled, setScrolled]         = useState(false);
    const [walletPrompt, setWalletPrompt] = useState(null); // { title, message, showInstall }
    const [coinsOk, setCoinsOk]           = useState(true);  // hero coins image present?
    const [showOnboarding, setShowOnboarding] = useState(false); // first-visit guide

    // Sticky-nav: add a solid background once the user scrolls past the hero top.
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // First-visit onboarding modal
    useEffect(() => {
        const t = setTimeout(() => { if (shouldShowOnboarding()) setShowOnboarding(true); }, 1200);
        return () => clearTimeout(t);
    }, []);

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
            // Show a friendly in-app modal instead of a raw alert. Missing
            // wallet → offer the install link; anything else → explain & retry.
            setWalletPrompt({
                title: e?.code === "NotInstalled" ? "Wallet not detected" : "Couldn't connect",
                message: e?.message || "Failed to connect wallet. Please try again.",
                showInstall: e?.code === "NotInstalled",
            });
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

    const refreshBalance = async () => {
        if (!address) return;
        try {
            const bal = await fetchBalance(address);
            setBalance(Number(bal).toFixed(2));
        } catch (e) { console.warn("balance refresh failed", e); }
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
            {/* Onboarding modal — shown on first visit */}
            {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}

            {/* Decorative background orbs */}
            <div className="lp-orb lp-orb-1" />
            <div className="lp-orb lp-orb-2" />

            {/* ── Wallet prompt modal (missing extension / connect error) ── */}
            {walletPrompt && (
                <div className="wallet-modal-overlay" onClick={() => setWalletPrompt(null)}>
                    <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="wallet-modal-close" onClick={() => setWalletPrompt(null)} aria-label="Close">×</button>
                        <div className="wallet-modal-icon"><KeyIcon /></div>
                        <h3 className="wallet-modal-title">{walletPrompt.title}</h3>
                        <p className="wallet-modal-text">{walletPrompt.message}</p>
                        <div className="wallet-modal-actions">
                            {walletPrompt.showInstall && (
                                <a className="btn btn-gradient" href="https://www.freighter.app/" target="_blank" rel="noreferrer">
                                    Install Freighter <ArrowRightIcon />
                                </a>
                            )}
                            <button className="btn btn-glass-secondary" onClick={() => setWalletPrompt(null)}>
                                {walletPrompt.showInstall ? "Maybe later" : "Got it"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Framed hero panel (ChainFund-style) ── */}
            <section className="lp-hero-section">

                {/* Light Rays WebGL – spotlight beams down onto the coins on the right */}
                <LightRays
                    raysOrigin="top-right"
                    raysColor="#6a8dff"
                    raysSpeed={0.8}
                    lightSpread={0.5}
                    rayLength={2.8}
                    followMouse={true}
                    mouseInfluence={0.12}
                    noiseAmount={0}
                    distortion={0}
                    fadeDistance={1.1}
                    saturation={1}
                />

                {/* Perspective grid floor */}
                <div className="lp-hero-grid" />

                {/* In-panel nav */}
                <nav className={`cf-nav ${scrolled ? "cf-nav-scrolled" : ""}`}>
                    <div className="cf-nav-brand">
                        <img className="cf-nav-logo" src={logoImg} alt="StellarFlow logo" />
                        <span className="cf-nav-wordmark">StellarFlow</span>
                    </div>
                    <div className="cf-nav-pill">
                        <span className="cf-nav-link cf-nav-active" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</span>
                        <span className="cf-nav-link" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</span>
                        <span className="cf-nav-link" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>How it works</span>
                        <span className="cf-nav-link" onClick={() => document.getElementById('campaign')?.scrollIntoView({ behavior: 'smooth' })}>Crowdfund</span>
                        <span className="cf-nav-link" onClick={() => document.getElementById('analytics')?.scrollIntoView({ behavior: 'smooth' })}>Analytics</span>
                        <span className="cf-nav-link" onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}>FAQ</span>
                    </div>
                    <button id="btn-connect-nav" className="cf-nav-cta" onClick={handleConnect} disabled={isConnecting}>
                        {isConnecting ? <><span className="spinner"></span> Connecting…</> : "Connect Wallet"}
                    </button>
                </nav>

                {/* Hero — copy left, lit coins right */}
                <div className="cf-hero">
                    <div className="cf-hero-copy">
                        <div className="hero-eyebrow">[ Live on Stellar Testnet ]</div>
                        <h1 className="hero-h1">
                            Send money<br />
                            Beyond Borders
                        </h1>
                        <p className="cf-sub">
                            Non-custodial payments and on-chain<br />
                            crowdfunding, powered by Stellar &amp; Soroban.
                        </p>
                        <button id="btn-connect-hero" className="btn btn-glass-primary cf-cta" onClick={handleConnect} disabled={isConnecting}>
                            {isConnecting ? <><span className="spinner"></span> Connecting…</> : <>Get Started <ArrowRightIcon /></>}
                        </button>
                    </div>

                    <Reveal className="cf-hero-visual" delay={120}>
                        <div className="hero-coins-glow" />
                        {coinsOk ? (
                            <img
                                className="hero-coins"
                                src={coinsImg}
                                alt="Floating crypto coins"
                                onError={() => setCoinsOk(false)}
                            />
                        ) : (
                            <div className="app-preview">
                                <div className="app-preview-bar">
                                    <span className="app-preview-dot ap-red" />
                                    <span className="app-preview-dot ap-yellow" />
                                    <span className="app-preview-dot ap-green" />
                                    <span className="app-preview-url">app.stellarflow.xyz</span>
                                </div>
                                <div className="app-preview-body">
                                    <div className="ap-balance">
                                        <span className="ap-balance-lbl">Total Balance</span>
                                        <div className="ap-balance-amt">10,000.00 <span>XLM</span></div>
                                        <span className="ap-balance-chg">▲ 2.4% this week</span>
                                    </div>
                                    <div className="ap-actions">
                                        <div className="ap-btn ap-btn-primary"><SendIcon /> Send</div>
                                        <div className="ap-btn">Receive</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Reveal>
                </div>

                {/* Bottom feature row */}
                <div className="cf-hero-features">
                    <div className="cf-hf">
                        <span className="cf-hf-ic"><ZapIcon /></span>
                        <div className="cf-hf-text">
                            <b>Instant Settlement</b>
                            <p>Payments finalize in about five seconds on Stellar</p>
                        </div>
                    </div>
                    <div className="cf-hf">
                        <span className="cf-hf-ic"><ShieldIcon /></span>
                        <div className="cf-hf-text">
                            <b>Non-Custodial</b>
                            <p>Your keys, your coins — you sign every transaction</p>
                        </div>
                    </div>
                    <div className="cf-hf">
                        <span className="cf-hf-ic"><LayersIcon /></span>
                        <div className="cf-hf-text">
                            <b>On-Chain Crowdfunding</b>
                            <p>Donate through real Soroban smart contracts</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Features (bento) ── */}
            <section className="lp-features" id="features">
                <div className="lp-section-inner">
                    <Reveal className="cf-sec-head">
                        <div className="cf-sec-head-left">
                            <div className="hero-eyebrow">[ Why StellarFlow? ]</div>
                            <h2 className="lp-section-title">Everything you need<br />to move money fast</h2>
                        </div>
                        <div className="cf-sec-head-right">
                            <p className="cf-sec-head-text">
                                StellarFlow merges fast, non-custodial payments with real on-chain
                                smart contracts — unlocking trustless transfers and crowdfunding on Stellar.
                            </p>
                        </div>
                    </Reveal>
                    <div className="cf-bento">
                        {/* left column */}
                        <Reveal className="bento-card">
                            <div className="lp-feature-icon"><ZapIcon /></div>
                            <div className="lp-feature-title">Instant finality</div>
                            <div className="lp-feature-desc">Stellar reaches consensus in about 5 seconds, so your payment is final almost instantly — no block-confirmation waiting.</div>
                        </Reveal>
                        <Reveal className="bento-card" delay={80}>
                            <div className="lp-feature-icon"><KeyIcon /></div>
                            <div className="lp-feature-title">Non-custodial</div>
                            <div className="lp-feature-desc">Your keys, your coins. You sign every transaction in Freighter — we never touch your funds.</div>
                        </Reveal>

                        {/* center — chip animation card */}
                        <Reveal className="bento-card bento-center" delay={120}>
                            <div className="lp-feature-icon"><LayersIcon /></div>
                            <div className="lp-feature-title">Real Soroban smart contracts</div>
                            <div className="lp-feature-desc">More than payments — a live crowdfunding contract on Testnet, with on-chain donations, events, and inter-contract calls.</div>
                            <div className="chip-stage">
                                <div className="chip-trace chip-trace-l1" />
                                <div className="chip-trace chip-trace-l2" />
                                <div className="chip-trace chip-trace-r1" />
                                <div className="chip-trace chip-trace-r2" />
                                <div className="chip-beam" />
                                <div className="chip-core">
                                    <span className="chip-corner chip-corner-tl" />
                                    <span className="chip-corner chip-corner-br" />
                                    <LayersIcon />
                                </div>
                            </div>
                        </Reveal>

                        {/* right column */}
                        <Reveal className="bento-card" delay={160}>
                            <div className="lp-feature-icon"><GlobeIcon /></div>
                            <div className="lp-feature-title">Near-zero fees</div>
                            <div className="lp-feature-desc">Send XLM for ~$0.00001. Cross-border payments that actually make sense.</div>
                        </Reveal>
                        <Reveal className="bento-card" delay={200}>
                            <div className="lp-feature-icon"><ShieldIcon /></div>
                            <div className="lp-feature-title">Audited primitives</div>
                            <div className="lp-feature-desc">Built on Stellar's battle-tested SDK and the native token interface.</div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ── How it Works ── */}
            <section className="lp-how" id="how-it-works">
                <div className="lp-section-inner">
                    <Reveal>
                        <div className="lp-section-eyebrow">How it works</div>
                        <h2 className="lp-section-title">Three simple steps</h2>
                    </Reveal>
                    <div className="lp-steps-grid">
                        <Reveal className="lp-step">
                            <div className="lp-step-num">1</div>
                            <div className="lp-step-title">Install Freighter</div>
                            <div className="lp-step-desc">Download the Freighter browser extension and create or import your Stellar wallet. Switch to Testnet mode.</div>
                        </Reveal>
                        <Reveal className="lp-step" delay={120}>
                            <div className="lp-step-num">2</div>
                            <div className="lp-step-title">Connect your wallet</div>
                            <div className="lp-step-desc">Click "Launch app" and approve the connection request in Freighter. Your balance loads automatically.</div>
                        </Reveal>
                        <Reveal className="lp-step" delay={240}>
                            <div className="lp-step-num">3</div>
                            <div className="lp-step-title">Send &amp; fund</div>
                            <div className="lp-step-desc">Send XLM to any address or donate to the on-chain campaign — sign in Freighter and watch it settle in seconds.</div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ── Terminal Demo ── */}
            <section className="lp-terminal" id="terminal">
                <div className="lp-terminal-rings">
                    <MagicRings
                        color="#5b7cff"
                        colorTwo="#6a8dff"
                        ringCount={6}
                        speed={1}
                        attenuation={10}
                        lineThickness={2}
                        baseRadius={0.35}
                        radiusStep={0.1}
                        scaleRate={0.1}
                        opacity={0.7}
                        noiseAmount={0.08}
                        ringGap={1.5}
                        fadeIn={0.7}
                        fadeOut={0.5}
                        followMouse={true}
                        mouseInfluence={0.2}
                        parallax={0.05}
                    />
                </div>
                <div className="lp-terminal-inner">
                    <Reveal>
                        <div className="lp-section-eyebrow">Live demo</div>
                        <h2 className="lp-section-title">See it in action</h2>
                    </Reveal>
                    <Reveal delay={120}><Terminal /></Reveal>
                </div>
            </section>

            {/* ── Live On-chain Campaign ── */}
            <section className="lp-campaign" id="campaign">
                <div className="lp-campaign-inner">
                    <Reveal className="lp-campaign-copy">
                        <div className="lp-section-eyebrow">[ Powered by Soroban ]</div>
                        <h2 className="lp-section-title">Crowdfunding that lives<br />entirely on-chain</h2>
                        <p className="lp-campaign-text">
                            No middlemen, no backend. Every donation is a Soroban contract call —
                            funds settle trustlessly inside the contract, the bar you see updates
                            straight from on-chain events, and only the beneficiary can withdraw.
                        </p>
                        <div className="lp-campaign-points">
                            <div className="lp-campaign-point"><CheckIcon /> Donations are signed by you, settled on-chain</div>
                            <div className="lp-campaign-point"><CheckIcon /> Progress streams live from contract events</div>
                            <div className="lp-campaign-point"><CheckIcon /> Verifiable on the public ledger</div>
                        </div>
                    </Reveal>
                    <Reveal delay={120}><Crowdfund address={null} /></Reveal>
                </div>
            </section>

            {/* ── Smart Contracts ── */}
            <section className="lp-contracts" id="contracts">
                <div className="lp-section-inner">
                    <Reveal>
                        <div className="lp-section-eyebrow">On-chain architecture</div>
                        <h2 className="lp-section-title">Two contracts, talking to each other</h2>
                        <p className="lp-faq-sub">StellarFund and DonorBadge are live Soroban contracts — every donation triggers a real cross-contract call.</p>
                    </Reveal>
                    <Reveal delay={120}><Contracts /></Reveal>
                </div>
            </section>

            {/* ── Roadmap ── */}
            <section className="lp-roadmap" id="roadmap">
                <div className="lp-section-inner">
                    <Reveal>
                        <div className="lp-section-eyebrow">Roadmap</div>
                        <h2 className="lp-section-title">Where StellarFlow is headed</h2>
                    </Reveal>
                    <Reveal delay={120}><Roadmap /></Reveal>
                </div>
            </section>

            {/* ── Metrics band ── */}
            <section className="lp-metrics">
                <div className="lp-section-inner lp-metrics-grid">
                    <Reveal className="metric">
                        <div className="metric-num"><Counter to={5} decimals={1} prefix="~" suffix="s" /></div>
                        <div className="metric-lbl">Avg. settlement</div>
                    </Reveal>
                    <Reveal className="metric" delay={80}>
                        <div className="metric-num"><Counter to={0.00001} decimals={5} prefix="$" /></div>
                        <div className="metric-lbl">Network fee</div>
                    </Reveal>
                    <Reveal className="metric" delay={160}>
                        <div className="metric-num"><Counter to={180} suffix="+" /></div>
                        <div className="metric-lbl">Countries reachable</div>
                    </Reveal>
                    <Reveal className="metric" delay={240}>
                        <div className="metric-num"><Counter to={99.9} decimals={1} suffix="%" /></div>
                        <div className="metric-lbl">Network uptime</div>
                    </Reveal>
                </div>
            </section>

            {/* ── Testimonials ── */}
            <section className="lp-testimonials" id="testimonials">
                <div className="lp-section-inner">
                    <Reveal>
                        <div className="lp-section-eyebrow">Loved by builders</div>
                        <h2 className="lp-section-title">What people are saying</h2>
                    </Reveal>
                    <Reveal delay={120}><Testimonials /></Reveal>
                </div>
            </section>

            {/* ── Live Analytics Dashboard ── */}
            <section className="lp-analytics" id="analytics">
                <div className="lp-section-inner">
                    <Reveal>
                        <div className="lp-section-eyebrow">On-chain data</div>
                        <h2 className="lp-section-title">Live campaign analytics</h2>
                    </Reveal>
                    <Reveal delay={120}><Analytics /></Reveal>
                </div>
            </section>

            {/* ── Feedback ── */}
            <section className="lp-feedback" id="feedback">
                <div className="lp-section-inner">
                    <Reveal className="lp-feedback-head">
                        <div className="lp-section-eyebrow">Community</div>
                        <h2 className="lp-section-title">Join 50+ beta testers</h2>
                        <p className="lp-faq-sub">Share your wallet address and feedback to help shape StellarFlow. Your input directly drives our next features.</p>
                    </Reveal>
                    <Reveal delay={120}>
                        <div className="feedback-panel">
                            <div className="feedback-panel-left">
                                <div className="feedback-stat"><span className="feedback-stat-num">50+</span><span className="feedback-stat-lbl">Beta users onboarded</span></div>
                                <div className="feedback-stat"><span className="feedback-stat-num">4.8★</span><span className="feedback-stat-lbl">Avg. satisfaction score</span></div>
                                <div className="feedback-stat"><span className="feedback-stat-num">100%</span><span className="feedback-stat-lbl">Non-custodial, always</span></div>
                                <a
                                    href="https://docs.google.com/forms/d/e/1FAIpQLSf-PLACEHOLDER/viewform"
                                    target="_blank"
                                    rel="noreferrer"
                                    id="btn-feedback"
                                    className="btn btn-gradient"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 8 }}
                                >
                                    Fill User Feedback Form <ArrowRightIcon />
                                </a>
                                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
                                    Takes ~2 minutes · Wallet address + rating required
                                </p>
                            </div>
                            <div className="feedback-panel-right">
                                <div className="feedback-steps">
                                    <div className="feedback-step"><span className="feedback-step-num">1</span><div><b>Connect Freighter</b><p>Switch to Testnet and connect your wallet</p></div></div>
                                    <div className="feedback-step"><span className="feedback-step-num">2</span><div><b>Make a transaction</b><p>Send XLM or donate to the crowdfund campaign</p></div></div>
                                    <div className="feedback-step"><span className="feedback-step-num">3</span><div><b>Submit feedback</b><p>Fill the Google Form — takes 2 minutes</p></div></div>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section className="lp-faq" id="faq">
                <div className="lp-section-inner lp-faq-inner">
                    <Reveal className="lp-faq-head">
                        <div className="lp-section-eyebrow">FAQ</div>
                        <h2 className="lp-section-title">Questions, answered</h2>
                        <p className="lp-faq-sub">Everything you might want to know before you connect.</p>
                    </Reveal>
                    <Reveal delay={120}><FAQ /></Reveal>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="lp-cta" id="cta">
                <Reveal className="lp-cta-card">
                    <h2 className="lp-cta-title">Ready to send your first payment?</h2>
                    <p className="lp-cta-sub">Connect your Freighter wallet and experience the speed of Stellar — no sign-up, no custodian, no fees.</p>
                    <button id="btn-connect-cta" className="btn btn-gradient btn-lg" onClick={handleConnect} disabled={isConnecting}>
                        {isConnecting ? <><span className="spinner"></span> Connecting...</> : <>Connect Wallet <ArrowRightIcon /></>}
                    </button>
                </Reveal>
            </section>

            {/* ── Footer ── */}
            <footer className="lp-footer">
                <div className="lp-footer-top">
                    <div className="lp-footer-brand-col">
                        <div className="lp-footer-brand">
                            <img className="cf-nav-logo" src={logoImg} alt="StellarFlow logo" />
                            <span className="lp-nav-wordmark" style={{ fontSize: '1rem' }}>StellarFlow</span>
                        </div>
                        <p className="lp-footer-tagline">Non-custodial payments &amp; on-chain crowdfunding, built on Stellar.</p>
                        <div className="lp-footer-socials">
                            <a href="https://github.com" target="_blank" rel="noreferrer" className="lp-footer-social"><GithubIcon /></a>
                            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="lp-footer-social"><TwitterIcon /></a>
                        </div>
                    </div>
                    <div className="lp-footer-links-cols">
                        <div className="lp-footer-col">
                            <span className="lp-footer-col-title">Product</span>
                            <span className="lp-footer-link" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</span>
                            <span className="lp-footer-link" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>How it works</span>
                            <span className="lp-footer-link" onClick={() => document.getElementById('campaign')?.scrollIntoView({ behavior: 'smooth' })}>Crowdfund</span>
                        </div>
                        <div className="lp-footer-col">
                            <span className="lp-footer-col-title">Resources</span>
                            <a className="lp-footer-link" href="https://developers.stellar.org" target="_blank" rel="noreferrer">Stellar Docs</a>
                            <a className="lp-footer-link" href="https://www.freighter.app" target="_blank" rel="noreferrer">Freighter Wallet</a>
                            <a className="lp-footer-link" href="https://stellar.expert/explorer/testnet" target="_blank" rel="noreferrer">Testnet Explorer</a>
                        </div>
                        <div className="lp-footer-col">
                            <span className="lp-footer-col-title">Get started</span>
                            <span className="lp-footer-link" onClick={handleConnect}>Connect wallet</span>
                            <span className="lp-footer-link" onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}>FAQ</span>
                        </div>
                    </div>
                </div>
                <div className="lp-footer-bottom">
                    <span className="lp-footer-text">© 2026 StellarFlow — built on Stellar Testnet for demonstration purposes.</span>
                    <span className="lp-footer-text">Made with Soroban &amp; React</span>
                </div>
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

                    {/* On-chain crowdfunding via the deployed Soroban contract */}
                    <Crowdfund address={address} onDonated={refreshBalance} />
                </div>
            </div>
        </div>
    );
}

export default Header;
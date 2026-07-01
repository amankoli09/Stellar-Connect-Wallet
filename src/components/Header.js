import { useState, useEffect } from "react";
import { 
    Home, Send as SendIconLucide, Download, RefreshCw, Clock, Users, BarChart2, 
    Settings, ExternalLink, ArrowRight, Bell, LogOut, ChevronDown, ChevronRight, Eye, EyeOff, 
    Copy as CopyIcon, QrCode, CreditCard, Layers, ArrowUpRight, ArrowDownLeft 
} from "lucide-react";
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
import logoImg from "../media/LynxX.png";
import earthImg from "../media/earth.png";
import { connectWallet, fetchBalance, sendPayment } from "./Wallet";
import MarketAnalytics from "./MarketAnalytics";

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
    const [activeView, setActiveView] = useState("home"); // "home" | "analytics"
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

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
        if (!recipient || !amount) { showToast("Please fill in recipient and amount"); return; }

        // Basic Stellar address validation
        if (!recipient.startsWith("G") || recipient.length !== 56) {
            showToast(`Invalid Stellar address.`);
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
            showToast("Transaction successful!", "success");
        } catch (e) {
            console.error(e);
            setStatus("error");
            showToast(e?.message || "Transaction failed. Please try again.", "error");
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
                        <img className="cf-nav-logo" src={logoImg} alt="LynxX logo" onClick={() => setActiveView('home')} style={{cursor: 'pointer'}} />
                    </div>
                    <div className="cf-nav-pill">
                        <span className={`cf-nav-link ${activeView === 'home' ? 'cf-nav-active' : ''}`} onClick={() => { setActiveView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</span>
                        <span className="cf-nav-link" onClick={() => { setActiveView('home'); setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>Features</span>
                        <span className="cf-nav-link" onClick={() => { setActiveView('home'); setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>How it works</span>
                        <span className="cf-nav-link" onClick={() => { setActiveView('home'); setTimeout(() => document.getElementById('campaign')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>Crowdfund</span>
                        <span className={`cf-nav-link ${activeView === 'analytics' ? 'cf-nav-active' : ''}`} onClick={() => { setActiveView('analytics'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Analytics</span>
                        <span className="cf-nav-link" onClick={() => { setActiveView('home'); setTimeout(() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>FAQ</span>
                    </div>
                    <button id="btn-connect-nav" className="cf-nav-cta" onClick={handleConnect} disabled={isConnecting}>
                        {isConnecting ? <><span className="spinner"></span> Connecting…</> : "Connect Wallet"}
                    </button>
                </nav>

                {activeView === 'analytics' ? (
                    <MarketAnalytics />
                ) : (
                    <>
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
                                    <span className="app-preview-url">app.lynxx.xyz</span>
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
                </>
                )}
            </section>

            {activeView === 'home' && (
                <>
                {/* ── Features (bento) ── */}
                <section className="lp-features" id="features">
                <div className="lp-section-inner">
                    <Reveal className="cf-sec-head">
                        <div className="cf-sec-head-left">
                            <div className="hero-eyebrow">[ Why LynxX? ]</div>
                            <h2 className="lp-section-title">Everything you need<br />to move money fast</h2>
                        </div>
                        <div className="cf-sec-head-right">
                            <p className="cf-sec-head-text">
                                LynxX merges fast, non-custodial payments with real on-chain
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
                        <h2 className="lp-section-title">Where LynxX is headed</h2>
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
                        <p className="lp-faq-sub">Share your wallet address and feedback to help shape LynxX. Your input directly drives our next features.</p>
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
            </>
            )}

            {/* ── Footer ── */}
            <footer className="lp-footer">
                <div className="lp-footer-top">
                    <div className="lp-footer-brand-col">
                        <div className="lp-footer-brand">
                            <img className="cf-nav-logo" src={logoImg} alt="LynxX logo" />
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
                            <span className="lp-footer-link" onClick={() => { setActiveView('home'); setTimeout(() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }), 50); }}>FAQ</span>
                        </div>
                    </div>
                </div>
                <div className="lp-footer-bottom">
                    <span className="lp-footer-text">© 2026 LynxX — built on Stellar Testnet for demonstration purposes.</span>
                    <span className="lp-footer-text">Made with Soroban &amp; React</span>
                </div>
            </footer>
        </>
    );

    /* ════════════════════
       BENTO DASHBOARD
    ════════════════════ */
    return (
        <div className="bento-dashboard-page">
            {/* Sidebar */}
            <aside className="bento-sidebar">
                <div className="bento-logo">
                    <img 
                        src={logoImg} 
                        alt="LynxX logo" 
                        onClick={handleDisconnect}
                        style={{ cursor: 'pointer', height: '36px' }}
                    />
                </div>
                <nav className="bento-nav">
                    <a href="#" className="bento-nav-item active" onClick={e => e.preventDefault()}><Home size={20} /> Dashboard</a>
                    <a href="#" className="bento-nav-item" onClick={e => e.preventDefault()}><SendIconLucide size={20} /> Send</a>
                    <a href="#" className="bento-nav-item" onClick={e => e.preventDefault()}><Download size={20} /> Receive</a>
                    <a href="#" className="bento-nav-item" onClick={e => e.preventDefault()}><RefreshCw size={20} /> Swap</a>
                    <a href="#" className="bento-nav-item" onClick={e => e.preventDefault()}><Clock size={20} /> Activity</a>
                    <a href="#" className="bento-nav-item" onClick={e => e.preventDefault()}><Users size={20} /> Contacts</a>
                    <a href="#" className="bento-nav-item" onClick={() => setActiveView('analytics')}><BarChart2 size={20} /> Analytics</a>
                    <a href="#" className="bento-nav-item" onClick={e => e.preventDefault()}><Settings size={20} /> Settings</a>
                </nav>
                
                <div className="bento-sidebar-bottom">
                    <div className="bento-network-badge">
                        <span className="bento-dot"></span> Testnet Connected
                    </div>
                    <div className="bento-address-pill">
                        <span>{address.slice(0, 6)}...{address.slice(-5)}</span> <ExternalLink size={14} />
                    </div>
                    <div className="bento-help-card">
                        <h5>Need Help?</h5>
                        <p>Visit our docs or get support from our team.</p>
                        <ArrowRight size={16} />
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="bento-main">
                {/* Top Header */}
                <header className="bento-header">
                    <div className="bento-header-left"></div>
                    <div className="bento-header-right">
                        <Bell size={20} className="bento-icon-btn" />
                        <button className="bento-btn-outline" onClick={handleDisconnect}>
                            <LogOut size={16} /> Disconnect
                        </button>
                        <div className="bento-avatar-pill">
                            <div className="bento-avatar gradient-1"></div>
                            {address.slice(0, 6)}...{address.slice(-5)} <ChevronDown size={16} />
                        </div>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <div className="bento-grid">
                    {/* Column 1 */}
                    <div className="bento-col bento-col-1">
                        {/* Total Balance */}
                        <div className="bento-card bento-balance-card">
                            <div className="bento-card-header">
                                Total Balance <Eye size={16} className="text-muted" /> <EyeOff size={16} className="text-muted" />
                            </div>
                            <div className="bento-balance-amount">{balance} <span>XLM</span></div>
                            <div className="bento-balance-usd">≈ ${(balance * 0.328).toFixed(2)} USD</div>
                            
                            {/* Mock Sparkline */}
                            <div className="bento-sparkline">
                                <svg viewBox="0 0 100 40" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="rgba(77,107,255,0.4)" />
                                            <stop offset="100%" stopColor="rgba(77,107,255,0)" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,35 C10,25 20,40 30,20 C40,0 50,25 60,10 C70,0 80,20 90,5 L100,0 L100,40 L0,40 Z" fill="url(#sparklineGrad)" />
                                    <path d="M0,35 C10,25 20,40 30,20 C40,0 50,25 60,10 C70,0 80,20 90,5 L100,0" fill="none" stroke="#4d6bff" strokeWidth="2.5" />
                                </svg>
                            </div>
                            <div className="bento-timeframes">
                                <span className="active">1D</span><span>7D</span><span>30D</span><span>1Y</span><span>All</span>
                            </div>
                        </div>

                        {/* Wallet Address */}
                        <div className="bento-card bento-address-card">
                            <div className="bento-card-title mb-12">Wallet Address</div>
                            <div className="bento-address-box">
                                {address.slice(0, 14)}...{address.slice(-10)} <CopyIcon size={16} />
                            </div>
                            <div className="bento-address-actions">
                                <button><CopyIcon size={14} /> Copy</button>
                                <button><QrCode size={14} /> QR Code</button>
                                <button><ExternalLink size={14} /> View on Explorer</button>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bento-card bento-activity-card">
                            <div className="bento-card-header mb-16">
                                <span className="bento-card-title">Recent Activity</span>
                                <a href="#" className="bento-view-all">View All</a>
                            </div>
                            <div className="bento-activity-list">
                                {txHistory.length > 0 ? txHistory.map((tx, i) => (
                                    <div className="bento-activity-item" key={i}>
                                        <div className="bento-act-icon red"><ArrowUpRight size={16} /></div>
                                        <div className="bento-act-info">
                                            <div className="bento-act-title">Sent</div>
                                            <div className="bento-act-sub">To {tx.recipient ? short(tx.recipient) : "Stellar address"}</div>
                                        </div>
                                        <div className="bento-act-amount negative">- {tx.amount} XLM<br/><span>{tx.date}</span></div>
                                    </div>
                                )) : (
                                    <>
                                        <div className="bento-activity-item">
                                            <div className="bento-act-icon green"><ArrowDownLeft size={16} /></div>
                                            <div className="bento-act-info">
                                                <div className="bento-act-title">Received</div>
                                                <div className="bento-act-sub">From GDZ5...F3T2</div>
                                            </div>
                                            <div className="bento-act-amount positive">+120.50 XLM<br/><span>2m ago</span></div>
                                        </div>
                                        <div className="bento-activity-item">
                                            <div className="bento-act-icon purple"><RefreshCw size={16} /></div>
                                            <div className="bento-act-info">
                                                <div className="bento-act-title">Swap</div>
                                                <div className="bento-act-sub">XLM → USDC</div>
                                            </div>
                                            <div className="bento-act-amount positive">+24.32 USDC<br/><span>3h ago</span></div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Column 2 */}
                    <div className="bento-col bento-col-2">
                        {/* Quick Actions Row */}
                        <div className="bento-quick-actions">
                            <div className="bento-qa-item"><div className="bento-qa-icon blue"><SendIconLucide size={20} /></div> Send</div>
                            <div className="bento-qa-item"><div className="bento-qa-icon outline"><Download size={20} /></div> Receive</div>
                            <div className="bento-qa-item"><div className="bento-qa-icon outline"><RefreshCw size={20} /></div> Swap</div>
                            <div className="bento-qa-item"><div className="bento-qa-icon outline"><CreditCard size={20} /></div> Buy</div>
                            <div className="bento-qa-item"><div className="bento-qa-icon outline"><Layers size={20} /></div> Stake</div>
                        </div>

                        {/* Send XLM Card */}
                        <div className="bento-card bento-send-card">
                            <div className="bento-card-header">
                                <span className="bento-card-title">Send XLM</span>
                                <span className="bento-card-sub text-muted">Recent <ChevronDown size={14} /></span>
                            </div>
                            <div className="bento-card-desc mb-16 text-muted" style={{fontSize: '0.85rem'}}>Send to any Stellar address on the Testnet</div>
                            
                            <div className="bento-recent-contact mb-20">
                                <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=GDZ5" alt="avatar" className="bento-contact-avatar" />
                                <div className="bento-contact-info">
                                    <div className="bento-contact-name">GDZ5...F3T2 <span className="badge">Friend</span></div>
                                    <div className="bento-contact-sub">GDonald | @gdwx.test</div>
                                </div>
                                <ChevronRight size={16} className="text-muted" />
                            </div>

                            <div className="send-field mb-16">
                                <label>Recipient Address</label>
                                <div className="send-input-wrap">
                                    <input id="input-recipient" type="text" placeholder="G... full Stellar address"
                                        value={recipient}
                                        onChange={e => setRecipient(e.target.value.trim())}
                                    />
                                </div>
                            </div>

                            <div className="send-field mb-16">
                                <label>Amount</label>
                                <div className="send-input-wrap amount-wrap">
                                    <span className="bento-pill-prefix">XLM</span>
                                    <input id="input-amount" type="number" placeholder="0.00"
                                        value={amount} onChange={e => setAmount(e.target.value)}
                                    />
                                    <span className="bento-usd-suffix">≈ ${(amount * 0.328).toFixed(2)} USD</span>
                                </div>
                            </div>

                            <div className="send-field mb-20">
                                <label>Memo (optional)</label>
                                <div className="send-input-wrap">
                                    <input type="text" placeholder="What's this for?" />
                                </div>
                            </div>

                            <button id="btn-send" className="btn btn-primary bento-submit-btn" onClick={handleSend} disabled={isSending}>
                                {isSending ? <><span className="spinner"></span> Sending...</> : <>Review Transfer <ArrowRight size={16} /></>}
                            </button>

                            {status && (
                                <div className="status-panel mt-16">
                                    <div className={`status-badge ${statusMeta[status].cls}`}>
                                        <span className="status-dot"></span>
                                        {statusMeta[status].icon}
                                        {statusMeta[status].text}
                                    </div>
                                    {hash && (
                                        <div className="tx-hash-box mt-8">
                                            <div className="tx-hash-label">Transaction Hash</div>
                                            <div className="tx-hash-value" style={{fontSize: '0.75rem'}}>{hash}</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Portfolio Card */}
                        <div className="bento-card bento-portfolio-card">
                            <div className="bento-card-title mb-16">Portfolio</div>
                            <div className="bento-portfolio-body">
                                <div className="bento-donut-wrap">
                                    <div className="bento-donut-chart">
                                        <div className="bento-donut-inner">
                                            <span className="amount">{balance}</span>
                                            <span className="label">XLM<br/>Total</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bento-portfolio-legend">
                                    <div className="legend-row"><span className="dot xlm"></span> <span className="name">XLM</span> <span className="pct">100%</span> <span className="val">{balance}</span></div>
                                    <div className="legend-row"><span className="dot usdc"></span> <span className="name">USDC</span> <span className="pct">0%</span> <span className="val">0.00</span></div>
                                    <div className="legend-row"><span className="dot other"></span> <span className="name">Other Assets</span> <span className="pct">0%</span> <span className="val">0.00</span></div>
                                </div>
                            </div>
                            <button className="bento-btn-full mt-16">Manage Assets</button>
                        </div>
                    </div>

                    {/* Column 3 */}
                    <div className="bento-col bento-col-3">
                        {/* Campaigns */}
                        <div className="bento-campaigns-header">
                            <span className="bento-card-title">Campaigns</span>
                            <a href="#" className="bento-view-all">View All</a>
                        </div>
                        <div className="bento-card bento-crowdfund-card" style={{ backgroundImage: `url(${earthImg})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                            <div className="bento-cf-overlay"></div>
                            <div className="bento-cf-content">
                                <div className="bento-cf-badge"><span className="bento-dot green"></span> LIVE</div>
                                <h3>Back the campaign, on-chain</h3>
                                
                                <div className="bento-cf-stats mt-16">
                                    <div className="flex-between mb-8">
                                        <span className="cf-amt"><strong>20</strong> XLM</span>
                                        <span className="cf-goal text-muted">of 1,000 XLM goal</span>
                                    </div>
                                    <div className="cf-progress-bar"><div className="cf-progress-fill" style={{width: '2%'}}></div></div>
                                    <div className="flex-between mt-8 text-muted" style={{fontSize: '0.8rem'}}>
                                        <span>2.0% funded</span>
                                        <span>3 donors</span>
                                    </div>
                                </div>

                                <button className="btn btn-primary bento-submit-btn mt-20" style={{background: 'linear-gradient(90deg, #4d6bff, #8a2be2)'}}>Donate</button>
                                <div className="text-center mt-12 text-muted" style={{fontSize: '0.8rem'}}>You've contributed <span style={{color: '#4d6bff'}}>5 XLM</span></div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bento-card bento-stats-card mt-24">
                            <div className="bento-card-title mb-16">Quick Stats</div>
                            <div className="bento-stat-row">
                                <div className="bento-stat-label"><ZapIcon /> Avg. Fee</div>
                                <div className="bento-stat-val">~0.00001 XLM</div>
                            </div>
                            <div className="bento-stat-row">
                                <div className="bento-stat-label"><Clock size={16}/> Avg. Time</div>
                                <div className="bento-stat-val">2-5s</div>
                            </div>
                            <div className="bento-stat-row">
                                <div className="bento-stat-label"><GlobeIcon /> Network</div>
                                <div className="bento-stat-val"><span className="bento-dot green"></span> Stellar Testnet <ChevronDown size={14}/></div>
                            </div>
                            <div className="bento-stat-row">
                                <div className="bento-stat-label"><LayersIcon /> Protocol</div>
                                <div className="bento-stat-val">Soroban</div>
                            </div>
                        </div>

                        {/* Security Card */}
                        <div className="bento-card bento-security-card mt-24">
                            <div className="bento-sec-content">
                                <h4>Your Keys, Your Funds</h4>
                                <p>LynxX is non-custodial. You're in full control.</p>
                                <a href="#">Learn More <ArrowRight size={14}/></a>
                            </div>
                            <div className="bento-sec-icon">
                                <ShieldIcon />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bento-footer">
                    <img src={logoImg} alt="LynxX logo" className="bento-footer-logo" />
                    <div className="bento-footer-links">
                        Built on Stellar & Soroban &nbsp;&bull;&nbsp; Non-custodial &nbsp;&bull;&nbsp; Privacy First
                        {/* Toast Notification */}
                        {toast && (
                            <div style={{
                                position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
                                background: toast.type === 'success' ? '#10b981' : '#ef4444',
                                color: '#fff', padding: '12px 24px', borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)', fontWeight: 500, fontSize: '0.9rem',
                                animation: 'reveal 0.3s cubic-bezier(0.4,0,0.2,1)'
                            }}>
                                {toast.message}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Header;
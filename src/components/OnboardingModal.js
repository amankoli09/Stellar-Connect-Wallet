import { useState, useEffect } from "react";

const STEPS = [
    {
        icon: "🚀",
        title: "Welcome to LynxX",
        desc: "The non-custodial dApp for instant payments and on-chain crowdfunding on the Stellar blockchain. Let's get you set up in 4 quick steps.",
        action: null,
        actionLabel: null,
    },
    {
        icon: "🦋",
        title: "Install Freighter Wallet",
        desc: "Freighter is a free, open-source browser extension that manages your Stellar keys. You sign every transaction locally — we never touch your funds.",
        action: "https://www.freighter.app/",
        actionLabel: "Install Freighter →",
    },
    {
        icon: "🌐",
        title: "Switch to Testnet",
        desc: "Open Freighter → Settings → Network → select Testnet. This lets you explore the app with free test XLM — no real money required.",
        action: null,
        actionLabel: null,
    },
    {
        icon: "💸",
        title: "Fund Your Wallet",
        desc: "Get free testnet XLM from Friendbot in seconds. Just paste your public key (starts with G…) and hit the link below.",
        action: "https://friendbot.stellar.org/",
        actionLabel: "Open Friendbot →",
    },
    {
        icon: "🎉",
        title: "You're Ready!",
        desc: "Click 'Connect Wallet' on the homepage, approve in Freighter, and your live XLM balance will load. Then send XLM or make an on-chain donation!",
        action: null,
        actionLabel: null,
    },
];

const STORAGE_KEY = "sf_onboarded_v1";

export default function OnboardingModal({ onClose }) {
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Fade-in on mount
        const t = setTimeout(() => setVisible(true), 50);
        return () => clearTimeout(t);
    }, []);

    const finish = () => {
        try { localStorage.setItem(STORAGE_KEY, "true"); } catch {}
        setVisible(false);
        setTimeout(onClose, 300);
    };

    const next = () => {
        if (step < STEPS.length - 1) setStep(s => s + 1);
        else finish();
    };

    const prev = () => { if (step > 0) setStep(s => s - 1); };

    const s = STEPS[step];

    return (
        <div className={`onboard-overlay ${visible ? "onboard-overlay-in" : ""}`}>
            <div className={`onboard-modal ${visible ? "onboard-modal-in" : ""}`}>
                {/* Close */}
                <button className="onboard-close" onClick={finish} aria-label="Skip onboarding">×</button>

                {/* Step indicator */}
                <div className="onboard-steps">
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`onboard-step-dot ${i === step ? "onboard-step-active" : i < step ? "onboard-step-done" : ""}`}
                            onClick={() => setStep(i)}
                        />
                    ))}
                </div>

                {/* Icon */}
                <div className="onboard-icon">{s.icon}</div>

                {/* Content */}
                <h2 className="onboard-title">{s.title}</h2>
                <p className="onboard-desc">{s.desc}</p>

                {/* External action */}
                {s.action && (
                    <a
                        href={s.action}
                        target="_blank"
                        rel="noreferrer"
                        className="onboard-action-link"
                    >
                        {s.actionLabel}
                    </a>
                )}

                {/* Nav */}
                <div className="onboard-nav">
                    {step > 0 ? (
                        <button className="onboard-btn-secondary" onClick={prev}>← Back</button>
                    ) : (
                        <button className="onboard-btn-secondary" onClick={finish}>Skip</button>
                    )}
                    <button className="onboard-btn-primary" onClick={next}>
                        {step === STEPS.length - 1 ? "Let's Go 🚀" : "Next →"}
                    </button>
                </div>

                {/* Progress text */}
                <div className="onboard-progress-text">Step {step + 1} of {STEPS.length}</div>
            </div>
        </div>
    );
}

/* Helper: check if the user has already been onboarded */
export function shouldShowOnboarding() {
    try { return !localStorage.getItem(STORAGE_KEY); } catch { return false; }
}

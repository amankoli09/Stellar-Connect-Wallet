import { useState } from "react";

const FAQS = [
    {
        q: "Is LynxX custodial? Who holds my funds?",
        a: "Never us. LynxX is fully non-custodial — your keys live in your Freighter wallet and you sign every transaction yourself. We never touch, hold, or move your funds.",
    },
    {
        q: "What does it cost to send a payment?",
        a: "Stellar charges a base fee of 0.00001 XLM per transaction — a fraction of a cent. There are no platform fees on top; you only pay the network.",
    },
    {
        q: "How fast do transactions settle?",
        a: "Stellar reaches consensus in about 5 seconds, so your payment is final almost instantly — no waiting for block confirmations.",
    },
    {
        q: "Is the crowdfunding really on-chain?",
        a: "Yes. Donations are real Soroban smart-contract calls on Stellar Testnet. Funds move trustlessly into the contract, progress updates from on-chain events, and the beneficiary withdraws directly — no backend in the middle.",
    },
    {
        q: "Do I need real money to try it?",
        a: "No. LynxX runs on Stellar Testnet, so you use free test XLM. Just create a wallet in Freighter, switch to Testnet, and fund it from the friendbot.",
    },
];

export default function FAQ() {
    const [open, setOpen] = useState(0);

    return (
        <div className="faq-list">
            {FAQS.map((f, i) => (
                <div className={`faq-item ${open === i ? "faq-open" : ""}`} key={i}>
                    <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                        <span>{f.q}</span>
                        <span className="faq-icon" aria-hidden>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="12" y1="5" x2="12" y2="19" className="faq-icon-v" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </span>
                    </button>
                    <div className="faq-a-wrap">
                        <div className="faq-a">{f.a}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

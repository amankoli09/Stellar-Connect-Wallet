const PHASES = [
    {
        status: "done",
        tag: "Shipped",
        title: "Payments & wallet",
        items: ["Freighter connect", "Send XLM on Testnet", "Live balance & history"],
    },
    {
        status: "done",
        tag: "Shipped",
        title: "On-chain crowdfunding",
        items: ["StellarFund Soroban contract", "Real donations & events", "Live progress feed"],
    },
    {
        status: "done",
        tag: "Shipped",
        title: "Inter-contract loyalty",
        items: ["DonorBadge contract", "Cross-contract awards", "Bronze / Silver / Gold tiers"],
    },
    {
        status: "active",
        tag: "In progress",
        title: "Scale & Ecosystem",
        items: ["50+ testnet users onboarded", "Analytics dashboard", "User feedback iteration", "Pitch deck & demo"],
    },
    {
        status: "next",
        tag: "Planned",
        title: "Mainnet & beyond",
        items: ["Mainnet deployment", "USDC & multi-asset support", "Campaign creation UI", "DAO governance"],
    },
];


/* Product roadmap timeline — communicates momentum and where the project is headed. */
export default function Roadmap() {
    return (
        <div className="roadmap">
            <div className="roadmap-line" />
            {PHASES.map((p, i) => (
                <div className={`roadmap-item roadmap-${p.status}`} key={i}>
                    <div className="roadmap-marker" />
                    <span className={`roadmap-tag roadmap-tag-${p.status}`}>{p.tag}</span>
                    <h4 className="roadmap-title">{p.title}</h4>
                    <ul className="roadmap-items">
                        {p.items.map((it) => (
                            <li key={it}>{it}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

const QUOTES = [
    {
        text: "Settlement in seconds and fees you can't even feel. This is what on-chain payments should have always felt like.",
        name: "Maya R.",
        role: "Indie developer",
        initial: "M",
    },
    {
        text: "The crowdfunding flow is genuinely trustless — funds go straight into the contract and progress updates live. No backend to trust.",
        name: "Daniel K.",
        role: "Web3 builder",
        initial: "D",
    },
    {
        text: "Non-custodial, sign everything in Freighter, and it just works. Exactly the UX I want before sending real value.",
        name: "Priya S.",
        role: "Stellar community",
        initial: "P",
    },
];

/* Social-proof band. Illustrative testimonials for this Testnet demo. */
export default function Testimonials() {
    return (
        <div className="testimonials">
            {QUOTES.map((q, i) => (
                <div className="testimonial-card" key={i}>
                    <div className="testimonial-stars">★★★★★</div>
                    <p className="testimonial-text">“{q.text}”</p>
                    <div className="testimonial-author">
                        <span className="testimonial-avatar">{q.initial}</span>
                        <div className="testimonial-meta">
                            <span className="testimonial-name">{q.name}</span>
                            <span className="testimonial-role">{q.role}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

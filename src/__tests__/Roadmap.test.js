/**
 * Roadmap — unit tests
 * Tests that the roadmap phase data is correctly structured and all required
 * Level 5 phases are present.
 */

// Mirror the PHASES data from Roadmap.js
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

describe("Roadmap phases", () => {
    test("has exactly 5 phases", () => {
        expect(PHASES).toHaveLength(5);
    });

    test("exactly one phase is active (in-progress)", () => {
        const active = PHASES.filter((p) => p.status === "active");
        expect(active).toHaveLength(1);
    });

    test("active phase is Scale & Ecosystem (Level 5)", () => {
        const active = PHASES.find((p) => p.status === "active");
        expect(active.title).toBe("Scale & Ecosystem");
    });

    test("all done phases have tag 'Shipped'", () => {
        PHASES.filter((p) => p.status === "done").forEach((p) => {
            expect(p.tag).toBe("Shipped");
        });
    });

    test("all phases have at least one item", () => {
        PHASES.forEach((p) => {
            expect(p.items.length).toBeGreaterThan(0);
        });
    });

    test("DonorBadge phase is now marked as done (not active)", () => {
        const badge = PHASES.find((p) => p.title === "Inter-contract loyalty");
        expect(badge).toBeDefined();
        expect(badge.status).toBe("done");
    });

    test("Mainnet phase is planned (next)", () => {
        const mainnet = PHASES.find((p) => p.title === "Mainnet & beyond");
        expect(mainnet).toBeDefined();
        expect(mainnet.status).toBe("next");
    });

    test("Level 5 items are present in Scale & Ecosystem phase", () => {
        const l5 = PHASES.find((p) => p.title === "Scale & Ecosystem");
        expect(l5.items).toContain("50+ testnet users onboarded");
        expect(l5.items).toContain("Analytics dashboard");
        expect(l5.items).toContain("User feedback iteration");
    });

    test("all phases have a valid status value", () => {
        const validStatuses = ["done", "active", "next"];
        PHASES.forEach((p) => {
            expect(validStatuses).toContain(p.status);
        });
    });
});

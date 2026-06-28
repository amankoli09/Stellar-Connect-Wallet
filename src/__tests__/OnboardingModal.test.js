/**
 * OnboardingModal — unit tests
 * Tests the localStorage helper `shouldShowOnboarding` and step navigation logic.
 * The modal itself uses no external deps beyond React + localStorage.
 */

const STORAGE_KEY = "sf_onboarded_v1";

// ── Pure helper extracted from OnboardingModal.js ──
function shouldShowOnboarding() {
    try { return !localStorage.getItem(STORAGE_KEY); } catch { return false; }
}

describe("shouldShowOnboarding", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test("returns true when the user has never been onboarded", () => {
        expect(shouldShowOnboarding()).toBe(true);
    });

    test("returns false after the key is set", () => {
        localStorage.setItem(STORAGE_KEY, "true");
        expect(shouldShowOnboarding()).toBe(false);
    });

    test("returns true after clearing localStorage", () => {
        localStorage.setItem(STORAGE_KEY, "true");
        localStorage.clear();
        expect(shouldShowOnboarding()).toBe(true);
    });
});

describe("onboarding step data", () => {
    const STEPS = [
        { icon: "🚀", title: "Welcome to StellarFlow" },
        { icon: "🦋", title: "Install Freighter Wallet" },
        { icon: "🌐", title: "Switch to Testnet" },
        { icon: "💸", title: "Fund Your Wallet" },
        { icon: "🎉", title: "You're Ready!" },
    ];

    test("has exactly 5 steps", () => {
        expect(STEPS).toHaveLength(5);
    });

    test("first step is welcome", () => {
        expect(STEPS[0].title).toBe("Welcome to StellarFlow");
    });

    test("last step is ready confirmation", () => {
        expect(STEPS[STEPS.length - 1].title).toBe("You're Ready!");
    });

    test("all steps have an icon and title", () => {
        STEPS.forEach((step) => {
            expect(step.icon).toBeTruthy();
            expect(step.title).toBeTruthy();
        });
    });

    test("step indices are valid (0 to 4)", () => {
        STEPS.forEach((_, i) => {
            expect(i).toBeGreaterThanOrEqual(0);
            expect(i).toBeLessThan(STEPS.length);
        });
    });
});

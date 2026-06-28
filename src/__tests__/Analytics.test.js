/**
 * Analytics — unit tests
 * Tests the pure calculation logic used in the Analytics panel:
 *   - XLM raised formatting
 *   - Campaign progress percentage
 *   - Remaining XLM calculation
 *   - Edge cases (zero raised, goal exceeded)
 */

const GOAL_XLM = 1000;

// ── Pure helpers mirrored from Analytics.js ──
function calcProgress(raisedXlm) {
    return Math.min((raisedXlm / GOAL_XLM) * 100, 100);
}

function calcRemaining(raisedXlm) {
    return Math.max(GOAL_XLM - raisedXlm, 0);
}

function formatXlm(raisedXlm) {
    return Number(raisedXlm).toFixed(2);
}

// ── Tests ──
describe("Analytics: campaign progress", () => {
    test("0 XLM raised = 0% progress", () => {
        expect(calcProgress(0)).toBe(0);
    });

    test("500 XLM raised = 50% progress", () => {
        expect(calcProgress(500)).toBe(50);
    });

    test("1000 XLM raised = 100% progress", () => {
        expect(calcProgress(1000)).toBe(100);
    });

    test("progress is capped at 100% even if goal exceeded", () => {
        expect(calcProgress(1500)).toBe(100);
    });

    test("partial donations show correct %", () => {
        expect(calcProgress(250)).toBe(25);
        expect(calcProgress(750)).toBe(75);
    });
});

describe("Analytics: remaining XLM", () => {
    test("1000 XLM goal, 0 raised = 1000 remaining", () => {
        expect(calcRemaining(0)).toBe(1000);
    });

    test("1000 XLM goal, 600 raised = 400 remaining", () => {
        expect(calcRemaining(600)).toBe(400);
    });

    test("remaining is 0 once goal reached", () => {
        expect(calcRemaining(1000)).toBe(0);
    });

    test("remaining is 0 even if goal exceeded (no negative)", () => {
        expect(calcRemaining(1200)).toBe(0);
    });
});

describe("Analytics: XLM formatting", () => {
    test("formats to 2 decimal places", () => {
        expect(formatXlm(123)).toBe("123.00");
        expect(formatXlm(45.1)).toBe("45.10");
        expect(formatXlm(0.5)).toBe("0.50");
    });

    test("rounds correctly", () => {
        expect(formatXlm(99.999)).toBe("100.00");
        expect(formatXlm(0.001)).toBe("0.00");
    });

    test("handles zero", () => {
        expect(formatXlm(0)).toBe("0.00");
    });
});

describe("Analytics: campaign goal constant", () => {
    test("goal is 1000 XLM", () => {
        expect(GOAL_XLM).toBe(1000);
    });
});

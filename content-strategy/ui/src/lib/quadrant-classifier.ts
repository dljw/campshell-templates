import type { Quadrant } from "../types.js";

export interface QuadrantThresholds {
	starMaxPosition: number;
	starMinImpressions: number;
	starMinCtr: number;
	quickWinMinPosition: number;
	quickWinMaxPosition: number;
	quickWinMinImpressions: number;
	ctrOppMaxPosition: number;
	ctrOppMinImpressions: number;
	ctrOppMaxCtr: number;
	earlySignalMaxPosition: number;
	earlySignalMaxImpressions: number;
	longTermMinImpressions: number;
}

const DEFAULT_THRESHOLDS: QuadrantThresholds = {
	starMaxPosition: 10,
	starMinImpressions: 50,
	starMinCtr: 2,
	quickWinMinPosition: 11,
	quickWinMaxPosition: 30,
	quickWinMinImpressions: 5,
	ctrOppMaxPosition: 20,
	ctrOppMinImpressions: 3,
	ctrOppMaxCtr: 2,
	earlySignalMaxPosition: 20,
	earlySignalMaxImpressions: 2,
	longTermMinImpressions: 10,
};

export function classifyQuadrant(
	kw: { position: number; impressions: number; ctr: number },
	overrides?: Partial<QuadrantThresholds>,
): Quadrant {
	const t = { ...DEFAULT_THRESHOLDS, ...overrides };

	if (kw.position <= t.starMaxPosition && kw.impressions >= t.starMinImpressions && kw.ctr > t.starMinCtr) {
		return "star";
	}
	if (kw.position >= t.quickWinMinPosition && kw.position <= t.quickWinMaxPosition && kw.impressions >= t.quickWinMinImpressions) {
		return "quick-win";
	}
	if (kw.position <= t.ctrOppMaxPosition && kw.impressions >= t.ctrOppMinImpressions && kw.ctr <= t.ctrOppMaxCtr) {
		return "ctr-opportunity";
	}
	if (kw.position <= t.earlySignalMaxPosition && kw.impressions <= t.earlySignalMaxImpressions) {
		return "early-signal";
	}
	if (kw.position > t.quickWinMaxPosition && kw.impressions >= t.longTermMinImpressions) {
		return "long-term-target";
	}
	return "dog";
}

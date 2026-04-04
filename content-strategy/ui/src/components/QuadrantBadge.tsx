import type { Quadrant } from "../types.js";

const QUADRANT_STYLES: Record<Quadrant, string> = {
	star: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
	"quick-win": "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
	"ctr-opportunity": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
	"long-term-target": "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
	"early-signal": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
	dog: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const QUADRANT_LABELS: Record<Quadrant, string> = {
	star: "Star",
	"quick-win": "Quick Win",
	"ctr-opportunity": "CTR Opp",
	"long-term-target": "Long-term",
	"early-signal": "Early Signal",
	dog: "Dog",
};

export function QuadrantBadge({ quadrant }: { quadrant: Quadrant | undefined }) {
	if (!quadrant) return null;
	return (
		<span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${QUADRANT_STYLES[quadrant]}`}>
			{QUADRANT_LABELS[quadrant]}
		</span>
	);
}

import type { Color, Hub } from "../types.js";

const COLOR_MAP: Record<Color, string> = {
	red: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
	orange: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
	yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
	green: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
	blue: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
	purple: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
	pink: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
	gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export function HubBadge({ hub }: { hub: Hub | undefined }) {
	if (!hub) return null;
	const style = COLOR_MAP[hub.color ?? "gray"];
	return (
		<span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>
			{hub.name}
		</span>
	);
}

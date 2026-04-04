import type { Priority } from "../types.js";

const PRIORITY_STYLES: Record<Priority, string> = {
	high: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
	medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
	low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export function PriorityBadge({ priority }: { priority: Priority | undefined }) {
	if (!priority) return null;
	return (
		<span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[priority]}`}>
			{priority}
		</span>
	);
}

const STATUS_STYLES: Record<string, string> = {
	// Article statuses
	idea: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
	planned: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
	briefed: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
	drafting: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
	review: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
	published: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
	optimizing: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
	"needs-refresh": "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
	// Action statuses
	"in-progress": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
	done: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
	deferred: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
	cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
	// Hub statuses
	planning: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
	active: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
	complete: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
};

export function StatusBadge({ status }: { status: string }) {
	const style = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
	return (
		<span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>
			{status}
		</span>
	);
}

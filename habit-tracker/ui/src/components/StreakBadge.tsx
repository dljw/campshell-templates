interface StreakBadgeProps {
	streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
	if (streak <= 0) return null;

	const isHot = streak >= 7;
	const isOnFire = streak >= 30;

	return (
		<span
			className={`inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums rounded-full px-1.5 py-0.5 ${
				isOnFire
					? "bg-amber-500/15 text-amber-500"
					: isHot
						? "bg-orange-500/12 text-orange-500"
						: "bg-orange-500/8 text-orange-400"
			}`}
		>
			<span className={isOnFire ? "text-sm" : "text-xs"}>{isOnFire ? "\u{1f525}" : "\u{1f525}"}</span>
			{streak}
		</span>
	);
}

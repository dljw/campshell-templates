interface ProgressRingProps {
	value: number;
	max: number;
	size?: number;
	strokeWidth?: number;
}

export function ProgressRing({ value, max, size = 80, strokeWidth = 6 }: ProgressRingProps) {
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const progress = max > 0 ? Math.min(value / max, 1) : 0;
	const offset = circumference * (1 - progress);
	const isComplete = value >= max && max > 0;

	return (
		<div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
			<svg width={size} height={size} className="-rotate-90">
				{/* Background track */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={strokeWidth}
					className="text-muted/40"
				/>
				{/* Progress arc */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					className={`transition-all duration-700 ease-out ${
						isComplete ? "text-emerald-500" : "text-emerald-400/80"
					}`}
				/>
			</svg>
			<span
				className={`absolute text-xs font-semibold tabular-nums ${
					isComplete ? "text-emerald-500" : "text-muted-foreground"
				}`}
			>
				{value}/{max}
			</span>
		</div>
	);
}

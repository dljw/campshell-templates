import { Button } from "@campshell/ui-components";
import { Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface CopyPromptButtonProps {
	prompt: string;
	label?: string;
	variant?: "ghost" | "outline";
}

export function CopyPromptButton({ prompt, label, variant = "ghost" }: CopyPromptButtonProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(prompt);
		setCopied(true);
		toast.success("Prompt copied to clipboard");
		setTimeout(() => setCopied(false), 2000);
	}, [prompt]);

	return (
		<Button
			variant={variant}
			size="sm"
			onClick={(e) => { e.stopPropagation(); handleCopy(); }}
			title="Copy AI prompt"
			className="gap-1 shrink-0 text-foreground"
		>
			{copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
			{label && <span className="text-xs">{label}</span>}
		</Button>
	);
}

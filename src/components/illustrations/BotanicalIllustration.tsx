import { useState } from "react";
import { Leaf } from "lucide-react";

import { getBotanicalIllustration } from "../../constants/illustrations";
import { cn } from "../../lib/cn";

interface BotanicalIllustrationProps {
  illustrationKey?: string;
  presentation?: "card" | "plate";
  className?: string;
}

export function BotanicalIllustration({
  illustrationKey,
  presentation = "card",
  className,
}: BotanicalIllustrationProps) {
  const illustration = getBotanicalIllustration(illustrationKey);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const canRenderIllustration =
    illustration !== undefined && failedSrc !== illustration.src;

  return (
    <div
      className={cn(
        "flex aspect-[4/5] items-center justify-center overflow-hidden",
        presentation === "card"
          ? "archive-surface specimen-border p-4"
          : "bg-transparent p-8 sm:p-10",
        className,
      )}
      aria-hidden="true"
    >
      {canRenderIllustration ? (
        <img
          src={illustration.src}
          alt=""
          className="h-full w-full object-contain"
          draggable={false}
          onError={() => setFailedSrc(illustration.src)}
        />
      ) : (
        <Leaf
          className={cn(
            "text-muted",
            presentation === "card" ? "h-8 w-8" : "h-12 w-12",
          )}
          strokeWidth={1.25}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
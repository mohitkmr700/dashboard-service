import { cn } from "../../lib/utils";

interface ShimmerProps {
  className?: string;
  children?: React.ReactNode;
}

export function Shimmer({ className, children }: ShimmerProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gradient-to-r from-muted/20 via-muted/40 to-muted/20 bg-[length:200%_100%]",
        className
      )}
      style={{
        backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
        animation: "shimmer 2s infinite",
      }}
    >
      {children}
    </div>
  );
}

// Add shimmer animation to globals.css
const shimmerStyles = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`;

// You can add this to your globals.css file
export const shimmerKeyframes = shimmerStyles; 
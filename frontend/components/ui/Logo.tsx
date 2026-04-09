import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-12 w-12"
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  return (
    <Link href="/" className="flex items-center gap-2.5">
      <div className={`flex ${sizeClasses[size]} items-center justify-center rounded-xl overflow-hidden bg-black`}>
        <img 
          src="/brand/mnd-symbol.svg" 
          alt="MnD" 
          className="h-full w-full object-contain" 
        />
      </div>
      {showText && (
        <div className={`${textSizes[size]} uppercase tracking-[0.2em] font-semibold text-black`}>
          MnD Business Suite
        </div>
      )}
    </Link>
  );
}
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "surface noise rounded-2xl p-4 text-[hsl(var(--c-text))] shadow-glass transition-shadow duration-200 ease-ease-out",
        className
      )}
      {...props}
    />
  );
}

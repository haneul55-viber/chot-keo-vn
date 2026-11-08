import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-[#ebe4d8] dark:bg-[#172338]",
        className
      )}
      {...props}
    />
  );
}

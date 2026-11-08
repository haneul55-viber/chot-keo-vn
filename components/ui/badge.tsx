import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "bg-teal-50 text-[#0f766e] border border-teal-200/90 dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-800",
        secondary:
          "bg-[#f3ede3] text-slate-700 border border-[#e7dfd3] dark:bg-[#172338] dark:text-slate-300 dark:border-[#243552]",
        amber:
          "bg-orange-50 text-[#9a3412] border border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800/80",
        rose:
          "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
        emerald:
          "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
        outline:
          "border border-[#d8cdbe] text-slate-700 dark:border-slate-700 dark:text-slate-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

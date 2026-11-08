import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 dark:focus-visible:ring-teal-400 dark:focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#0f766e] text-white shadow-xs hover:bg-[#115e59] dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300",
        terracotta:
          "bg-[#c2410c] text-white shadow-xs hover:bg-[#9a3412] dark:bg-orange-400 dark:text-slate-950 dark:hover:bg-orange-300",
        secondary:
          "bg-[#f3ede3] text-slate-900 hover:bg-[#e7dfd3] dark:bg-[#172338] dark:text-slate-100 dark:hover:bg-[#1e2d45]",
        outline:
          "border border-[#e7dfd3] bg-white text-slate-800 hover:bg-[#faf7f2] hover:border-[#d6cab8] dark:border-[#1e2d45] dark:bg-[#101929] dark:text-slate-100 dark:hover:bg-[#172338]",
        amber:
          "bg-[#c2410c] text-white shadow-xs hover:bg-[#9a3412] dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300",
        ghost:
          "text-slate-700 hover:bg-[#f3ede3] dark:text-slate-300 dark:hover:bg-[#172338]",
        destructive: "bg-rose-600 text-white hover:bg-rose-700",
      },
      size: {
        default: "h-11 px-4 py-2.5",
        sm: "h-9 min-h-[36px] rounded-xl px-3.5 text-xs",
        lg: "h-12 rounded-2xl px-6 text-base",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

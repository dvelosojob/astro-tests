import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "rounded-full flex items-center justify-center gap-x-1",
  {
    variants: {
      variant: {
        contained:
          "active:scale-95 bg-blue-500 text-inverse hover:bg-blue-500/85 active:bg-blue-500/85 cursor-pointer transition-all duration-300 ease-in-out",
        outline:
          "active:scale-95 bg-white border border-primary text-white hover:bg-blue-500/10 active:bg-blue-500/20 cursor-pointer transition-all duration-300 ease-in-out",
        link: "px-0 inline-flex rounded-none bg-white text-white border-b-2 border-transparent hover:border-primary cursor-pointer transition-colors duration-200",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      size: {
        sm: "px-3 py-1 text-sm h-8",
        md: "px-4 py-2 text-base h-10",
        lg: "px-5 py-3 text-lg h-12",
      },
    },
    defaultVariants: {
      variant: "contained",
      fullWidth: false,
      size: "md",
    },
    compoundVariants: [
      {
        variant: "link",
        size: "sm",
        class: "px-0 py-1 text-sm h-auto",
      },
      {
        variant: "link",
        size: "md",
        class: "px-0 py-2 text-base h-auto",
      },
      {
        variant: "link",
        size: "lg",
        class: "px-0 py-3 text-lg h-auto",
      },
    ],
  }
);

function Button({
  className,
  variant,
  fullWidth,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ size, fullWidth, variant, className }),
        props.disabled && "cursor-not-allowed opacity-50"
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };

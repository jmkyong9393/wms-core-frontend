import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors duration-150 [&_svg]:pointer-events-none [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-primary/20 bg-primary/10 text-primary",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        success:
          "border-green-200 bg-green-100 text-green-700 dark:border-green-900 dark:bg-green-900/40 dark:text-green-300",
        warning:
          "border-orange-200 bg-orange-100 text-orange-700 dark:border-orange-900 dark:bg-orange-900/40 dark:text-orange-300",
        destructive: "border-destructive/20 bg-destructive/10 text-destructive",
        outline: "border-border bg-transparent text-foreground",
        ai: "border-ai-border bg-ai-muted text-ai",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

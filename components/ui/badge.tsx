import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-amber-500 text-white hover:bg-amber-600 shadow-sm',
        secondary:
          'border-transparent bg-amber-100 text-amber-600 hover:bg-amber-200 hover:text-amber-700',
        destructive:
          'border-transparent bg-red-500 text-white hover:bg-red-600',
        outline: 'text-amber-600 border-amber-200 hover:bg-amber-50 hover:border-amber-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

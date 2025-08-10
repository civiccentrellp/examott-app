'use client';

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

type Props = {
  label: string;
  icon: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  variant?: string;
};

// ✅ Add forwardRef support
const IconButtonWithTooltip = React.forwardRef<HTMLButtonElement, Props>(
  ({ label, icon, onClick, className, variant = "ghost" }, ref) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={ref}
              variant="ghost"
              size="sm"
              onClick={onClick}
              className={className}
            >
              {icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

// ✅ Required for forwardRef components
IconButtonWithTooltip.displayName = 'IconButtonWithTooltip';

export default IconButtonWithTooltip;

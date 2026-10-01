import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
  iconRight?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, iconRight, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <span className="material-symbols-outlined absolute left-2.5 text-outline text-[16px] pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "h-8 rounded border border-outline-variant/40 bg-surface-container-lowest font-body-default text-body-default text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-full",
            icon ? "pl-8 pr-3" : "px-2.5",
            iconRight ? "pr-8" : "",
            className
          )}
          {...props}
        />
        {iconRight && (
          <span className="material-symbols-outlined absolute right-2 text-outline text-[16px] pointer-events-none">
            {iconRight}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

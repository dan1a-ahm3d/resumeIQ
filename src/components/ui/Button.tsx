import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "dark";
  size?: "sm" | "md" | "lg";
  icon?: string;
  iconPosition?: "left" | "right";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      icon,
      iconPosition = "left",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-label-default text-label-default transition-colors select-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

    const variants = {
      primary: "bg-primary text-on-primary hover:bg-[#1e293b] rounded active:scale-[0.99]",
      dark: "bg-primary-container text-on-primary hover:opacity-95 rounded-[6px] shadow-sm",
      secondary:
        "bg-surface-container-lowest border border-outline-variant/40 text-on-surface hover:bg-surface-container-low rounded shadow-sm",
      outline:
        "bg-surface-container-lowest border border-outline-variant/50 text-on-surface hover:bg-surface-container-low rounded-[6px]",
      ghost:
        "bg-transparent text-secondary hover:text-on-surface hover:bg-surface-container-low rounded",
    };

    const sizes = {
      sm: "h-7 px-2.5 text-[12px] gap-1",
      md: "h-8 px-3 text-[13px] gap-1.5",
      lg: "h-9 px-4 text-[13px] gap-2",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {icon && iconPosition === "left" && (
          <span className="material-symbols-outlined text-[16px]">
            {icon}
          </span>
        )}
        {children && <span>{children}</span>}
        {icon && iconPosition === "right" && (
          <span className="material-symbols-outlined text-[16px]">
            {icon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

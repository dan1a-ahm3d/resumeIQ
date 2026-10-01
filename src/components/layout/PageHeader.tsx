import React from "react";

interface PageHeaderProps {
  breadcrumbs?: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  breadcrumbs,
  title,
  badge,
  description,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col md:flex-row md:items-end justify-between gap-space-md ${className}`}
    >
      <div className="flex flex-col gap-0.5">
        {breadcrumbs && (
          <div className="flex items-center gap-space-xs text-outline font-meta-default text-meta-default mb-1">
            {breadcrumbs}
          </div>
        )}
        <div className="flex items-baseline gap-space-sm">
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <div className="font-body-default text-body-default text-outline mt-0.5">
            {description}
          </div>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-space-sm self-start md:self-auto flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}

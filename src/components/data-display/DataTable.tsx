import React from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  align?: "left" | "center" | "right";
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  onRowClick?: (item: T) => void;
  className?: string;
  emptyState?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  className,
  emptyState,
}: DataTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto w-full bg-surface-container-lowest", className)}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low text-outline font-table-header text-table-header uppercase select-none border-b border-outline-variant/30">
            {columns.map((col, idx) => (
              <th
                key={idx}
                scope="col"
                style={col.width ? { width: col.width } : undefined}
                className={cn(
                  "py-2.5 px-space-md font-semibold tracking-wider",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                  col.headerClassName
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="font-body-default text-body-default text-on-surface divide-y divide-outline-variant/15">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-8 px-space-md text-center text-outline font-meta-default"
              >
                {emptyState || "No records found."}
              </td>
            </tr>
          ) : (
            data.map((item, rowIdx) => (
              <tr
                key={keyExtractor(item, rowIdx)}
                onClick={() => onRowClick && onRowClick(item)}
                className={cn(
                  "hover:bg-surface-container-low/60 transition-colors group",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={cn(
                      "py-3 px-space-md",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.className
                    )}
                  >
                    {col.cell
                      ? col.cell(item, rowIdx)
                      : col.accessorKey
                      ? String(item[col.accessorKey] ?? "")
                      : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

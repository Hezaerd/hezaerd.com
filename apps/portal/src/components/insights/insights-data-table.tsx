import { cn } from "@hezaerd/ui/lib/utils";

import type { InsightsShellVariant } from "./insights-types";

type InsightsDataTableColumn<T> = {
  key: keyof T & string;
  header: string;
  align?: "left" | "right";
  mono?: boolean;
  format?: (row: T) => React.ReactNode;
};

type InsightsDataTableProps<T extends Record<string, unknown>> = {
  rows: T[];
  columns: InsightsDataTableColumn<T>[];
  variant?: InsightsShellVariant;
  emptyMessage?: string;
};

export function InsightsDataTable<T extends Record<string, unknown>>({
  rows,
  columns,
  variant = "desk",
  emptyMessage = "Aucune donnée pour cette période.",
}: InsightsDataTableProps<T>) {
  if (rows.length === 0) {
    return <p className="text-muted-foreground text-sm">{emptyMessage}</p>;
  }

  const primaryKey = columns[0]?.key;

  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full", variant === "workspace" ? "text-sm" : "text-xs")}>
        <thead>
          <tr className="border-border border-b">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "text-muted-foreground pb-2 font-medium",
                  column.align === "right" ? "text-right" : "text-left",
                  variant === "desk" ? "pr-3" : "pr-4",
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={index}
              className="border-border/60 border-b last:border-b-0 motion-safe:transition-colors motion-safe:duration-150 hover:bg-muted/20"
            >
              {columns.map((column) => {
                const raw = row[column.key];
                const content = column.format ? column.format(row) : String(raw ?? "");
                const isPrimary = column.key === primaryKey;

                return (
                  <td
                    key={column.key}
                    className={cn(
                      "py-2 tabular-nums",
                      column.align === "right" ? "text-right" : "text-left",
                      variant === "desk" ? "pr-3" : "pr-4",
                      column.align === "right" ? "text-foreground font-medium" : "text-foreground",
                      isPrimary && column.mono && "font-mono text-[0.8125rem]",
                      isPrimary && "max-w-[14rem] truncate sm:max-w-none sm:whitespace-normal",
                    )}
                    title={isPrimary && typeof raw === "string" ? raw : undefined}
                  >
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { ArrowDown01Icon, ArrowUp01Icon, ArrowUpDownIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function SortHeader({
  label,
  sortKey,
  current,
  dir,
  onSort,
}: {
  label: string;
  sortKey: string;
  current: string | null;
  dir: "asc" | "desc";
  onSort: (k: string) => void;
}) {
  const active = current === sortKey;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition"
    >
      {label}
      <HugeiconsIcon
        icon={
          active
            ? dir === "asc"
              ? ArrowUp01Icon
              : ArrowDown01Icon
            : ArrowUpDownIcon
        }
        strokeWidth={2}
        className="size-3 text-muted-foreground/50"
      />
    </button>
  );
}

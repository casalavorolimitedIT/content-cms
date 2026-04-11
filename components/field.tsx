import { HugeiconsIcon } from "@hugeicons/react";
import { Label } from "./ui/label";

export function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: any;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        {icon && (
          <HugeiconsIcon
            icon={icon}
            strokeWidth={1.8}
            className="size-3 text-muted-foreground/70"
          />
        )}
        <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {label}
        </Label>
      </div>
      {children}
    </div>
  );
}

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

/** Returns FY start (1 Apr) for a given calendar year */
const fyStart = (year: number) => new Date(year, 3, 1); // April 1
const fyEnd = (year: number) => new Date(year + 1, 2, 31); // March 31

/** Current Indian FY: if today is Jan 2026 → FY 2025-26, if today is May 2026 → FY 2026-27 */
const currentFYStartYear = () => {
  const now = new Date();
  return now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
};

type Preset = { label: string; range: DateRange };

const buildPresets = (): Preset[] => {
  const fy = currentFYStartYear();
  const presets: Preset[] = [];

  // Current FY
  presets.push({ label: `FY ${fy}-${(fy + 1) % 100}`, range: { from: fyStart(fy), to: fyEnd(fy) } });
  // Previous 4 FYs
  for (let i = 1; i <= 4; i++) {
    const y = fy - i;
    presets.push({ label: `FY ${y}-${(y + 1) % 100}`, range: { from: fyStart(y), to: fyEnd(y) } });
  }

  // Quick presets
  const now = new Date();
  presets.unshift(
    { label: "This Month", range: { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now } },
    { label: "Last 3 Months", range: { from: new Date(now.getFullYear(), now.getMonth() - 3, 1), to: now } },
    { label: "Last 6 Months", range: { from: new Date(now.getFullYear(), now.getMonth() - 6, 1), to: now } },
    { label: "This Year", range: { from: new Date(now.getFullYear(), 0, 1), to: now } },
  );

  return presets;
};

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export default function FYDateFilter({ value, onChange, className }: Props) {
  const [open, setOpen] = useState(false);
  const presets = buildPresets();
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const handlePreset = (p: Preset) => {
    setActivePreset(p.label);
    onChange(p.range);
    setOpen(false);
  };

  const handleClear = () => {
    setActivePreset(null);
    onChange({ from: undefined, to: undefined });
    setOpen(false);
  };

  const label = value.from && value.to
    ? `${format(value.from, "dd MMM yy")} – ${format(value.to, "dd MMM yy")}`
    : activePreset ?? "All Time";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-1.5 font-normal", className)}>
          <CalendarIcon className="h-3.5 w-3.5" />
          {label}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 flex" align="end" side="bottom">
        {/* Presets sidebar */}
        <div className="border-r p-2 space-y-0.5 min-w-[140px]">
          <p className="text-xs font-semibold text-muted-foreground px-2 py-1">Quick Filters</p>
          {presets.map(p => (
            <button
              key={p.label}
              onClick={() => handlePreset(p)}
              className={cn(
                "w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-muted transition-colors",
                activePreset === p.label && "bg-primary/10 text-primary font-medium"
              )}
            >
              {p.label}
            </button>
          ))}
          <div className="border-t my-1" />
          <button onClick={handleClear} className="w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-muted text-muted-foreground">
            All Time
          </button>
        </div>
        {/* Calendar for custom range */}
        <div className="p-2">
          <p className="text-xs font-semibold text-muted-foreground px-1 pb-2">Custom Range</p>
          <Calendar
            mode="range"
            selected={value.from && value.to ? { from: value.from, to: value.to } : undefined}
            onSelect={(range) => {
              if (range) {
                setActivePreset(null);
                onChange({ from: range.from, to: range.to });
                if (range.from && range.to) setOpen(false);
              }
            }}
            numberOfMonths={2}
            className="pointer-events-auto"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

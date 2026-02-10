"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  min: number;
  max: number;
  step?: number;
  defaultValue?: [number, number];
  value?: number[];
  onValueChange?: (values: number[]) => void;
  label?: string;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    {
      className,
      min,
      max,
      step = 1,
      defaultValue = [min, max],
      value,
      onValueChange,
      label,
      ...props
    },
    ref
  ) => {
    const [internalValues, setInternalValues] =
      React.useState<[number, number]>(defaultValue);

    // Use controlled values if provided, otherwise internal
    const currentValues = value
      ? [value[0], value[1]]
      : internalValues;

    const handleValueChange = (newValues: number[]) => {
      if (!value) {
        setInternalValues([newValues[0], newValues[1]]);
      }
      onValueChange?.(newValues);
    };

    // Clamp label position so it doesn't overflow the container edges
    const pct0 = ((currentValues[0] - min) / (max - min)) * 100;
    const pct1 = ((currentValues[1] - min) / (max - min)) * 100;

    return (
      <div className="w-full relative pb-7">
        <SliderPrimitive.Root
          ref={ref}
          className={cn(
            "relative flex w-full touch-none select-none items-center",
            className
          )}
          min={min}
          max={max}
          step={step}
          value={currentValues}
          onValueChange={handleValueChange}
          {...props}
        >
          <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
            <SliderPrimitive.Range className="absolute h-full bg-primary" />
          </SliderPrimitive.Track>

          <SliderPrimitive.Thumb className="relative block h-4 w-4 rounded-full border border-primary/50 bg-black shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
          <SliderPrimitive.Thumb className="relative block h-4 w-4 rounded-full border border-primary/50 bg-black shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
        </SliderPrimitive.Root>

        {/* Labels rendered outside the Root so they can't interfere with drag */}
        <div
          className="absolute top-5 text-[11px] font-medium whitespace-nowrap z-10"
          style={{ left: `${pct0}%`, transform: `translateX(-${Math.min(pct0, 50)}%)` }}
        >
          {label}{currentValues[0].toLocaleString("en-ZA")}
        </div>
        <div
          className="absolute top-5 text-[11px] font-medium whitespace-nowrap z-10"
          style={{ left: `${pct1}%`, transform: `translateX(-${Math.max(pct1, 50)}%)` }}
        >
          {label}{currentValues[1].toLocaleString("en-ZA")}
        </div>
      </div>
    );
  }
);

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };

"use client";

import { useCallback, useRef, useState } from "react";

interface RangeSliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  minLabel?: string;
  maxLabel?: string;
  label?: string;
  unit?: string;
  className?: string;
  showInput?: boolean;
}

export default function RangeSlider({
  min,
  max,
  step,
  value,
  onChange,
  formatValue,
  minLabel,
  maxLabel,
  label,
  unit,
  className = "",
  showInput = false,
}: RangeSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const percentage = ((value - min) / (max - min)) * 100;

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const updateValue = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const offsetX = clientX - rect.left;
      const newPercentage = Math.max(
        0,
        Math.min(100, (offsetX / rect.width) * 100)
      );
      const rawValue = (newPercentage / 100) * (max - min) + min;
      const steppedValue = Math.round(rawValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));
      onChange(clampedValue);
    },
    [min, max, step, onChange]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        updateValue(e.clientX);
      }
    },
    [isDragging, updateValue]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      updateValue(e.clientX);
    },
    [updateValue]
  );

  useState(() => {
    if (typeof window !== "undefined") {
      const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
      const handleGlobalMouseUp = () => handleMouseUp();

      if (isDragging) {
        window.addEventListener("mousemove", handleGlobalMouseMove);
        window.addEventListener("mouseup", handleGlobalMouseUp);
      }

      return () => {
        window.removeEventListener("mousemove", handleGlobalMouseMove);
        window.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }
  });

  const displayValue = formatValue ? formatValue(value) : value.toString();

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Label with optional input */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-text-secondary">
            {label}
          </label>
          {showInput && (
            <input
              type="number"
              value={value}
              onChange={(e) => {
                const val = Math.max(
                  min,
                  Math.min(max, Number(e.target.value) || min)
                );
                onChange(val);
              }}
              className="w-32 px-3 py-1.5 rounded-lg border border-border-primary bg-surface-secondary text-text-primary text-sm font-semibold text-right focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              min={min}
              max={max}
              step={step}
            />
          )}
        </div>
      )}

      {/* Current value display (when not showing input) */}
      {!showInput && (
        <div className="text-center mb-1">
          <span className="text-2xl font-bold text-primary">
            {displayValue}
          </span>
          {unit && <span className="text-sm text-text-muted ml-1">{unit}</span>}
        </div>
      )}

      {/* Slider track */}
      <div
        ref={sliderRef}
        onClick={handleClick}
        className="relative h-3 bg-border-secondary rounded-full cursor-pointer group"
      >
        {/* Filled track */}
        <div
          className="absolute h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-150"
          style={{ width: `${percentage}%` }}
        />

        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 size-6 bg-surface-primary rounded-full shadow-lg shadow-black/10 border-2 border-primary cursor-grab active:cursor-grabbing transition-transform group-hover:scale-110"
          style={{ left: `calc(${percentage}% - 12px)` }}
          onMouseDown={handleMouseDown}
        />

        {/* Hidden input for accessibility */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          aria-label={label}
        />
      </div>

      {/* Min/Max labels */}
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-xs text-text-muted">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}

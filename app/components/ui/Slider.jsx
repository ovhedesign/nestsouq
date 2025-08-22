'use client';

import { SlidersHorizontal } from 'lucide-react';

export function SliderRow({
  label,
  hint,
  min = 0,
  max = 100,
  step = 1,
  valueMin,
  valueMax,
  setValueMin,
  setValueMax,
  suffix = '',
}) {
  // Ensure min <= max
  const clampPair = (lo, hi) => {
    let a = Math.min(lo, hi);
    let b = Math.max(lo, hi);
    return [a, b];
  };

  const onChangeMin = (e) =>
    setValueMin(clampPair(Number(e.target.value), valueMax)[0]);
  const onChangeMax = (e) =>
    setValueMax(clampPair(valueMin, Number(e.target.value))[1]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-semibold">{label}</h4>
        </div>
        <span className="text-xs text-gray-400">{hint}</span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 w-14">Min</span>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={valueMin}
            onChange={onChangeMin}
            className="w-full accent-amber-500"
          />
          <span className="text-xs font-semibold w-10 text-right">
            {valueMin}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 w-14">Max</span>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={valueMax}
            onChange={onChangeMax}
            className="w-full accent-amber-500"
          />
          <span className="text-xs font-semibold w-10 text-right">
            {valueMax}
          </span>
        </div>
      </div>
      {suffix && (
        <p className="text-[10px] text-gray-500">
          Values shown are in {suffix}.
        </p>
      )}
    </div>
  );
}

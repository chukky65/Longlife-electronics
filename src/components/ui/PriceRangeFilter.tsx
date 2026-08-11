import React, { useState, useEffect } from 'react';

interface PriceRangeFilterProps {
  minPrice: number;
  maxPrice: number;
  currentMin: number;
  currentMax: number;
  onChange: (min: number, max: number) => void;
}

export const PriceRangeFilter = ({ minPrice, maxPrice, currentMin, currentMax, onChange }: PriceRangeFilterProps) => {
  const [minVal, setMinVal] = useState(currentMin);
  const [maxVal, setMaxVal] = useState(currentMax);

  useEffect(() => {
    setMinVal(currentMin);
    setMaxVal(currentMax);
  }, [currentMin, currentMax]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxVal - 1000);
    setMinVal(value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minVal + 1000);
    setMaxVal(value);
  };

  const handleMouseUp = () => {
    onChange(minVal, maxVal);
  };

  const percent1 = ((minVal - minPrice) / (maxPrice - minPrice)) * 100;
  const percent2 = ((maxVal - minPrice) / (maxPrice - minPrice)) * 100;

  return (
    <div className="space-y-4 pt-4">
      <div className="relative h-1 bg-slate-200 dark:bg-slate-700 w-full mb-6">
        {/* Track highlight */}
        <div 
          className="absolute h-full bg-red-600 z-10"
          style={{ left: `${percent1}%`, right: `${100 - percent2}%` }}
        />
        
        {/* Min Input */}
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          step={5000}
          value={minVal}
          onChange={handleMinChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none z-20 
                     [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none 
                     [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white 
                     [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-red-600 [&::-webkit-slider-thumb]:rounded-full
                     [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none 
                     [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white 
                     [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-red-600 [&::-moz-range-thumb]:rounded-full"
        />
        
        {/* Max Input */}
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          step={5000}
          value={maxVal}
          onChange={handleMaxChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none z-30 
                     [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none 
                     [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white 
                     [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-red-600 [&::-webkit-slider-thumb]:rounded-full
                     [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none 
                     [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white 
                     [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-red-600 [&::-moz-range-thumb]:rounded-full"
        />
      </div>
      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-1.5 px-2">
          ₦{minVal.toLocaleString()}
        </div>
        <span className="text-slate-300 dark:text-slate-600">-</span>
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-1.5 px-2">
          ₦{maxVal.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

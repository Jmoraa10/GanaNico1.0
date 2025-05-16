// src/components/NumericInput.tsx
import React from 'react';

interface NumericInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  min = 0,
  max = 99999,
  step = 1,
}) => {
  const handleDecrement = () => {
    if (value > min) onChange(value - step);
  };

  const handleIncrement = () => {
    if (value < max) onChange(value + step);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    if (!isNaN(newValue)) onChange(newValue);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleDecrement}
        className="w-8 h-8 text-xl font-bold border-none bg-gray-300 hover:bg-gray-400 rounded"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        className="w-16 text-center text-base p-1 border rounded"
      />
      <button
        type="button"
        onClick={handleIncrement}
        className="w-8 h-8 text-xl font-bold border-none bg-gray-300 hover:bg-gray-400 rounded"
      >
        +
      </button>
    </div>
  );
};

export default NumericInput;

import React from 'react';

interface OptionSelectorProps<T extends string> {
  title: string;
  options: T[];
  selectedOption: T;
  onOptionSelect: (option: T) => void;
  IconComponent: React.ComponentType<{ className?: string }>;
}

export const OptionSelector = <T extends string,>({
  title,
  options,
  selectedOption,
  onOptionSelect,
  IconComponent,
}: OptionSelectorProps<T>): React.ReactElement => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-300 mb-3 flex items-center">
        <IconComponent className="w-5 h-5 mr-2 text-cyan-400" />
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onOptionSelect(option)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${
              selectedOption === option
                ? 'bg-cyan-500 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

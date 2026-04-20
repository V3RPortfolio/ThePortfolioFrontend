import { ChevronRightIcon } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    fullWidth?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
    value,
    onChange,
    placeholder = "Search...",
    label,
    fullWidth = true,
}) => {
    const [currentValue, setCurrentValue] = useState(value);

    return (
        <div className={`flex flex-row ${fullWidth ? "w-full" : "w-auto"}`}>
            {label && (
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}
            <div className="relative flex flex-row flex-wrap gap-2 items-center w-full">
                <span className="absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.15 10.15z"
                        />
                    </svg>
                </span>
                <input
                    type="text"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-9 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                    type="button"
                    onClick={() => onChange(currentValue)}
                    className="absolute right-3 w-[24px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                    aria-label="Clear search"
                >
                    <ChevronRightIcon size={24} />
                </button>
            </div>
        </div>
    );
};

export default SearchInput;
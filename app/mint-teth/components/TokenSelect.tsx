import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";

export interface TokenOption {
  value: `0x${string}`;
  label: string;
  imageSrc: string;
}

interface TokenSelectProps {
  options: TokenOption[];
  selected: TokenOption | undefined;
  disabled?: boolean;
  onChange: (val: TokenOption) => void;
}

export function TokenSelect({ options, selected, disabled, onChange }: TokenSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOptionClick = (option: TokenOption) => {
    onChange(option);
    setIsOpen(false);
  };

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        className={`dropdown-button ${disabled ? "cursor-default" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={options.length === 0 || disabled}
      >
        <div className="flex items-center justify-center">
          {selected ? (
            <>
              <Image src={selected.imageSrc} alt={selected.label} width={24} height={24} className="mr-3" />
              {selected.label}
            </>
          ) : (
            ""
          )}
        </div>
        {!disabled && (
          <svg
            className="ml-2 -mr-1 h-5 w-5 inline-block"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.658a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {isOpen && options.length > 0 && (
        <div className="dropdown-menu">
          <div className="py-1">
            {options.map((option) => (
              <button key={option.value} className="dropdown-item" onClick={() => handleOptionClick(option)}>
                <Image src={option.imageSrc} alt={option.label} width={20} height={20} className="mr-2" />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

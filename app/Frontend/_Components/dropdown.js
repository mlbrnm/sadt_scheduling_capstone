import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function Dropdown({ title, items, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <div className={`flex-1 h-full relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          absolute inset-0 flex justify-center items-center
          text-white hover:bg-[#00A3E0] transition-colors font-medium
          w-full
        "
      >
        {title}
        <svg
          className={`ml-1 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg border border-gray-200 z-50">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="
                block px-4 py-3 text-gray-800 hover:bg-gray-100 
                transition-colors border-b border-gray-100 last:border-b-0
              "
              onClick={() => setIsOpen(false)} // Close dropdown after click
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}

      {/* Separator line */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-300"></div>
    </div>
  );
}

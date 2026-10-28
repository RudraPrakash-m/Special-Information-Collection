import React, { useState, useRef, useEffect } from 'react';

interface FieldInfoTooltipProps {
  label: string;
  required?: boolean;
  tooltipText: string;
  exampleText?: string;
  className?: string;
}

export const FieldInfoTooltip: React.FC<FieldInfoTooltipProps> = ({
  label,
  required,
  tooltipText,
  exampleText,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsVisible(false);
      }
    };
    if (isVisible) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isVisible]);

  return (
    <div className={`flex items-center gap-1 mb-1.5 relative ${className}`}>
      <label className="ui-label !mb-0 cursor-default select-none">
        {label}
        {required && (
          <span className="ui-required" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {/* Info Icon & Popover matching screenshot */}
      <div
        ref={containerRef}
        className="relative inline-flex items-center ml-0.5"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <button
          type="button"
          onClick={() => setIsVisible((prev) => !prev)}
          aria-label={`Info about ${label}`}
          className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-amber-600/70 bg-[#fffbf2] dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[8px] font-bold leading-none cursor-pointer hover:bg-amber-100 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs"
        >
          i
        </button>

        {/* Popover Bubble matching Image 3 */}
        {isVisible && (
          <div
            role="tooltip"
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-72 p-3 rounded-lg border border-amber-200/90 bg-white dark:bg-gray-900 shadow-lg text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150"
          >
            <p className="text-xs font-normal text-gray-800 dark:text-gray-200 leading-relaxed">
              {tooltipText}
            </p>

            {exampleText && (
              <div className="mt-2 pt-2 border-t border-amber-100/80 dark:border-gray-800 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-normal text-gray-700 dark:text-gray-300">Example:</span>
                <span className="px-2 py-0.5 rounded bg-[#fef3c7]/80 dark:bg-amber-950/80 border border-amber-200/90 dark:border-amber-800 text-amber-950 dark:text-amber-200 font-mono text-[11px] font-medium break-all">
                  {exampleText}
                </span>
              </div>
            )}

            {/* Downward triangle arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-amber-200" />
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-white dark:border-t-gray-900" />
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldInfoTooltip;


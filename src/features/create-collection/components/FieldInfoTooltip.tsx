import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';

interface FieldInfoTooltipProps {
  label: string;
  required?: boolean;
  tooltipText: string;
  exampleText?: string;
  className?: string;
}

/** Minimum space between the bubble and the edge of the page area. */
const EDGE = 8;
/** Space between the icon and the bubble (mb-2 / mt-2). */
const GAP = 8;
/** The arrow stays at least this far from the bubble's corners. */
const ARROW_EDGE = 12;
const MAX_WIDTH = 320;

interface Placement {
  /** Horizontal move (px) from centred on the icon, to keep the bubble inside the page area. */
  shift: number;
  width: number;
  below: boolean;
}

/** Area the bubble must stay inside: the open dialog, else the page content (no sidebar / header), else the viewport. */
const getBounds = (anchor: HTMLElement) => {
  const area = (anchor.closest<HTMLElement>('[role="dialog"]') ?? document.getElementById('main-content'))?.getBoundingClientRect();
  return {
    top: Math.max(area?.top ?? 0, 0),
    left: Math.max(area?.left ?? 0, 0),
    right: Math.min(area?.right ?? window.innerWidth, window.innerWidth),
    bottom: Math.min(area?.bottom ?? window.innerHeight, window.innerHeight),
  };
};

export const FieldInfoTooltip: React.FC<FieldInfoTooltipProps> = ({
  label,
  required,
  tooltipText,
  exampleText,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const containerRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const lastPointer = useRef('');

  const show = () => setIsVisible(true);
  const hide = useCallback(() => {
    setIsVisible(false);
    setPlacement(null);
  }, []);

  // Fit the bubble inside the page area: narrower on small screens, moved left / right, below the icon when there is no room above.
  useLayoutEffect(() => {
    if (!isVisible) return;
    const update = () => {
      const anchor = containerRef.current;
      const bubble = bubbleRef.current;
      if (!anchor || !bubble) return;
      const a = anchor.getBoundingClientRect();
      const b = getBounds(anchor);
      const width = Math.max(0, Math.min(MAX_WIDTH, b.right - b.left - EDGE * 2));
      const centredLeft = a.left + a.width / 2 - width / 2;
      const left = Math.max(b.left + EDGE, Math.min(centredLeft, b.right - width - EDGE));
      const height = bubble.offsetHeight;
      const roomAbove = a.top - b.top - EDGE;
      const roomBelow = b.bottom - a.bottom - EDGE;
      const next = { shift: left - centredLeft, width, below: height + GAP > roomAbove && roomBelow > roomAbove };
      setPlacement((prev) =>
        prev && prev.shift === next.shift && prev.width === next.width && prev.below === next.below ? prev : next
      );
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    const ro = new ResizeObserver(update);
    if (bubbleRef.current) ro.observe(bubbleRef.current);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      ro.disconnect();
    };
  }, [isVisible]);

  useEffect(() => {
    const handleOutsideClick = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        hide();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    };
    if (isVisible) {
      document.addEventListener('pointerdown', handleOutsideClick);
      document.addEventListener('keydown', handleKey);
    }
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isVisible, hide]);

  const width = placement?.width ?? MAX_WIDTH;
  const shift = placement?.shift ?? 0;
  const arrowLeft = Math.max(ARROW_EDGE, Math.min(width / 2 - shift, width - ARROW_EDGE));

  return (
    <div className={`relative min-w-0 w-full ${className}`}>
      <label className="ui-label !mb-0 inline cursor-default select-none text-xs font-semibold text-foreground leading-snug">
        <span>{label}</span>
        {required && (
          <span className="ui-required ml-0.5" aria-hidden="true">
            *
          </span>
        )}
        {Boolean(tooltipText) && (
          <span
            ref={containerRef}
            className="relative inline-flex shrink-0 items-center ml-1 align-baseline"
            onPointerEnter={(e) => e.pointerType === 'mouse' && show()}
            onPointerLeave={(e) => e.pointerType === 'mouse' && hide()}
          >
            <button
              type="button"
              onPointerDown={(e) => {
                lastPointer.current = e.pointerType;
              }}
              onClick={() => {
                if (lastPointer.current === 'mouse') show();
                else if (isVisible) hide();
                else show();
                lastPointer.current = '';
              }}
              aria-label={`Info about ${label}`}
              aria-expanded={isVisible}
              className="inline-flex items-center justify-center w-3.5 h-3.5 text-[8px] rounded-full border border-amber-600/70 bg-[#fffbf2] dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold leading-none cursor-pointer hover:bg-amber-100 transition-colors focus:outline-none shadow-2xs translate-y-[-1px]"
            >
              i
            </button>

            {isVisible && (
              <div
                ref={bubbleRef}
                role="tooltip"
                style={{
                  width,
                  transform: `translateX(calc(-50% + ${shift}px))`,
                  visibility: placement ? 'visible' : 'hidden',
                }}
                className={`absolute left-1/2 ${placement?.below ? 'top-full mt-2' : 'bottom-full mb-2'} z-50 p-3 rounded-lg border border-amber-200/90 bg-white dark:bg-gray-900 shadow-lg text-left pointer-events-auto`}
              >
                <p className="text-xs font-normal text-gray-800 dark:text-gray-200 leading-relaxed break-words">
                  {tooltipText}
                </p>

                {exampleText && (
                  <div className="mt-2 pt-2 border-t border-amber-100/80 dark:border-gray-800 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="font-normal text-gray-700 dark:text-gray-300">Example:</span>
                    <span className="min-w-0 px-2 py-0.5 rounded bg-[#fef3c7]/80 dark:bg-amber-950/80 border border-amber-200/90 dark:border-amber-800 text-amber-950 dark:text-amber-200 font-mono text-[11px] font-medium break-all">
                      {exampleText}
                    </span>
                  </div>
                )}

                {/* Arrow pointing at the icon */}
                {placement?.below ? (
                  <>
                    <div style={{ left: arrowLeft }} className="absolute bottom-full -translate-x-1/2 w-0 h-0 border-x-[6px] border-x-transparent border-b-[6px] border-b-amber-200" />
                    <div style={{ left: arrowLeft }} className="absolute bottom-full -translate-x-1/2 -mb-[1px] w-0 h-0 border-x-[6px] border-x-transparent border-b-[6px] border-b-white dark:border-b-gray-900" />
                  </>
                ) : (
                  <>
                    <div style={{ left: arrowLeft }} className="absolute top-full -translate-x-1/2 w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-amber-200" />
                    <div style={{ left: arrowLeft }} className="absolute top-full -translate-x-1/2 -mt-[1px] w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-white dark:border-t-gray-900" />
                  </>
                )}
              </div>
            )}
          </span>
        )}
      </label>
    </div>
  );
};

export default FieldInfoTooltip;

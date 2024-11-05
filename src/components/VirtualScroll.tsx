import React, { useCallback, useEffect, useRef, useState } from 'react';

interface VirtualScrollProps {
  itemCount: number;
  height: number;
  itemHeight: number;
  renderItem: (index: number) => React.ReactNode;
  overscan?: number;
}

export const VirtualScroll: React.FC<VirtualScrollProps> = ({
  itemCount,
  height,
  itemHeight,
  renderItem,
  overscan = 3
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const getVisibleRange = useCallback(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(height / itemHeight);
    const startIndex = Math.max(0, start - overscan);
    const endIndex = Math.min(itemCount - 1, start + visibleCount + overscan);
    return { startIndex, endIndex };
  }, [scrollTop, height, itemHeight, overscan, itemCount]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === container) {
          setScrollTop(container.scrollTop);
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const { startIndex, endIndex } = getVisibleRange();
  const items = [];

  for (let i = startIndex; i <= endIndex; i++) {
    items.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          top: 0,
          transform: `translateY(${i * itemHeight}px)`,
          width: '100%',
          height: itemHeight
        }}
      >
        {renderItem(i)}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height,
        overflow: 'auto',
        position: 'relative'
      }}
      className="overflow-x-auto"
    >
      <div style={{ height: itemCount * itemHeight, minWidth: 'min-content' }}>
        {items}
      </div>
    </div>
  );
};
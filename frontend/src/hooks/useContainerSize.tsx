import { RefObject, useEffect, useRef, useState } from 'react';

const useContainerSize = (canvasRef: RefObject<HTMLCanvasElement>) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = containerSize.width;
      canvas.height = containerSize.height;
      // You can now use these dimensions for your game rendering logic
    }
  }, [containerSize]);

  return containerRef;
};

export default useContainerSize;

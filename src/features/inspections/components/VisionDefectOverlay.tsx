import { useEffect, useState, type RefObject } from 'react';

import type { VisionDetection } from '@/features/inspections/types/inspection';

interface VisionDefectOverlayProps {
  detections: VisionDetection[];
  imgRef: RefObject<HTMLImageElement | null>;
}

interface RenderRect {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

// object-contain(또는 auto-width + max-height) 렌더링 시 이미지 요소의 박스와
// 실제 보여지는 이미지 픽셀 영역이 다를 수 있어(letterboxing), naturalWidth/Height
// 기준으로 실제 보여지는 영역을 다시 계산한다.
function computeRenderRect(img: HTMLImageElement): RenderRect | null {
  const { naturalWidth, naturalHeight, offsetWidth, offsetHeight, offsetLeft, offsetTop } = img;
  if (!naturalWidth || !naturalHeight || !offsetWidth || !offsetHeight) {
    return null;
  }

  const boxRatio = offsetWidth / offsetHeight;
  const imageRatio = naturalWidth / naturalHeight;

  let visibleWidth: number;
  let visibleHeight: number;
  if (imageRatio > boxRatio) {
    visibleWidth = offsetWidth;
    visibleHeight = offsetWidth / imageRatio;
  } else {
    visibleHeight = offsetHeight;
    visibleWidth = offsetHeight * imageRatio;
  }

  return {
    offsetX: offsetLeft + (offsetWidth - visibleWidth) / 2,
    offsetY: offsetTop + (offsetHeight - visibleHeight) / 2,
    width: visibleWidth,
    height: visibleHeight,
  };
}

export function VisionDefectOverlay({ detections, imgRef }: VisionDefectOverlayProps) {
  const [renderRect, setRenderRect] = useState<RenderRect | null>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const measure = () => setRenderRect(computeRenderRect(img));

    if (img.complete) measure();
    img.addEventListener('load', measure);

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(img);
    }

    return () => {
      img.removeEventListener('load', measure);
      resizeObserver?.disconnect();
    };
  }, [imgRef]);

  if (!renderRect) return null;

  const visibleDetections = detections.filter(
    (detection) => detection.coordinateSpace === 'ORIGINAL_IMAGE_NORMALIZED'
  );

  return (
    <>
      {visibleDetections.map((detection, index) => {
        const [x1, y1, x2, y2] = detection.bbox;
        const style = {
          left: renderRect.offsetX + x1 * renderRect.width,
          top: renderRect.offsetY + y1 * renderRect.height,
          width: (x2 - x1) * renderRect.width,
          height: (y2 - y1) * renderRect.height,
        };

        return (
          <div
            key={`${detection.imageIndex}-${detection.defectType}-${index}`}
            className="absolute border-2 border-red-500 pointer-events-none"
            style={style}
          >
            <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
              {detection.defectType} {detection.ratio}% · {Math.round(detection.confidence * 100)}%
            </span>
          </div>
        );
      })}
    </>
  );
}

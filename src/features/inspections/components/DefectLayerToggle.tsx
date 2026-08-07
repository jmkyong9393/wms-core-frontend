interface DefectLayerToggleProps {
  showConfirmed: boolean;
  showYolo: boolean;
  onToggleConfirmed: () => void;
  onToggleYolo: () => void;
}

const BASE_CHIP_CLASS =
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold transition-colors duration-200 cursor-pointer';

const INACTIVE_CHIP_CLASS =
  'bg-muted border-border text-muted-foreground';

const CONFIRMED_ACTIVE_CLASS =
  'bg-red-50 border-red-300 text-red-600 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400';

const YOLO_ACTIVE_CLASS =
  'bg-orange-50 border-orange-300 text-orange-600 dark:bg-orange-950/30 dark:border-orange-900 dark:text-orange-400';

export function DefectLayerToggle({
  showConfirmed,
  showYolo,
  onToggleConfirmed,
  onToggleYolo,
}: DefectLayerToggleProps) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-pressed={showConfirmed}
        onClick={onToggleConfirmed}
        className={`${BASE_CHIP_CLASS} ${showConfirmed ? CONFIRMED_ACTIVE_CLASS : INACTIVE_CHIP_CLASS}`}
      >
        <span
          className={`h-2 w-2 rounded-sm ${showConfirmed ? 'bg-red-500' : 'bg-muted-foreground/40'}`}
        />
        확정 결함
      </button>
      <button
        type="button"
        aria-pressed={showYolo}
        onClick={onToggleYolo}
        className={`${BASE_CHIP_CLASS} ${showYolo ? YOLO_ACTIVE_CLASS : INACTIVE_CHIP_CLASS}`}
      >
        <span
          className={`h-2 w-2 rounded-sm ${showYolo ? 'bg-orange-500' : 'bg-muted-foreground/40'}`}
        />
        YOLO 후보
      </button>
    </div>
  );
}

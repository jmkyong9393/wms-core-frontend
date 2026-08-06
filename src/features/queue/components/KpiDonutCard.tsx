const RADIUS = 23;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export interface KpiTrend {
  direction: 'up' | 'down';
  label: string;
}

export interface KpiBarSegment {
  label: string;
  ratio: number;
  colorClass: string;
}

interface KpiDonutCardProps {
  label: string;
  centerValue: string;
  ratio: number;
  colorClass: string;
  variant?: 'donut' | 'bar';
  barSegments?: KpiBarSegment[];
  // 어제 대비는 실제 일자별 집계 API가 없어 계산할 수 없는 값이라 고정 mock값
  // 백엔드 연동 때 실제 값으로 교체 필요
  trend?: KpiTrend;
}

function DonutVisual({ ratio, colorClass }: { ratio: number; colorClass: string }) {
  const clampedRatio = Math.min(100, Math.max(0, ratio));
  const dashOffset = CIRCUMFERENCE * (1 - clampedRatio / 100);

  return (
    <div className={colorClass}>
      <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90">
        <circle cx="26" cy="26" r={RADIUS} fill="none" stroke="currentColor" strokeOpacity={0.15} strokeWidth="6" />
        <circle
          cx="26"
          cy="26"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
        />
      </svg>
    </div>
  );
}

function BarVisual({ segments }: { segments: KpiBarSegment[] }) {
  return (
    <div className="flex items-end gap-1.5 h-[52px] w-[52px]">
      {segments.map((seg) => {
        const height = Math.min(100, Math.max(4, seg.ratio));
        return (
          <div key={seg.label} className="flex-1 h-full flex items-end" title={seg.label}>
            <div className={`w-full rounded-t-sm ${seg.colorClass}`} style={{ height: `${height}%` }} />
          </div>
        );
      })}
    </div>
  );
}

// KPI 카드
export default function KpiDonutCard({
  label,
  centerValue,
  ratio,
  colorClass,
  variant = 'donut',
  barSegments,
  trend,
}: KpiDonutCardProps) {
  return (
    <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-bold text-foreground truncate mb-1">{label}</p>
        <p className="text-xl font-bold text-foreground">{centerValue}</p>
        {trend && (
          <p
            className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${
              trend.direction === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
            }`}
          >
            <span>
              {trend.direction === 'up' ? '▲' : '▼'} {trend.label}
            </span>
            <span className="text-muted-foreground font-normal">어제 대비</span>
          </p>
        )}
      </div>
      <div className="shrink-0">
        {variant === 'bar' && barSegments ? (
          <BarVisual segments={barSegments} />
        ) : (
          <DonutVisual ratio={ratio} colorClass={colorClass} />
        )}
      </div>
    </div>
  );
}

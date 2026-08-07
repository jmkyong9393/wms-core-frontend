'use client';

import {
  AlertTriangle,
  ClipboardCheck,
  MapPin,
  PackageCheck,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatKstDateTime } from '@/lib/date';
import { useInboundDashboardSummaryQuery } from '@/features/dashboard/hooks/useInboundDashboardSummaryQuery';

const GRADE_LABELS = {
  MINT: 'S등급',
  EXCELLENT: 'A등급',
  NORMAL: 'B등급',
  REJECT: '반려',
} as const;

const INBOUND_TYPE_LABELS = {
  NEW_STOCK: '신간 입고',
  USED_PURCHASE: '중고 매입',
  CUSTOMER_RETURN: '중고·반품',
} as const;

const INBOUND_STATUS_LABELS = {
  RECEIVED: '입고 접수',
  CHECKING: '검수 중',
  COMPLETED: '입고 완료',
} as const;

const GRADE_COLORS = {
  MINT: '#6366f1',
  EXCELLENT: '#10b981',
  NORMAL: '#f59e0b',
  REJECT: '#ef4444',
} as const;

export default function InboundSummaryTab() {
  const {
    data: summary,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useInboundDashboardSummaryQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-muted-foreground">
          입고 현황을 불러오는 중입니다.
        </p>
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-center">
        <AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400" />
        <p className="text-sm text-muted-foreground">
          입고 현황을 불러오지 못했습니다.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/60"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          다시 시도
        </button>
      </div>
    );
  }

  const trendData = summary.daily_inbound_trend.map((item) => ({
    date: item.date.slice(5).replace('-', '/'),
    신간: item.new_stock_quantity,
    중고반품: item.used_return_quantity,
  }));

  const gradeData = summary.grade_distribution
    .filter((item) => item.quantity > 0)
    .map((item) => ({
      name: GRADE_LABELS[item.grade],
      value: item.quantity,
      color: GRADE_COLORS[item.grade],
    }));

  return (
    <div className="space-y-4 pb-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="금일 입고 수량"
          value={`${summary.today_inbound_quantity}권`}
          icon={<PackageCheck className="h-3.5 w-3.5" />}
          tone="indigo"
        />
        <KpiCard
          label="금일 검수 완료"
          value={`${summary.completed_inspection_count}건`}
          icon={<ClipboardCheck className="h-3.5 w-3.5" />}
          tone="emerald"
        />
        <KpiCard
          label="검수 대기·진행"
          value={`${summary.pending_inspection_count}건`}
          icon={<RefreshCw className="h-3.5 w-3.5" />}
          tone="amber"
        />
        <KpiCard
          label="재촬영 요청"
          value={`${summary.recheck_required_count}건`}
          icon={<RotateCcw className="h-3.5 w-3.5" />}
          tone="rose"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm xl:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                최근 7일 입고 추이
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                신간과 중고·반품의 실제 재고 편입 수량입니다.
              </p>
            </div>
            {isFetching && (
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid
                  stroke="#f3f4f6"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  fontSize={11}
                  stroke="#9ca3af"
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  fontSize={11}
                  stroke="#9ca3af"
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    border: '1px solid #f3f4f6',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  }}
                />
                <Legend
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12 }}
                />
                <Bar
                  dataKey="신간"
                  fill="#818cf8"
                  maxBarSize={28}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="중고반품"
                  fill="#34d399"
                  maxBarSize={28}
                  radius={[4, 4, 0, 0]}
                  name="중고·반품"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm xl:col-span-2">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-foreground">
              중고·반품 검수 등급 분포
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              최근 7일 최종 처리된 검수 건 기준입니다.
            </p>
          </div>

          <div className="h-[260px]">
            {gradeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="46%"
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={3}
                  >
                    {gradeData.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      border: '1px solid #f3f4f6',
                      borderRadius: '12px',
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    iconSize={7}
                    iconType="circle"
                    wrapperStyle={{ bottom: 0, fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                최근 검수 완료 데이터가 없습니다.
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm xl:col-span-2">
          <div className="mb-5">
            <h3 className="text-sm font-bold text-foreground">
              구역별 가용 재고
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              예약 수량을 제외한 신간 및 판매 가능 중고 재고입니다.
            </p>
          </div>

          <div className="space-y-4">
            {summary.zone_stocks.map((zone) => (
              <div key={zone.zone} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
                    <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                    Zone {zone.zone}
                  </span>
                  <span className="font-semibold text-muted-foreground">
                    {zone.available_quantity}권
                  </span>
                </div>
                <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                  {zone.available_quantity > 0 && (
                    <>
                      <div
                        className="bg-indigo-400"
                        style={{
                          width: `${
                            (zone.new_stock_quantity /
                              zone.available_quantity) *
                            100
                          }%`,
                        }}
                      />
                      <div
                        className="bg-emerald-400"
                        style={{
                          width: `${
                            (zone.used_stock_quantity /
                              zone.available_quantity) *
                            100
                          }%`,
                        }}
                      />
                    </>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  신간 {zone.new_stock_quantity}권 · 중고 {zone.used_stock_quantity}권
                </p>
              </div>
            ))}

            {summary.zone_stocks.length === 0 && (
              <div className="py-10 text-center text-sm text-muted-foreground">
                가용 재고 데이터가 없습니다.
              </div>
            )}
          </div>
        </section>

        <section className="flex min-h-0 flex-col rounded-3xl border border-border bg-card p-5 shadow-sm xl:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                최근 입고·검수 내역
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                최근 접수된 입고 항목 10건입니다.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border font-bold text-muted-foreground">
                  <th className="px-1 py-2">도서명</th>
                  <th className="px-1 py-2">입고 유형</th>
                  <th className="px-1 py-2">수량</th>
                  <th className="px-1 py-2">상태</th>
                  <th className="px-1 py-2">위치</th>
                  <th className="whitespace-nowrap px-1 py-2">접수 시각</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {summary.recent_activities.length > 0 ? (
                  summary.recent_activities.map((item) => (
                    <tr key={item.inbound_item_id} className="text-muted-foreground">
                      <td className="max-w-[180px] truncate px-1 py-3 font-medium text-foreground">
                        {item.book_title}
                      </td>
                      <td className="px-1 py-3">
                        {INBOUND_TYPE_LABELS[item.inbound_type]}
                      </td>
                      <td className="px-1 py-3">{item.quantity}권</td>
                      <td className="px-1 py-3">
                        <InboundStatusBadge status={item.inbound_status} />
                      </td>
                      <td className="px-1 py-3 font-mono">
                        {item.location_barcode ?? '-'}
                      </td>
                      <td className="whitespace-nowrap px-1 py-3">
                        {formatKstDateTime(item.occurred_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      최근 입고 내역이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: 'indigo' | 'emerald' | 'amber' | 'rose';
}) {
  const toneClassName = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400',
  }[tone];

  return (
    <div className="space-y-2 rounded-3xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase text-muted-foreground">
          {label}
        </span>
        <span className={`rounded-lg p-1.5 ${toneClassName}`}>
          {icon}
        </span>
      </div>
      <span className="text-xl font-black text-foreground">{value}</span>
    </div>
  );
}

function InboundStatusBadge({
  status,
}: {
  status: 'RECEIVED' | 'CHECKING' | 'COMPLETED';
}) {
  const className = {
    RECEIVED:
      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    CHECKING:
      'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400',
    COMPLETED:
      'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400',
  }[status];

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${className}`}>
      {INBOUND_STATUS_LABELS[status]}
    </span>
  );
}
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Settings,
  Users,
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
import {
  getFdsReports,
  getWeeklyInsights,
} from '@/services/dashboardService';
import type {
  FdsReport,
  WeeklyInsight,
} from '@/types/dashboardTypes';

import FdsPolicySettingsDrawer from './FdsPolicySettingsDrawer';

const COLORS = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
];


export default function OperationalInsightsTab() {
  const [insights, setInsights] = useState<WeeklyInsight[]>([]);
  const [fdsReports, setFdsReports] = useState<FdsReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setIsError(false);

      const [insightsResponse, reportsResponse] = await Promise.all([
        getWeeklyInsights(),
        getFdsReports(),
      ]);

      setInsights(insightsResponse);
      setFdsReports(reportsResponse);
    } catch (error) {
      console.error('운영 인사이트 조회 실패', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const latestInsight = insights.at(-1) ?? null;

  const criticalReports = useMemo(
    () => fdsReports.filter((report) => report.fraud_score >= 90),
    [fdsReports],
  );

  const publisherData = useMemo(
    () =>
      Object.entries(
        latestInsight?.top_defective_publishers ?? {},
      )
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    [latestInsight],
  );

  const logisticsData = useMemo(
    () =>
      Object.entries(latestInsight?.logistics_hotspots ?? {}).map(
        ([name, count]) => ({ name, count }),
      ),
    [latestInsight],
  );

  const locationData = useMemo(
    () =>
      Object.entries(latestInsight?.location_hotspots ?? {})
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
    [latestInsight],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-violet-600" />
        <p className="text-sm font-medium text-muted-foreground">
          운영 인사이트를 불러오는 중입니다.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-center">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-muted-foreground">
          운영 인사이트를 불러오지 못했습니다.
        </p>
        <button
          type="button"
          onClick={() => void loadData()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-600 transition-colors hover:bg-violet-100 dark:bg-violet-950/40 dark:text-violet-300"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h3 className="text-base font-bold text-foreground">
            운영 인사이트
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
            거래·반품·품질 이슈를 운영 관점에서 확인합니다.
            </p>
        </div>

        <button
            type="button"
            onClick={() => setIsPolicyOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-violet-50 px-3 py-2 text-xs font-bold text-violet-600 transition-colors hover:bg-violet-100 dark:bg-violet-950/40 dark:text-violet-300 dark:hover:bg-violet-950/60"
        >
            <Settings className="h-3.5 w-3.5" />
            운영 기준 설정
        </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <InsightKpiCard
                label="확인 필요 거래"
                value={`${fdsReports.length}건`}
                description="최근 탐지된 확인 필요 거래"
                icon={<Users className="h-3.5 w-3.5" />}
                tone="violet"
            />
            <InsightKpiCard
                label="우선 확인 거래"
                value={`${criticalReports.length}건`}
                description="우선 조치가 필요한 고위험 거래"
                icon={<ShieldAlert className="h-3.5 w-3.5" />}
                tone="rose"
            />
            <InsightKpiCard
                label="반품 주의 건"
                value={`${latestInsight?.predicted_returns ?? 0}건`}
                description="이번 주 운영 점검 대상"
                icon={<AlertTriangle className="h-3.5 w-3.5" />}
                tone="amber"
            />
        </div>

      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-foreground">
            확인 필요 거래 고객 목록
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            반품·환불 패턴을 기준으로 운영 확인이 필요한 고객 거래입니다.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border font-bold text-muted-foreground">
                <th className="px-1 py-2">고객</th>
                <th className="px-1 py-2">확인 사유</th>
                <th className="px-1 py-2">우선순위</th>
                <th className="whitespace-nowrap px-1 py-2">탐지 시각</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {fdsReports.length > 0 ? (
                fdsReports.map((report) => {
                  const isCritical = report.fraud_score >= 90;

                  return (
                    <tr key={report.id} className="text-muted-foreground">
                      <td className="px-1 py-3 font-medium text-foreground">
                        {report.customer_name ?? '미확인 고객'}
                      </td>
                      <td className="max-w-[480px] truncate px-1 py-3">
                        {report.fraud_reason ?? '운영 확인이 필요한 거래 패턴'}
                      </td>
                      <td className="px-1 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isCritical
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                              : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                          }`}
                        >
                          {isCritical ? '우선 확인' : '확인 필요'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-1 py-3">
                        {formatKstDateTime(report.detected_at)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    현재 확인이 필요한 거래가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <InsightChartCard
          title="출판사별 불량 도서 비율"
          description="최근 주간 리포트 기준 상위 출판사 현황"
          icon={<Building2 className="h-4 w-4 text-violet-500" />}
        >
          {publisherData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={publisherData} layout="vertical">
                <CartesianGrid
                  stroke="#f3f4f6"
                  strokeDasharray="3 3"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  fontSize={10}
                  stroke="#9ca3af"
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={86}
                  fontSize={10}
                  stroke="#4b5563"
                  tickLine={false}
                />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="count"
                  fill="#818cf8"
                  name="불량 건수"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </InsightChartCard>

        <InsightChartCard
          title="물류센터별 반품 점유율"
          description="최근 주간 리포트 기준 반품 집중도"
          icon={<MapPin className="h-4 w-4 text-emerald-500" />}
        >
          {logisticsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={logisticsData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="46%"
                  innerRadius={48}
                  outerRadius={70}
                  paddingAngle={3}
                >
                  {logisticsData.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend
                  iconSize={7}
                  iconType="circle"
                  wrapperStyle={{ bottom: 0, fontSize: 10 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </InsightChartCard>

        <InsightChartCard
          title="로케이션별 불량 집중 구역"
          description="점검 우선순위를 위한 구역별 발생 현황"
          icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
        >
          {locationData.length > 0 ? (
            <div className="space-y-3 overflow-y-auto pr-1">
              {locationData.map((item) => {
                const total = locationData.reduce(
                  (sum, location) => sum + location.count,
                  0,
                );
                const ratio = total > 0 ? (item.count / total) * 100 : 0;

                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-foreground">
                      <span>{item.name}</span>
                      <span>
                        {item.count}건 ({ratio.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-violet-500"
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyChart />
          )}
        </InsightChartCard>
      </div>
      
      <FdsPolicySettingsDrawer
        open={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
      />
    </div>
  );
}

function InsightKpiCard({
  label,
  value,
  description,
  icon,
  tone,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  tone: 'violet' | 'rose' | 'amber';
}) {
  const toneClassName = {
    violet:
      'bg-violet-50 text-violet-600 dark:bg-violet-950/20 dark:text-violet-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400',
    amber:
      'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400',
  }[tone];

  return (
    <div className="space-y-2 rounded-3xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase text-muted-foreground">
          {label}
        </span>
        <span className={`rounded-lg p-1.5 ${toneClassName}`}>{icon}</span>
      </div>
      <p className="text-xl font-black text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{description}</p>
    </div>
  );
}

function InsightChartCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex h-[290px] flex-col rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      집계 데이터가 없습니다.
    </div>
  );
}
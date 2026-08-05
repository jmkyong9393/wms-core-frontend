'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  Coins,
  Activity,
  ShieldAlert,
  Settings,
  HelpCircle,
  AlertTriangle,
  RefreshCw,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
} from 'recharts';
import {
  getInspectionMetrics,
  getWeeklyInsights,
  getFdsReports,
  getFdsPolicies,
  updateFdsPolicy,
  getMockInspectionMetrics,
  getMockWeeklyInsights,
  getMockFdsReports,
  getMockFdsPolicies,
  updateMockFdsPolicy,
} from '@/services/dashboardService';
import { formatKstTime } from '@/lib/date';
import type {
  InspectionMetrics,
  WeeklyInsight,
  FdsReport,
  FdsPolicy,
} from '@/types/dashboardTypes';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const POLICY_FRIENDLY_NAMES: Record<string, string> = {
  MAX_RETURN_30D: '최근 30일 최대 반품 제한 횟수',
  MIN_UBCI_SCORE: '최소 허용 UBCI 품질 점수',
  MAX_RETURN_90D: '최근 90일 최대 반품 제한 횟수',
  MAX_REFUND_AMT: '최대 누적 환불 제한 금액',
};

// 일별 입출고 추이 시뮬레이션용 시계열 데이터
const MOCK_DAILY_FLOW = [
  { date: '07/22', 입고건수: 120, 출고건수: 85, 평균시간: 5.2 },
  { date: '07/23', 입고건수: 145, 출고건수: 95, 평균시간: 4.8 },
  { date: '07/24', 입고건수: 110, 출고건수: 115, 평균시간: 5.5 },
  { date: '07/25', 입고건수: 130, 출고건수: 110, 평균시간: 4.6 },
  { date: '07/26', 입고건수: 155, 출고건수: 125, 평균시간: 4.2 },
  { date: '07/27', 입고건수: 90, 출고건수: 70, 평균시간: 5.0 },
  { date: '07/28', 입고건수: 140, 출고건수: 105, 평균시간: 4.8 },
];

export default function ComprehensiveStatsTab() {
  const [metrics, setMetrics] = useState<InspectionMetrics | null>(null);
  const [insights, setInsights] = useState<WeeklyInsight[]>([]);
  const [fdsReports, setFdsReports] = useState<FdsReport[]>([]);
  const [fdsPolicies, setFdsPolicies] = useState<FdsPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [successKey, setSuccessKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, number>>({});
  const [isApiFallback, setIsApiFallback] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      let fetchedMetrics: InspectionMetrics;
      let fetchedInsights: WeeklyInsight[];
      let fetchedReports: FdsReport[];
      let fetchedPolicies: FdsPolicy[];

      try {
        [fetchedMetrics, fetchedInsights, fetchedReports, fetchedPolicies] = await Promise.all([
          getInspectionMetrics(),
          getWeeklyInsights(),
          getFdsReports(),
          getFdsPolicies(),
        ]);
        setIsApiFallback(false);
      } catch (error) {
        console.warn('실제 백엔드 API 연동 실패, Mock 시뮬레이션 데이터로 대체 로드합니다:', error);
        setIsApiFallback(true);
        fetchedMetrics = getMockInspectionMetrics();
        fetchedInsights = getMockWeeklyInsights();
        fetchedReports = getMockFdsReports();
        fetchedPolicies = getMockFdsPolicies();
      }

      setMetrics(fetchedMetrics);
      setInsights(fetchedInsights);
      setFdsReports(fetchedReports);
      setFdsPolicies(fetchedPolicies);

      // 정책 편집 폼 기본값 설정
      const initialEditValues: Record<string, number> = {};
      fetchedPolicies.forEach((p) => {
        initialEditValues[p.policy_key] = Number(p.policy_value);
      });
      setEditValues(initialEditValues);
    } catch (error) {
      console.error('대시보드 데이터 로드 중 치명적 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePolicyChange = (key: string, value: number) => {
    setEditValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePolicySubmit = async (key: string) => {
    const updatedValue = editValues[key];

    // 입력값 유효성 검증 (Validation)
    if (key === 'MAX_RETURN_30D' || key === 'MAX_RETURN_90D') {
      if (updatedValue < 1 || !Number.isInteger(updatedValue)) {
        alert('반품 횟수 임계값은 1 이상의 정수여야 합니다.');
        return;
      }
    }
    if (key === 'MIN_UBCI_SCORE') {
      if (updatedValue < 0 || updatedValue > 100) {
        alert('UBCI 최하 한계 점수는 0에서 100 사이의 숫자여야 합니다.');
        return;
      }
    }
    if (key === 'MAX_REFUND_AMT') {
      if (updatedValue < 0) {
        alert('최대 허용 환불 금액은 0원 이상이어야 합니다.');
        return;
      }
    }

    try {
      setUpdatingKey(key);
      
      if (isApiFallback) {
        updateMockFdsPolicy(key, updatedValue);
      } else {
        try {
          await updateFdsPolicy(key, updatedValue);
        } catch (apiError) {
          console.warn('API로 정책 업데이트 실패, 로컬 Mock 모드로 반영합니다:', apiError);
          setIsApiFallback(true);
          updateMockFdsPolicy(key, updatedValue);
        }
      }

      setSuccessKey(key);
      
      // 1.5초 후 성공 표시 초기화
      setTimeout(() => {
        setSuccessKey(null);
      }, 1500);

      // 데이터 갱신
      let fetchedReports: FdsReport[];
      let fetchedPolicies: FdsPolicy[];

      if (isApiFallback) {
        fetchedReports = getMockFdsReports();
        fetchedPolicies = getMockFdsPolicies();
      } else {
        try {
          [fetchedReports, fetchedPolicies] = await Promise.all([
            getFdsReports(),
            getFdsPolicies(),
          ]);
        } catch (error) {
          fetchedReports = getMockFdsReports();
          fetchedPolicies = getMockFdsPolicies();
        }
      }

      setFdsReports(fetchedReports);
      setFdsPolicies(fetchedPolicies);
    } catch (error) {
      console.error('FDS 정책 임계치 수정 실패:', error);
      alert('정책 변경에 실패했습니다.');
    } finally {
      setUpdatingKey(null);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="animate-spin text-indigo-600 w-8 h-8" />
        <p className="text-gray-500 font-medium text-sm">종합 대시보드 통계 데이터 분석 중...</p>
      </div>
    );
  }

  // 1. KPI 카드용 계산
  const latestInsight = insights[insights.length - 1] || null;
  const savedLaborCost = latestInsight ? latestInsight.saved_labor_cost_krw : 0;
  const predictedReturns = latestInsight ? latestInsight.predicted_returns : 0;

  const totalJobs = metrics?.total_jobs || 0;
  const approvedJobs = metrics?.approved_jobs || 0;
  const rejectedJobs = metrics?.rejected_jobs || 0;
  const automationRatio = totalJobs > 0 ? ((approvedJobs + rejectedJobs) / totalJobs) * 100 : 0;

  // FDS 위험도 집계
  const criticalFdsCount = fdsReports.filter((r) => r.fraud_score >= 90).length;
  const warningFdsCount = fdsReports.filter((r) => r.fraud_score < 90).length;

  // 2. 핫스팟 차트 데이터 가공
  const publisherData = latestInsight?.top_defective_publishers
    ? Object.entries(latestInsight.top_defective_publishers)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    : [];

  const logisticsData = latestInsight?.logistics_hotspots
    ? Object.entries(latestInsight.logistics_hotspots).map(([name, count]) => ({ name, count }))
    : [];

  const locationData = latestInsight?.location_hotspots
    ? Object.entries(latestInsight.location_hotspots).map(([name, count]) => ({ name, count }))
    : [];

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto animate-fade-in pb-8">
      {/* API 연결 상태 경고 배너 */}
      {isApiFallback && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>백엔드 API 미연결 안내</strong>: 백엔드에 대시보드 API 엔드포인트가 연동되지 않아 모의(Mock) 데이터 시뮬레이션 모드로 자동 대체되었습니다. 임계치 수정은 로컬 브라우저 세션에 정상 기록됩니다.
          </span>
        </div>
      )}
      {/* ─── 상단 요약 카드 행 (KPI Summary) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: 누적 인건비 절감액 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">
              주간 누적 인건비 절감액
            </span>
            <span className="text-2xl font-extrabold text-gray-800">
              ₩{savedLaborCost.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-emerald-600 block flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              전주 대비 +12.4%
            </span>
          </div>
          <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: 자동화 처리 비중 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">
              AI 검수 자동 승인율
            </span>
            <span className="text-2xl font-extrabold text-gray-800">
              {automationRatio.toFixed(1)}%
            </span>
            <span className="text-xs font-medium text-gray-400 block">
              총 {totalJobs}건 중 {approvedJobs + rejectedJobs}건 자동 판정
            </span>
          </div>
          <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: 예측 반품량 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">
              주간 예측 반품량
            </span>
            <span className="text-2xl font-extrabold text-gray-800">
              {predictedReturns}건
            </span>
            <span className="text-xs font-medium text-amber-600 block flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              전주 대비 예측량 소폭 증가
            </span>
          </div>
          <div className="bg-amber-50 p-3 rounded-2xl text-amber-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: FDS 활성 이상징후 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">
              FDS 실시간 이상거래 탐지
            </span>
            <span className="text-2xl font-extrabold text-gray-800">
              {fdsReports.length}건
            </span>
            <span className="text-xs font-semibold text-rose-500 block flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              위험군(Critical): {criticalFdsCount}건 / 요주의: {warningFdsCount}건
            </span>
          </div>
          <div className="bg-rose-50 p-3 rounded-2xl text-rose-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ─── 중앙 차트 영역: 입출고 및 검수 속도 추이 (Double Axis ComposedChart) ─── */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-bold text-gray-800">입출고 추이 및 AI 검수 처리 소요시간</h3>
            <p className="text-xs text-gray-400 mt-0.5">최근 7일간의 물류 처리량 대비 AI 검수의 일자별 평균 처리 시간 병목 진단</p>
          </div>
          {loading && <RefreshCw className="animate-spin text-gray-400 w-4 h-4" />}
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={MOCK_DAILY_FLOW}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} />
              <YAxis yAxisId="left" stroke="#9ca3af" fontSize={11} tickLine={false} label={{ value: '입출고 수량 (건)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9ca3af', fontSize: 10 } }} />
              <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={11} tickLine={false} label={{ value: '평균 검수 속도 (초)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#9ca3af', fontSize: 10 } }} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} labelStyle={{ fontWeight: 'bold', color: '#1f2937' }} />
              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingBottom: 10 }} />
              <Bar yAxisId="left" dataKey="입고건수" fill="#818cf8" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar yAxisId="left" dataKey="출고건수" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Line yAxisId="right" type="monotone" dataKey="평균시간" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} name="평균 검수 시간 (초)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── FDS 이상 유저 리스트 영역 ─── */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-800">FDS 탐지 악성/의심 고객 리스트</h3>
            <p className="text-xs text-gray-400 mt-0.5">반품 주기, 환불금액 임계치 및 UBCI 지수를 종합한 AI 위험 분석 결과</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPolicyOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              임계값 설정 조절
            </button>
            <span className="text-xs bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full font-bold">
              이상거래 감지 활성
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-2">고객명</th>
                <th className="py-3 px-2">위험 등급</th>
                <th className="py-3 px-2">판정 근거 및 감지 룰</th>
                <th className="py-3 px-2 text-right">감지 시각</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {fdsReports.length > 0 ? (
                fdsReports.map((report) => {
                  const isCritical = report.fraud_score >= 90;
                  return (
                    <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-2 font-semibold text-gray-700">
                        {report.customer_name || '비공개'}
                        <span className="text-xs text-gray-400 block font-normal mt-0.5">ID: {report.customer_id}</span>
                      </td>
                      <td className="py-3.5 px-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isCritical
                              ? 'bg-rose-50 text-rose-600 border border-rose-100'
                              : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-rose-500' : 'bg-amber-400'}`}></span>
                          {isCritical ? `Critical (${report.fraud_score}점)` : `Warning (${report.fraud_score}점)`}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-xs text-gray-500 max-w-[250px] truncate" title={report.fraud_reason || ''}>
                        {report.fraud_reason || '사유가 기록되지 않았습니다.'}
                      </td>
                      <td className="py-3.5 px-2 text-right text-gray-400 text-xs font-medium">
                        {formatKstTime(report.detected_at)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400 text-sm">
                    현재 탐지된 위협 또는 이상 징후가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Drawer for FDS Policy Config */}
      {isPolicyOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-gray-500/20 backdrop-blur-xs transition-opacity duration-300 ease-in-out" 
              onClick={() => setIsPolicyOpen(false)}
            ></div>

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out sm:duration-700 bg-white shadow-2xl border-l border-gray-100 flex flex-col h-full">
                {/* Header */}
                <div className="px-5 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div>
                    <h2 className="text-base font-bold text-gray-800 flex items-center gap-1.5" id="slide-over-title">
                      <Settings className="w-4 h-4 text-indigo-500" />
                      FDS 룰셋 실시간 설정
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">이상거래 감지 임계값을 조절하여 룰을 수정합니다.</p>
                  </div>
                  <button 
                    type="button" 
                    className="rounded-lg p-1.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none transition-colors cursor-pointer"
                    onClick={() => setIsPolicyOpen(false)}
                  >
                    <span className="sr-only">Close panel</span>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
                  {fdsPolicies.map((policy) => {
                    const currentValue = editValues[policy.policy_key] ?? Number(policy.policy_value);
                    const isUpdating = updatingKey === policy.policy_key;
                    const isSuccess = successKey === policy.policy_key;

                    return (
                      <div key={policy.policy_key} className="p-4 bg-gray-50 rounded-xl space-y-2.5 border border-gray-100">
                        <div>
                          <span className="font-bold text-xs text-indigo-600 block">
                            {POLICY_FRIENDLY_NAMES[policy.policy_key] || policy.policy_key}
                          </span>
                          <span className="text-[11px] text-gray-400 leading-tight block mt-1">
                            {policy.description}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={currentValue}
                            onChange={(e) => handlePolicyChange(policy.policy_key, parseFloat(e.target.value) || 0)}
                            disabled={isUpdating}
                          />
                          <button
                            type="button"
                            className={`shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                              isSuccess
                                ? 'bg-emerald-500 text-white'
                                : isUpdating
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                            onClick={() => handlePolicySubmit(policy.policy_key)}
                            disabled={isUpdating || isSuccess}
                          >
                            {isSuccess ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                완료
                              </>
                            ) : isUpdating ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              '적용'
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 최하단 3분할 그리드: 분석 핫스팟 (Analytics Hotspots Grid) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 출판사별 불량 비율 (Defective Publishers) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[280px]">
          <div>
            <h3 className="text-sm font-bold text-gray-800">출판사별 불량 도서 비율</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">가장 오염/파손이 빈번한 출판사 집계</p>
          </div>
          <div className="flex-1 mt-4">
            {publisherData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={publisherData.slice(0, 5)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f9fafb" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={10} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#4b5563" fontSize={10} width={70} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Bar dataKey="count" fill="#818cf8" radius={[0, 4, 4, 0]} name="불량 건수" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">데이터가 없습니다.</div>
            )}
          </div>
        </div>

        {/* 물류센터별 반품 집중도 (Logistics Hotspots PieChart) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[280px]">
          <div>
            <h3 className="text-sm font-bold text-gray-800">물류센터별 반품 점유율</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">물류 유입 비중이 높은 상위 물류창고 정보</p>
          </div>
          <div className="flex-1 mt-4 relative">
            {logisticsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={logisticsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="name"
                  >
                    {logisticsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 10, bottom: -10 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">데이터가 없습니다.</div>
            )}
          </div>
        </div>

        {/* 창고 로케이션 이상 구역 (Location Hotspots) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[280px]">
          <div>
            <h3 className="text-sm font-bold text-gray-800">로케이션별 불량 집중 구역</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">반입된 도서 불량 중 적재된 구역의 위험 빈도 진단</p>
          </div>
          <div className="flex-1 mt-4 overflow-y-auto space-y-2.5">
            {locationData.length > 0 ? (
              locationData.map((loc, index) => {
                const totalCount = locationData.reduce((sum, item) => sum + item.count, 0);
                const pct = totalCount > 0 ? (loc.count / totalCount) * 100 : 0;
                return (
                  <div key={loc.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-gray-700">
                      <span>{loc.name} 구역</span>
                      <span>{loc.count}건 ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">데이터가 없습니다.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

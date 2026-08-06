/**
 * 최고 관리자 대시보드 및 FDS 통계 API 서비스
 *
 * 실제 백엔드 API 호출과 로컬 Mock 모드 시뮬레이션을 동일 인터페이스로 제공합니다.
 * Mock 모드 시 FDS 정책(룰 임계값)을 localStorage에 유지하여
 * UI에서의 값 수정이 대시보드 상태에 실시간으로 반영되도록 보장합니다.
 */
import { apiClient } from "@/lib/api-client";
import { isMockMode } from "@/services/returnService";
import type {
  InspectionMetrics,
  WeeklyInsight,
  FdsReport,
  FdsPolicy,
  FlowTrendResponse,
} from "@/types/dashboardTypes";

const MOCK_POLICIES_KEY = "wms_fds_policies";

const DEFAULT_MOCK_POLICIES: FdsPolicy[] = [
  {
    policy_key: "MAX_RETURN_30D",
    policy_value: 3,
    description: "최근 30일 내 최대 허용 반품 횟수 (초과 시 고의 파손 의심 분석 대상)",
    updated_at: new Date().toISOString(),
  },
  {
    policy_key: "MIN_UBCI_SCORE",
    policy_value: 30,
    description: "도서 등급 최하 한계 UBCI 점수 (이하인 경우 결함 의심)",
    updated_at: new Date().toISOString(),
  },
  {
    policy_key: "MAX_RETURN_90D",
    policy_value: 5,
    description: "최근 90일 내 최대 허용 반품 횟수 (초과 시 정밀 모니터링 경보)",
    updated_at: new Date().toISOString(),
  },
  {
    policy_key: "MAX_REFUND_AMT",
    policy_value: 500000,
    description: "누적 최대 허용 환불 금액 (원화 기준, 초과 시 위험군 분류)",
    updated_at: new Date().toISOString(),
  },
];

// ─── FDS Policies 헬퍼 함수 (Mock 데이터용) ───
function getStoredMockPolicies(): FdsPolicy[] {
  if (typeof window === "undefined") return DEFAULT_MOCK_POLICIES;
  const stored = localStorage.getItem(MOCK_POLICIES_KEY);
  if (!stored) {
    localStorage.setItem(MOCK_POLICIES_KEY, JSON.stringify(DEFAULT_MOCK_POLICIES));
    return DEFAULT_MOCK_POLICIES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_MOCK_POLICIES;
  }
}

// ─── Mock 데이터 생성용 동적 헬퍼 함수 ───

export function getMockInspectionMetrics(): InspectionMetrics {
  return {
    total_jobs: 154,
    pending_jobs: 8,
    processing_jobs: 14,
    hitl_required_jobs: 12,
    recheck_required_jobs: 3,
    approved_jobs: 102,
    rejected_jobs: 15,
    failed_jobs: 3,
    average_processing_time_seconds: 4.8,
  };
}

export function getMockWeeklyInsights(): WeeklyInsight[] {
  const today = new Date();
  return [
    {
      id: "mock-wi-1",
      report_week: "2026-W24",
      saved_labor_cost_krw: 840000,
      top_defective_publishers: { "한빛미디어": 12, "길벗": 8, "이지스퍼블리싱": 5, "제이펍": 3, "에이콘": 2 },
      location_hotspots: { "Zone A": 14, "Zone B": 10, "Zone C": 6 },
      logistics_hotspots: { "서울 제1 DC": 18, "경기 이천 센터": 12 },
      predicted_returns: 10,
      created_at: new Date(today.getTime() - 28 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(today.getTime() - 28 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "mock-wi-2",
      report_week: "2026-W25",
      saved_labor_cost_krw: 960000,
      top_defective_publishers: { "한빛미디어": 15, "길벗": 6, "이지스퍼블리싱": 8, "제이펍": 4, "에이콘": 1 },
      location_hotspots: { "Zone A": 18, "Zone B": 8, "Zone C": 5 },
      logistics_hotspots: { "서울 제1 DC": 22, "경기 이천 센터": 14 },
      predicted_returns: 14,
      created_at: new Date(today.getTime() - 21 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(today.getTime() - 21 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "mock-wi-3",
      report_week: "2026-W26",
      saved_labor_cost_krw: 1100000,
      top_defective_publishers: { "한빛미디어": 9, "길벗": 10, "이지스퍼블리싱": 7, "제이펍": 6, "에이콘": 3 },
      location_hotspots: { "Zone A": 11, "Zone B": 12, "Zone C": 8 },
      logistics_hotspots: { "서울 제1 DC": 19, "경기 이천 센터": 16 },
      predicted_returns: 9,
      created_at: new Date(today.getTime() - 14 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(today.getTime() - 14 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "mock-wi-4",
      report_week: "2026-W27",
      saved_labor_cost_krw: 1250000,
      top_defective_publishers: { "한빛미디어": 14, "길벗": 12, "이지스퍼블리싱": 9, "제이펍": 5, "에이콘": 4 },
      location_hotspots: { "Zone A": 16, "Zone B": 14, "Zone C": 7 },
      logistics_hotspots: { "서울 제1 DC": 25, "경기 이천 센터": 18 },
      predicted_returns: 11,
      created_at: new Date(today.getTime() - 7 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(today.getTime() - 7 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "mock-wi-5",
      report_week: "2026-W28",
      saved_labor_cost_krw: 1420000,
      top_defective_publishers: { "한빛미디어": 18, "길벗": 14, "이지스퍼블리싱": 11, "제이펍": 8, "에이콘": 5 },
      location_hotspots: { "Zone A": 22, "Zone B": 15, "Zone C": 9 },
      logistics_hotspots: { "서울 제1 DC": 30, "경기 이천 센터": 20 },
      predicted_returns: 15,
      created_at: today.toISOString(),
      updated_at: today.toISOString(),
    },
  ];
}

export function getMockFdsReports(): FdsReport[] {
  const today = new Date();
  const policies = getStoredMockPolicies();
  const maxReturn30d = policies.find(p => p.policy_key === "MAX_RETURN_30D")?.policy_value ?? 3;
  const maxReturn90d = policies.find(p => p.policy_key === "MAX_RETURN_90D")?.policy_value ?? 5;
  const maxRefundAmt = policies.find(p => p.policy_key === "MAX_REFUND_AMT")?.policy_value ?? 500000;
  
  return [
    {
      id: "fds-1",
      tenant_id: "tenant-uuid-1",
      customer_id: "cust-1021",
      customer_name: "김철수",
      fraud_score: 95,
      fraud_reason: `상습 고의 파손 의심 (최근 30일 반품 ${maxReturn30d + 1}회, 평균 UBCI 22.5점)`,
      detected_at: new Date(today.getTime() - 1.5 * 3600 * 1000).toISOString(),
      created_at: new Date(today.getTime() - 1.5 * 3600 * 1000).toISOString(),
      updated_at: new Date(today.getTime() - 1.5 * 3600 * 1000).toISOString(),
    },
    {
      id: "fds-2",
      tenant_id: "tenant-uuid-1",
      customer_id: "cust-4890",
      customer_name: "이영희",
      fraud_score: 75,
      fraud_reason: `과도한 반품/환불 (총액: ${(maxRefundAmt + 50000).toLocaleString()}원, 최근 90일 횟수: ${maxReturn90d + 2}회)`,
      detected_at: new Date(today.getTime() - 4 * 3600 * 1000).toISOString(),
      created_at: new Date(today.getTime() - 4 * 3600 * 1000).toISOString(),
      updated_at: new Date(today.getTime() - 4 * 3600 * 1000).toISOString(),
    },
    {
      id: "fds-3",
      tenant_id: "tenant-uuid-1",
      customer_id: "cust-8321",
      customer_name: "박민수",
      fraud_score: 95,
      fraud_reason: `상습 고의 파손 의심 (최근 30일 반품 ${maxReturn30d + 2}회, 평균 UBCI 18.0점)`,
      detected_at: new Date(today.getTime() - 12 * 3600 * 1000).toISOString(),
      created_at: new Date(today.getTime() - 12 * 3600 * 1000).toISOString(),
      updated_at: new Date(today.getTime() - 12 * 3600 * 1000).toISOString(),
    },
    {
      id: "fds-4",
      tenant_id: "tenant-uuid-1",
      customer_id: "cust-5561",
      customer_name: "정다은",
      fraud_score: 75,
      fraud_reason: `과도한 반품/환불 (총액: ${(maxRefundAmt + 120000).toLocaleString()}원, 최근 90일 횟수: ${maxReturn90d + 1}회)`,
      detected_at: new Date(today.getTime() - 24 * 3600 * 1000).toISOString(),
      created_at: new Date(today.getTime() - 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(today.getTime() - 24 * 3600 * 1000).toISOString(),
    },
  ];
}

export function getMockFdsPolicies(): FdsPolicy[] {
  return getStoredMockPolicies();
}

export function updateMockFdsPolicy(policyKey: string, policyValue: number): FdsPolicy {
  const policies = getStoredMockPolicies();
  const updatedPolicies = policies.map((p) => {
    if (p.policy_key === policyKey) {
      return {
        ...p,
        policy_value: policyValue,
        updated_at: new Date().toISOString(),
      };
    }
    return p;
  });
  localStorage.setItem(MOCK_POLICIES_KEY, JSON.stringify(updatedPolicies));
  return updatedPolicies.find((p) => p.policy_key === policyKey)!;
}

export function getMockFlowTrend(days: number = 7): FlowTrendResponse {
  const items = [
    { date: '07/22', inbound_quantity: 120, outbound_quantity: 85, average_inspection_processing_seconds: 5.2 },
    { date: '07/23', inbound_quantity: 145, outbound_quantity: 95, average_inspection_processing_seconds: 4.8 },
    { date: '07/24', inbound_quantity: 110, outbound_quantity: 115, average_inspection_processing_seconds: 5.5 },
    { date: '07/25', inbound_quantity: 130, outbound_quantity: 110, average_inspection_processing_seconds: 4.6 },
    { date: '07/26', inbound_quantity: 155, outbound_quantity: 125, average_inspection_processing_seconds: 4.2 },
    { date: '07/27', inbound_quantity: 90, outbound_quantity: 70, average_inspection_processing_seconds: 5.0 },
    { date: '07/28', inbound_quantity: 140, outbound_quantity: 105, average_inspection_processing_seconds: 4.8 },
  ];
  return {
    days,
    items,
  };
}

// ─── 1. 검수 수량 통계 및 평균 처리 속도 조회 ───
export async function getInspectionMetrics(): Promise<InspectionMetrics> {
  if (isMockMode()) {
    return getMockInspectionMetrics();
  }
  const res = await apiClient.get<InspectionMetrics>("/api/v1/admin/inspection-metrics");
  return res.data;
}

// ─── 2. 주간 누적 절감액 및 불량 분석 핫스팟 정보 조회 ───
export async function getWeeklyInsights(): Promise<WeeklyInsight[]> {
  if (isMockMode()) {
    return getMockWeeklyInsights();
  }
  const res = await apiClient.get<WeeklyInsight[]>("/api/v1/admin/weekly-insights");
  return res.data;
}

// ─── 3. 이상거래 위험군 탐지 기록 조회 ───
export async function getFdsReports(): Promise<FdsReport[]> {
  if (isMockMode()) {
    return getMockFdsReports();
  }
  const res = await apiClient.get<FdsReport[]>("/api/v1/admin/fds/reports");
  return res.data;
}

// ─── 4. FDS 룰셋 임계값 조회 ───
export async function getFdsPolicies(): Promise<FdsPolicy[]> {
  if (isMockMode()) {
    return getMockFdsPolicies();
  }
  const res = await apiClient.get<FdsPolicy[]>("/api/v1/admin/fds/policies");
  return res.data;
}

// ─── 5. FDS 룰 임계값 단일 조절 ───
export async function updateFdsPolicy(
  policyKey: string,
  policyValue: number
): Promise<FdsPolicy> {
  if (isMockMode()) {
    return updateMockFdsPolicy(policyKey, policyValue);
  }
  const res = await apiClient.put<FdsPolicy>(`/api/v1/admin/fds/policies/${policyKey}`, {
    policy_value: policyValue,
  });
  return res.data;
}

// ─── 6. 대시보드 입출고 및 검수 속도 추이 조회 ───
export async function getFlowTrend(days: number = 7): Promise<FlowTrendResponse> {
  if (isMockMode()) {
    return getMockFlowTrend(days);
  }
  const res = await apiClient.get<FlowTrendResponse>(`/api/v1/admin/dashboard/flow-trend?days=${days}`);
  return res.data;
}

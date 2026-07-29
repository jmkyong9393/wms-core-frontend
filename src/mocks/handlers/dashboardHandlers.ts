import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/lib/api-client";
import type {
  InspectionMetrics,
  WeeklyInsight,
  FdsReport,
  FdsPolicy,
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

function getStoredPolicies(): FdsPolicy[] {
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

export const dashboardHandlers = [
  // 1. 검수 수량 통계 및 평균 처리 속도 조회
  http.get(`${API_BASE_URL}/api/v1/admin/inspection-metrics`, () => {
    const metrics: InspectionMetrics = {
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
    return HttpResponse.json(metrics);
  }),

  // 2. 주간 누적 절감액 및 불량 분석 핫스팟 정보 조회
  http.get(`${API_BASE_URL}/api/v1/admin/weekly-insights`, () => {
    const today = new Date();
    const insights: WeeklyInsight[] = [
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
    return HttpResponse.json(insights);
  }),

  // 3. 이상거래 위험군 탐지 기록 조회
  http.get(`${API_BASE_URL}/api/v1/admin/fds/reports`, () => {
    const today = new Date();
    const policies = getStoredPolicies();
    const maxReturn30d = policies.find(p => p.policy_key === "MAX_RETURN_30D")?.policy_value ?? 3;
    const maxReturn90d = policies.find(p => p.policy_key === "MAX_RETURN_90D")?.policy_value ?? 5;
    const maxRefundAmt = policies.find(p => p.policy_key === "MAX_REFUND_AMT")?.policy_value ?? 500000;

    const reports: FdsReport[] = [
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
    return HttpResponse.json(reports);
  }),

  // 4. FDS 룰셋 임계값 조회
  http.get(`${API_BASE_URL}/api/v1/admin/fds/policies`, () => {
    return HttpResponse.json(getStoredPolicies());
  }),

  // 5. FDS 룰 임계값 단일 조절
  http.put(`${API_BASE_URL}/api/v1/admin/fds/policies/:policyKey`, async ({ params, request }) => {
    const { policyKey } = params;
    const body = (await request.json()) as { policy_value: number };
    const policies = getStoredPolicies();
    
    let updatedPolicy: FdsPolicy | null = null;
    const updatedPolicies = policies.map((p) => {
      if (p.policy_key === policyKey) {
        updatedPolicy = {
          ...p,
          policy_value: body.policy_value,
          updated_at: new Date().toISOString(),
        };
        return updatedPolicy;
      }
      return p;
    });

    if (updatedPolicy) {
      if (typeof window !== "undefined") {
        localStorage.setItem(MOCK_POLICIES_KEY, JSON.stringify(updatedPolicies));
      }
      return HttpResponse.json(updatedPolicy);
    } else {
      return HttpResponse.json({ detail: "정책 키를 찾을 수 없습니다." }, { status: 404 });
    }
  }),
];

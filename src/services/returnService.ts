/**
 * 반품/중고 서적 AI 검수 API 서비스
 *
 * 실제 백엔드(`/api/v1/books`, `/api/v1/inbound/used-item`, `/api/v1/inspections`) 호출과
 * 로컬 Mock 모드 시뮬레이션을 동일 인터페이스로 제공한다.
 * Mock 모드 활성화 시 localStorage 기반으로 상태 전이를 시뮬레이션하여
 * 백엔드 없이도 프론트엔드 단독 개발/데모가 가능하다.
 */
import { apiClient } from "@/lib/api-client";
import type {
  InspectionMode,
  InspectionJobStatus,
  InspectionResult,
  CreateInspectionResult,
  InspectionStreamTicket,
  BookRegistrationResult,
  UsedItemInboundResult,
  UsedInboundType,
  StartInspectionPayload,
  BookGrade,
} from "@/types/returnTypes";

// ─── Mock 모드 제어 ───
// dashboardService.ts 등 다른 기능도 이 토글을 공유한다.

const MOCK_MODE_KEY = "wms_mock_mode";

export const isMockMode = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(MOCK_MODE_KEY) === "true";
};

export const setMockMode = (active: boolean): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(MOCK_MODE_KEY, String(active));
  }
};

// ─── 프론트 모드 ↔ 백엔드 enum 매핑 ───
// NEW_RETURN → 입고 CUSTOMER_RETURN / 검수 RETURN
// USED_PURCHASE → 입고 USED_PURCHASE / 검수 USED_PURCHASE

function toUsedInboundType(mode: InspectionMode): UsedInboundType {
  return mode === "NEW_RETURN" ? "CUSTOMER_RETURN" : "USED_PURCHASE";
}

function toBackendInspectionMode(mode: InspectionMode): "RETURN" | "USED_PURCHASE" {
  return mode === "NEW_RETURN" ? "RETURN" : "USED_PURCHASE";
}

// ─── ISBN 도서 마스터 등록/조회 ───

interface BookRegistrationApiResponse {
  book_id: string;
  isbn: string;
  title: string;
  original_price: string;
  publisher: string | null;
  category: string;
  created: boolean;
}

export async function registerBook(isbn: string): Promise<BookRegistrationResult> {
  if (isMockMode()) {
    return {
      bookId: `mock_book_${isbn}`,
      isbn,
      title: "Mock 도서 (로컬 시뮬레이션)",
      originalPrice: "15000.00",
      publisher: "Mock 출판사",
      category: "NOVEL",
      created: true,
    };
  }
  const res = await apiClient.post<BookRegistrationApiResponse>("/api/v1/books/register", {
    isbn,
  });
  return {
    bookId: res.data.book_id,
    isbn: res.data.isbn,
    title: res.data.title,
    originalPrice: res.data.original_price,
    publisher: res.data.publisher,
    category: res.data.category,
    created: res.data.created,
  };
}

// ─── 중고/반품 입고 접수 (LPN 발급) ───

interface UsedItemInboundApiResponse {
  inbound_id: string;
  inbound_item_id: string;
  inbound_type: UsedInboundType;
  status: string;
  book_id: string;
  lpn_barcode: string;
  certificate_url: string;
  label_scan_url: string;
  label_print_status: "SENT" | "SKIPPED" | "FAILED";
  label_print_error: string | null;
}

export async function createUsedItemInbound(params: {
  mode: InspectionMode;
  bookId: string;
  supplierName?: string;
  /** 중복 클릭·재시도 시 동일 값을 재사용해 백엔드 멱등 응답을 받는다 */
  idempotencyKey: string;
}): Promise<UsedItemInboundResult> {
  const { mode, bookId, supplierName, idempotencyKey } = params;

  if (isMockMode()) {
    return {
      inboundId: `mock_inbound_${idempotencyKey}`,
      inboundItemId: `mock_item_${idempotencyKey}`,
      inboundType: toUsedInboundType(mode),
      status: "CHECKING",
      bookId,
      lpnBarcode: `MOCKLPN${idempotencyKey.slice(0, 8)}`,
      certificateUrl: "https://placehold.co/certificate",
      labelScanUrl: "https://placehold.co/label-scan",
      labelPrintStatus: "SKIPPED",
      labelPrintError: null,
    };
  }

  const res = await apiClient.post<UsedItemInboundApiResponse>(
    "/api/v1/inbound/used-item",
    {
      inbound_type: toUsedInboundType(mode),
      book_id: bookId,
      supplier_name: supplierName,
    },
    { headers: { "Idempotency-Key": idempotencyKey } }
  );

  return {
    inboundId: res.data.inbound_id,
    inboundItemId: res.data.inbound_item_id,
    inboundType: res.data.inbound_type,
    status: res.data.status,
    bookId: res.data.book_id,
    lpnBarcode: res.data.lpn_barcode,
    certificateUrl: res.data.certificate_url,
    labelScanUrl: res.data.label_scan_url,
    labelPrintStatus: res.data.label_print_status,
    labelPrintError: res.data.label_print_error,
  };
}

// ─── 검수 상태/응답 API 어댑터 (snake_case → camelCase) ───

interface InspectionStatusApiResponse {
  job_id: string;
  task_id: string | null;
  status: InspectionJobStatus;
  progress: number;
  ubci_score: number | null;
  condition_grade: BookGrade | null;
  final_report: string | null;
  original_image_urls: string[];
}

function adaptInspectionStatus(data: InspectionStatusApiResponse): InspectionResult {
  return {
    jobId: data.job_id,
    taskId: data.task_id,
    status: data.status,
    progress: data.progress,
    ubciScore: data.ubci_score,
    conditionGrade: data.condition_grade,
    finalReport: data.final_report,
    originalImageUrls: data.original_image_urls,
  };
}

interface CreateInspectionApiResponse {
  job_id: string;
  task_id: string;
  status: InspectionJobStatus;
  message: string;
  stream_ticket_url: string;
}

function adaptCreateInspection(data: CreateInspectionApiResponse): CreateInspectionResult {
  return {
    jobId: data.job_id,
    taskId: data.task_id,
    status: data.status,
    message: data.message,
    streamTicketUrl: data.stream_ticket_url,
  };
}

// ─── 검수 생성 요청 ───

export async function startInspection(
  payload: StartInspectionPayload
): Promise<CreateInspectionResult> {
  if (isMockMode()) {
    const mockJobId = `mock_job_${Date.now()}`;
    const mockJobData = {
      createdAt: Date.now(),
      payload,
      status: "PENDING" as InspectionJobStatus,
    };
    localStorage.setItem(`wms_job_${mockJobId}`, JSON.stringify(mockJobData));
    return {
      jobId: mockJobId,
      taskId: `mock_task_${mockJobId}`,
      status: "PENDING",
      message: "Mock 검수 파이프라인 가동 시작",
      streamTicketUrl: `/api/v1/inspections/${mockJobId}/stream-ticket`,
    };
  }

  const res = await apiClient.post<CreateInspectionApiResponse>("/api/v1/inspections", {
    inbound_item_id: payload.inboundItemId,
    book_id: payload.bookId,
    mode: toBackendInspectionMode(payload.mode),
    image_paths: payload.imagePaths,
  });
  return adaptCreateInspection(res.data);
}

// ─── 재촬영 이미지 등록 및 재검수 요청 ───

export async function submitRecheck(
  jobId: string,
  imagePaths: string[]
): Promise<CreateInspectionResult> {
  if (isMockMode()) {
    const stored = localStorage.getItem(`wms_job_${jobId}`);
    const jobData = stored ? JSON.parse(stored) : { payload: {} };
    localStorage.setItem(
      `wms_job_${jobId}`,
      JSON.stringify({
        ...jobData,
        createdAt: Date.now(),
        payload: { ...jobData.payload, imagePaths },
        status: "PENDING" as InspectionJobStatus,
      })
    );
    return {
      jobId,
      taskId: `mock_task_${jobId}_recheck`,
      status: "PENDING",
      message: "재촬영 이미지가 등록되어 Mock 재검수를 시작합니다.",
      streamTicketUrl: `/api/v1/inspections/${jobId}/stream-ticket`,
    };
  }

  const res = await apiClient.post<CreateInspectionApiResponse>(
    `/api/v1/inspections/${jobId}/recheck`,
    { image_paths: imagePaths }
  );
  return adaptCreateInspection(res.data);
}

// ─── 검수 상태 조회 (Polling 용) ───

export async function getJobStatus(jobId: string): Promise<InspectionResult> {
  if (isMockMode()) {
    return simulateMockJobTransition(jobId);
  }
  const res = await apiClient.get<InspectionStatusApiResponse>(`/api/v1/inspections/${jobId}`);
  return adaptInspectionStatus(res.data);
}

// ─── SSE 구독 티켓 발급 ───

interface StreamTicketApiResponse {
  ticket: string;
  stream_url: string;
  expires_in: number;
}

export async function issueStreamTicket(jobId: string): Promise<InspectionStreamTicket> {
  const res = await apiClient.post<StreamTicketApiResponse>(
    `/api/v1/inspections/${jobId}/stream-ticket`
  );
  return {
    ticket: res.data.ticket,
    streamUrl: res.data.stream_url,
    expiresIn: res.data.expires_in,
  };
}

// ─── Mock 상태 전이 시뮬레이션 ───

/**
 * Mock 모드에서 시간 경과에 따라 상태를 PENDING → PROCESSING → APPROVED/HITL_REQUIRED 로 전이.
 * 생성 후 2초 미만: PENDING, 2~5초: PROCESSING, 5초 이후: 랜덤으로 APPROVED(70%) 또는 HITL_REQUIRED(30%)
 */
function simulateMockJobTransition(jobId: string): InspectionResult {
  const stored = localStorage.getItem(`wms_job_${jobId}`);
  const jobData = stored ? JSON.parse(stored) : { createdAt: Date.now() };
  const elapsed = Date.now() - jobData.createdAt;

  let status: InspectionJobStatus = "PENDING";
  let progress = 20;
  if (elapsed > 5000) {
    status = Math.random() > 0.3 ? "APPROVED" : "HITL_REQUIRED";
    progress = status === "APPROVED" ? 100 : 70;
  } else if (elapsed > 2000) {
    status = "PROCESSING";
    progress = 50;
  }

  const isTerminal = status === "APPROVED";
  const needsReview = status === "HITL_REQUIRED";

  return {
    jobId,
    taskId: `mock_task_${jobId}`,
    status,
    progress,
    ubciScore: isTerminal || needsReview ? (needsReview ? 45 : 92) : null,
    conditionGrade: isTerminal || needsReview ? "NORMAL" : null,
    finalReport:
      isTerminal || needsReview
        ? "Mock AI 리포트: 표지 얼룩 오염(STAIN_COVER) 검출, 신뢰도 기준 확인 필요"
        : null,
    originalImageUrls: jobData.payload?.imagePaths ?? [],
  };
}

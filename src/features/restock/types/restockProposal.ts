export type RestockProposalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_REQUIRED';
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type RestockProposalSource = 'RETURN_REJECTION' | 'SAFETY_STOCK';

export interface RestockProposalBook {
  id: string;
  title: string;
  isbn: string;
  publisher: string | null;
  coverImageUrl: string | null;
}

// 발주 추천안 목록의 항목 하나
export interface RestockProposalListItem {
  id: string;
  book: RestockProposalBook;
  status: RestockProposalStatus;
  proposalSource: RestockProposalSource;
  recommendedOrderQuantity: number;
  riskLevel: RiskLevel;
  recentSalesQuantity: number;
  currentStock: number;
  pendingAutoPoQuantity: number;
  rejectedQuantity: number;
  createdAt: string;
  reviewedAt: string | null;
}

// 발주 추천안 상세
export interface RestockProposalDetail {
  id: string;
  book: RestockProposalBook;
  // 안전재고 부족(SAFETY_STOCK) 추천안은 특정 반품 검수 건과 무관해 null
  returnJobId: string | null;
  status: RestockProposalStatus;
  proposalSource: RestockProposalSource;
  recentSalesQuantity: number;
  currentStock: number;
  pendingAutoPoQuantity: number;
  rejectedQuantity: number;
  rejectionReasonCode: string | null;
  recommendedOrderQuantity: number;
  reasonSummary: string;
  evidence: string[];
  riskLevel: RiskLevel;
  autoPoOrderId: string | null;
  reviewerId: string | null;
  reviewerEmployeeId: string | null;
  reviewedAt: string | null;
  reviewComment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApproveRestockProposalRequest {
  comment?: string;
}

export interface RejectRestockProposalRequest {
  comment?: string;
}

// 승인/반려 요청 응답 (둘 다 동일한 형태)
export interface RestockProposalDecisionResponse {
  proposalId: string;
  status: RestockProposalStatus;
  autoPoOrderId: string | null;
  reviewedAt: string;
  message: string;
}

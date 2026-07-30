export type RestockProposalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_REQUIRED';
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface RestockProposalBook {
  id: string;
  title: string;
  isbn: string;
  publisher: string | null;
}

// 발주 추천안 목록의 항목 하나
export interface RestockProposalListItem {
  id: string;
  book: RestockProposalBook;
  status: RestockProposalStatus;
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
  returnJobId: string;
  status: RestockProposalStatus;
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

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import ReturnsHitlPanel from "./ReturnsHitlPanel";
import { submitHitlOverride } from "@/services/returnService";

vi.mock("@/services/returnService", () => {
  return {
    submitHitlOverride: vi.fn(),
  };
});

describe("ReturnsHitlPanel Component", () => {
  const defaultProps = {
    jobId: "job-123",
    initialGrade: "NORMAL" as const,
    initialReasons: [],
    onOverrideComplete: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with initial data and standard buttons", () => {
    render(<ReturnsHitlPanel {...defaultProps} />);

    // 화면 제목 표시 확인
    expect(
      screen.getByText("Human-in-the-Loop 관리자 보정 대기 중")
    ).toBeInTheDocument();

    // 초기 등급과 선택 상태 확인
    expect(screen.getByRole("radio", { name: "B등급" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "B등급" })).toHaveAttribute(
      "aria-checked",
      "true"
    );

    // 재고 처리 버튼 표시 확인
    expect(screen.getByText("재고 적재 (+1 입고)")).toBeInTheDocument();
    expect(screen.getByText("매입 반려 (폐기)")).toBeInTheDocument();
  });

  it("should auto-switch WMS policy to REJECTED when REJECT grade is selected", () => {
    render(<ReturnsHitlPanel {...defaultProps} />);

    const rejectGradeBtn = screen.getByRole("radio", { name: "반려/폐기" });
    fireEvent.click(rejectGradeBtn);

    // 반려 등급 선택 시 반려 정책 자동 선택 확인
    const rejectPolicyBtn = screen.getByText("매입 반려 (폐기)");
    expect(rejectPolicyBtn).toHaveClass("bg-red-500");
  });

  it("should toggle standard reason codes on click", () => {
    render(<ReturnsHitlPanel {...defaultProps} />);

    // 처음에는 선택된 훼손 사유가 없는지 확인
    expect(
      screen.getByText("훼손 코드 없음 (정상 상태 판정 보정)")
    ).toBeInTheDocument();

    // 표지 얼룩 오염 사유 선택
    const reasonBtn = screen.getByText("표지 얼룩 오염");
    fireEvent.click(reasonBtn);

    // 선택한 사유가 화면에 표시되는지 확인
    const removeBtn = screen.getByLabelText("표지 얼룩 오염 사유 삭제");
    expect(removeBtn).toBeInTheDocument();

    // 다시 클릭해 사유 선택 해제
    fireEvent.click(reasonBtn);
    expect(
      screen.getByText("훼손 코드 없음 (정상 상태 판정 보정)")
    ).toBeInTheDocument();
  });

  it("should allow adding and removing custom reasons", () => {
    render(<ReturnsHitlPanel {...defaultProps} />);

    const input = screen.getByPlaceholderText("기타 사유를 직접 입력해 주세요...");
    const addBtn = screen.getByLabelText("사유 추가");

    fireEvent.change(input, { target: { value: "내지에 심한 얼룩" } });
    fireEvent.submit(addBtn);

    // 직접 입력한 사유 추가 확인
    const customReasonText = screen.getByText("내지에 심한 얼룩");
    expect(customReasonText).toBeInTheDocument();

    // 직접 입력한 사유 삭제
    const removeBtn = screen.getByLabelText("내지에 심한 얼룩 사유 삭제");
    fireEvent.click(removeBtn);

    expect(customReasonText).not.toBeInTheDocument();
  });

  it("should submit override and call onOverrideComplete on success", async () => {
    const mockResult = {
      jobId: "job-123",
      status: "COMPLETED" as const,
      bookTitle: "Test",
      grade: "EXCELLENT" as const,
      confidenceScore: 1.0,
      reasons: [],
      wmsDecision: "RESTOCKED" as const,
      processedCoverImageUrl: "",
      processedDefectImageUrls: [],
      ubciScore: 95,
      completedAt: new Date().toISOString(),
    };
    vi.mocked(submitHitlOverride).mockResolvedValueOnce({
      success: true,
      result: mockResult,
    });

    render(<ReturnsHitlPanel {...defaultProps} />);

    const submitBtn = screen.getByText("최종 결정 수동 승인");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(submitHitlOverride).toHaveBeenCalledWith("job-123", {
        grade: "NORMAL",
        reasons: [{ code: "NONE", description: "관리자 직권 무결 판정" }],
        decision: "RESTOCKED",
      });
      expect(defaultProps.onOverrideComplete).toHaveBeenCalledWith(mockResult);
    });
  });

  it("should call onCancel when cancel button is clicked", () => {
    render(<ReturnsHitlPanel {...defaultProps} />);

    const cancelBtn = screen.getByText("취소");
    fireEvent.click(cancelBtn);

    expect(defaultProps.onCancel).toHaveBeenCalled();
  });
});

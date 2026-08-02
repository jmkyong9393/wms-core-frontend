import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import ReturnsHitlPanel from "./ReturnsHitlPanel";

describe("ReturnsHitlPanel Component", () => {
  const defaultProps = {
    jobId: "job-123456789",
    conditionGrade: "NORMAL" as const,
    ubciScore: 45,
    finalReport: "표지 얼룩 오염이 검출되어 신뢰도 기준 확인이 필요합니다.",
    onBack: vi.fn(),
  };

  it("should render read-only waiting state with AI grade/score/report", () => {
    render(<ReturnsHitlPanel {...defaultProps} />);

    expect(screen.getByText("관리자 검토 대기 중")).toBeInTheDocument();
    expect(screen.getByText("B등급")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText(defaultProps.finalReport)).toBeInTheDocument();
    expect(screen.getByText(/job-1234/)).toBeInTheDocument();
  });

  it("should render placeholders when grade/score/report are not yet available", () => {
    render(
      <ReturnsHitlPanel
        jobId="job-abc"
        conditionGrade={null}
        ubciScore={null}
        finalReport={null}
        onBack={vi.fn()}
      />
    );

    expect(screen.getAllByText("—")).toHaveLength(2);
  });

  it("should not render any decision-submission controls (admin-only API)", () => {
    render(<ReturnsHitlPanel {...defaultProps} />);

    expect(screen.queryByText("최종 결정 수동 승인")).not.toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("should call onBack when the back button is clicked", () => {
    render(<ReturnsHitlPanel {...defaultProps} />);

    fireEvent.click(screen.getByText("목록으로 돌아가기"));
    expect(defaultProps.onBack).toHaveBeenCalled();
  });
});

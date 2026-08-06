"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useDownloadEmployeeBulkTemplateMutation,
  useBulkCreateEmployeesMutation,
} from "@/features/employees/hooks/useEmployeeMutations";
import { parseBulkEmployeeError } from "@/features/employees/utils/apiError";
import { ConfirmDialog } from "@/features/employees/components/ConfirmDialog";

interface BulkCreateEmployeeModalProps {
  open: boolean;
  onClose: () => void;
}

interface BulkError {
  message: string;
  errors: string[];
}

const XLSX_EXTENSION = ".xlsx";

// 직원 계정 일괄 생성 모달
// 양식 다운로드, .xlsx 업로드, 성공 시 결과 파일(사번/초기 비밀번호) 자동 다운로드
// 실패 시 message/errors[]를 그대로 나열
export function BulkCreateEmployeeModal({ open, onClose }: BulkCreateEmployeeModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bulkError, setBulkError] = useState<BulkError | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templateMutation = useDownloadEmployeeBulkTemplateMutation();
  const createMutation = useBulkCreateEmployeesMutation();

  const resetState = () => {
    setFile(null);
    setFileError(null);
    setConfirmOpen(false);
    setSuccess(false);
    setBulkError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    createMutation.reset();
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setBulkError(null);

    if (selected && !selected.name.toLowerCase().endsWith(XLSX_EXTENSION)) {
      setFile(null);
      setFileError(".xlsx 파일만 업로드할 수 있습니다.");
      return;
    }

    setFile(selected);
    setFileError(null);
  };

  const handleUploadClick = () => {
    if (!file) {
      setFileError("업로드할 파일을 선택해주세요.");
      return;
    }
    setFileError(null);
    setConfirmOpen(true);
  };

  const handleConfirmUpload = () => {
    if (!file) return;

    createMutation.mutate(file, {
      onSuccess: () => {
        setConfirmOpen(false);
        setSuccess(true);
      },
      onError: async (err) => {
        setConfirmOpen(false);
        setBulkError(await parseBulkEmployeeError(err));
      },
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={handleClose}>
        <div
          className="bg-card rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="text-base font-bold text-foreground">직원 계정 일괄 생성</h3>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-full hover:bg-accent text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {success ? (
              <div className="rounded-lg border border-border p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">계정이 생성되었습니다</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>사번과 초기 비밀번호가 담긴 결과 파일이 자동으로 다운로드됩니다.</p>
                  <p>파일을 안전하게 보관한 뒤 각 직원에게 개별 전달해주세요.</p>
                  <p>이 파일은 다시 받을 수 없습니다.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => templateMutation.mutate()}
                    disabled={templateMutation.isPending}
                  >
                    <Download className="w-4 h-4" />
                    {templateMutation.isPending ? "다운로드 중..." : "양식 다운로드"}
                  </Button>
                </div>

                <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">작성 방법</p>
                  <ul className="list-disc space-y-0.5 pl-4">
                    <li>헤더 순서: 이름 | 입사일 | 역할 | 이메일</li>
                    <li>이름: 2~50자 (필수)</li>
                    <li>입사일: YYYY-MM-DD (필수)</li>
                    <li>역할: ADMIN, WORKER, 관리자, 작업자 중 선택 (필수)</li>
                    <li>이메일 (선택)</li>
                    <li>최대 500명까지 업로드 가능</li>
                  </ul>
                </div>

                <div className="space-y-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
                  />
                  {file && <p className="text-xs text-muted-foreground">선택된 파일: {file.name}</p>}
                </div>

                {fileError && <p className="text-sm text-red-600 dark:text-red-400">{fileError}</p>}

                {bulkError && (
                  <div className="rounded-md bg-red-50 dark:bg-red-950/40 p-3 space-y-1">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">{bulkError.message}</p>
                    {bulkError.errors.length > 0 && (
                      <ul className="list-disc space-y-0.5 pl-5">
                        {bulkError.errors.map((error, index) => (
                          <li key={index} className="text-sm text-red-600 dark:text-red-400">
                            {error}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted p-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              닫기
            </Button>
            {!success && (
              <Button type="button" onClick={handleUploadClick} disabled={createMutation.isPending}>
                <Upload className="w-4 h-4" />
                {createMutation.isPending ? "업로드 중..." : "업로드"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="직원 계정을 일괄 생성할까요?"
        description="검증에 실패한 행이 하나라도 있으면 계정이 생성되지 않습니다."
        isLoading={createMutation.isPending}
        onConfirm={handleConfirmUpload}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

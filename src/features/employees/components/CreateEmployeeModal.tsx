"use client";

import { useEffect, useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CurrentUser } from "@/features/auth/types/authTypes";
import type { AssignableRole, CreateEmployeeResponse } from "@/features/employees/types/employee";
import { getAssignableRoles } from "@/features/employees/utils/permissions";
import { getApiErrorMessage } from "@/features/employees/utils/apiError";
import { ROLE_LABEL } from "@/features/employees/utils/badges";
import { useCreateEmployeeMutation } from "@/features/employees/hooks/useEmployeeMutations";
import { ConfirmDialog } from "@/features/employees/components/ConfirmDialog";

interface CreateEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  currentUser: CurrentUser | null;
}

interface Draft {
  name: string;
  email: string;
  hire_date: string;
  role: AssignableRole;
}

function createEmptyDraft(defaultRole: AssignableRole): Draft {
  return { name: "", email: "", hire_date: "", role: defaultRole };
}

// 직원 계정 생성 모달
// 이름, 이메일(선택), 입사일, 역할(ADMIN/WORKER)을 입력받아 단건 생성
// 생성 성공 시 백엔드가 한 번만 내려주는 employee_id/temporary_password를 결과 화면에 표시
export function CreateEmployeeModal({ open, onClose, currentUser }: CreateEmployeeModalProps) {
  const assignableRoles = getAssignableRoles(currentUser);
  const defaultRole = assignableRoles[0] ?? "WORKER";

  const [draft, setDraft] = useState<Draft>(createEmptyDraft(defaultRole));
  const [validationError, setValidationError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<CreateEmployeeResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const mutation = useCreateEmployeeMutation();

  const resetState = () => {
    setDraft(createEmptyDraft(defaultRole));
    setValidationError(null);
    setConfirmOpen(false);
    setResult(null);
    setCopied(false);
    mutation.reset();
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

  const handleSubmitClick = () => {
    if (!draft.name.trim() || !draft.hire_date) {
      setValidationError("이름과 입사일을 입력해주세요.");
      return;
    }
    setValidationError(null);
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = () => {
    mutation.mutate(
      {
        name: draft.name.trim(),
        email: draft.email.trim() || undefined,
        hire_date: draft.hire_date,
        role: draft.role,
      },
      {
        onSuccess: (data) => {
          setResult(data);
          setConfirmOpen(false);
        },
        onError: () => {
          setConfirmOpen(false);
        },
      }
    );
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(
      `사번: ${result.employee_id}\n임시 비밀번호: ${result.temporary_password}`
    );
    setCopied(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={handleClose}>
        <div
          className="bg-card rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="text-base font-bold text-foreground">직원 계정 생성</h3>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-full hover:bg-accent text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {result ? (
              <div className="rounded-lg border border-border p-4 space-y-3">
                <p className="text-sm font-medium text-foreground">계정이 생성되었습니다</p>
                <p className="text-sm text-muted-foreground">
                  아래 사번과 임시 비밀번호는 이 화면을 벗어나면 다시 확인할 수 없습니다. 담당 직원에게 전달해주세요.
                </p>
                <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">사번</span>{" "}
                    <span className="font-mono font-medium text-foreground">{result.employee_id}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">임시 비밀번호</span>{" "}
                    <span className="font-mono font-medium text-foreground">{result.temporary_password}</span>
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "복사됨" : "복사하기"}
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <Label htmlFor="create-name">이름</Label>
                  <Input
                    id="create-name"
                    value={draft.name}
                    onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="홍길동"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="create-email">이메일 (선택)</Label>
                  <Input
                    id="create-email"
                    type="email"
                    value={draft.email}
                    onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="hong@example.com"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="create-hire-date">입사일</Label>
                  <Input
                    id="create-hire-date"
                    type="date"
                    value={draft.hire_date}
                    onChange={(e) => setDraft((prev) => ({ ...prev, hire_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>역할</Label>
                  <Select
                    value={draft.role}
                    onValueChange={(value) =>
                      setDraft((prev) => ({ ...prev, role: value as AssignableRole }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {assignableRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABEL[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {validationError && <p className="text-sm text-red-600 dark:text-red-400">{validationError}</p>}
                {mutation.isError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{getApiErrorMessage(mutation.error)}</p>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted p-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              닫기
            </Button>
            {!result && (
              <Button type="button" onClick={handleSubmitClick} disabled={mutation.isPending}>
                {mutation.isPending ? "생성 중..." : "생성"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="직원 계정을 생성할까요?"
        description="계정 생성 후에는 임시 비밀번호를 다시 조회할 수 없습니다."
        isLoading={mutation.isPending}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

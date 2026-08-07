'use client';

import { useEffect, useState } from 'react';
import { Check, RefreshCw, Settings } from 'lucide-react';

import {
  getFdsPolicies,
  updateFdsPolicy,
} from '@/services/dashboardService';
import type { FdsPolicy } from '@/types/dashboardTypes';

const POLICY_FRIENDLY_NAMES: Record<string, string> = {
  MAX_RETURN_30D: '최근 30일 최대 반품 횟수',
  MIN_UBCI_SCORE: '최소 허용 UBCI 점수',
  MAX_RETURN_90D: '최근 90일 최대 반품 횟수',
  MAX_REFUND_AMT: '최대 누적 환불 금액',
};

interface FdsPolicySettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function FdsPolicySettingsDrawer({
  open,
  onClose,
}: FdsPolicySettingsDrawerProps) {
  const [policies, setPolicies] = useState<FdsPolicy[]>([]);
  const [editValues, setEditValues] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [successKey, setSuccessKey] = useState<string | null>(null);

  const loadPolicies = async () => {
    try {
      setIsLoading(true);

      const response = await getFdsPolicies();
      setPolicies(response);

      setEditValues(
        Object.fromEntries(
          response.map((policy) => [
            policy.policy_key,
            Number(policy.policy_value),
          ]),
        ),
      );
    } catch (error) {
      console.error('운영 기준 조회 실패', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      void loadPolicies();
    }
  }, [open]);

  const validateValue = (policyKey: string, value: number) => {
    if (
      (policyKey === 'MAX_RETURN_30D' ||
        policyKey === 'MAX_RETURN_90D') &&
      (value < 1 || !Number.isInteger(value))
    ) {
      return '반품 횟수 기준은 1 이상의 정수여야 합니다.';
    }

    if (
      policyKey === 'MIN_UBCI_SCORE' &&
      (value < 0 || value > 100)
    ) {
      return 'UBCI 점수 기준은 0에서 100 사이여야 합니다.';
    }

    if (policyKey === 'MAX_REFUND_AMT' && value < 0) {
      return '환불 금액 기준은 0 이상이어야 합니다.';
    }

    return null;
  };

  const handleSubmit = async (policyKey: string) => {
    const policyValue = editValues[policyKey] ?? 0;
    const validationMessage = validateValue(policyKey, policyValue);

    if (validationMessage) {
      window.alert(validationMessage);
      return;
    }

    try {
      setUpdatingKey(policyKey);

      await updateFdsPolicy(policyKey, policyValue);
      setSuccessKey(policyKey);
      await loadPolicies();

      window.setTimeout(() => {
        setSuccessKey(null);
      }, 1500);
    } catch (error) {
      console.error('운영 기준 수정 실패', error);
      window.alert('운영 기준 변경에 실패했습니다.');
    } finally {
      setUpdatingKey(null);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="운영 기준 설정"
    >
      <div
        className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-border bg-card shadow-2xl">
        <header className="flex items-center justify-between border-b border-border bg-muted/50 px-5 py-5">
          <div>
            <div className="flex items-center gap-1.5">
              <Settings className="h-4 w-4 text-violet-500" />
              <h2 className="text-base font-bold text-foreground">
                운영 기준 설정
              </h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              확인 필요 거래를 분류하는 운영 기준을 관리합니다.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="운영 기준 설정 닫기"
          >
            ×
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
          {isLoading ? (
            <div className="flex min-h-40 items-center justify-center">
              <RefreshCw className="h-5 w-5 animate-spin text-violet-500" />
            </div>
          ) : (
            policies.map((policy) => {
              const isUpdating = updatingKey === policy.policy_key;
              const isSuccess = successKey === policy.policy_key;

              return (
                <section
                  key={policy.policy_key}
                  className="space-y-3 rounded-xl border border-border bg-muted/50 p-4"
                >
                  <div>
                    <p className="text-xs font-bold text-violet-600 dark:text-violet-400">
                      {POLICY_FRIENDLY_NAMES[policy.policy_key] ??
                        policy.policy_key}
                    </p>
                    {policy.description && (
                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                        {policy.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={
                        editValues[policy.policy_key] ??
                        Number(policy.policy_value)
                      }
                      disabled={isUpdating}
                      onChange={(event) => {
                        setEditValues((previous) => ({
                          ...previous,
                          [policy.policy_key]:
                            Number(event.target.value) || 0,
                        }));
                      }}
                      className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm font-semibold text-foreground outline-none ring-violet-500 focus:ring-1"
                    />

                    <button
                      type="button"
                      disabled={isUpdating || isSuccess}
                      onClick={() => void handleSubmit(policy.policy_key)}
                      className={`inline-flex min-w-16 items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-colors ${
                        isSuccess
                          ? 'bg-emerald-500'
                          : isUpdating
                            ? 'cursor-not-allowed bg-muted text-muted-foreground'
                            : 'bg-violet-600 hover:bg-violet-700'
                      }`}
                    >
                      {isSuccess ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          완료
                        </>
                      ) : isUpdating ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        '적용'
                      )}
                    </button>
                  </div>
                </section>
              );
            })
          )}

          {!isLoading && policies.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              설정 가능한 운영 기준이 없습니다.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface PrivacyConsentStepProps {
  onAgree: () => void;
}

const INFO_BLOCKS = [
  {
    label: "수집·이용 목적",
    body: "이용자 계정 인증 및 서비스 이용 권한 부여, 입고·검수·재고관리·출고 등 물류 업무 처리",
  },
  {
    label: "수집 항목",
    body: "필수: 사번, 이름, 비밀번호 등 인증정보, 이용자 역할 / 선택: 이메일",
  },
  {
    label: "보유·이용 기간",
    body: "퇴사 또는 계정 이용 종료 후 1년(관련 법령상 보존 의무가 있는 경우 해당 기간)",
  },
];

export function PrivacyConsentStep({ onAgree }: PrivacyConsentStepProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-zinc-400">
        서비스 이용을 위해 개인정보 수집·이용에 동의해 주세요.
      </p>

      <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
        {INFO_BLOCKS.map((block) => (
          <div key={block.label}>
            <p className="text-xs font-semibold text-gray-700 dark:text-zinc-200">{block.label}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-zinc-400">{block.body}</p>
          </div>
        ))}
      </div>

      <p className="text-xs leading-relaxed text-gray-400 dark:text-zinc-500">
        동의를 거부할 권리가 있으며, 거부 시 계정 발급 목적을 달성할 수 없어 시스템 이용이 제한됩니다. 자세한
        내용은{" "}
        <Link href="/privacy" target="_blank" className="text-blue-600 hover:underline dark:text-blue-400">
          개인정보 처리방침
        </Link>
        에서 확인하실 수 있습니다.
      </p>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-zinc-200">
        <Checkbox checked={agreed} onCheckedChange={(checked) => setAgreed(checked === true)} />
        [필수] 개인정보 수집·이용에 동의합니다.
      </label>

      <Button type="button" size="lg" className="w-full" disabled={!agreed} onClick={onAgree}>
        동의하고 계속하기
      </Button>
    </div>
  );
}

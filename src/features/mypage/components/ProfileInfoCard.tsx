"use client";

import { useAtomValue } from "jotai";
import { currentUserAtom } from "@/features/auth/store/authAtoms";
import {
  ROLE_BADGE_STYLE,
  ROLE_LABEL,
  STATUS_BADGE_STYLE,
  STATUS_LABEL,
} from "@/features/employees/utils/badges";

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-gray-500 dark:text-zinc-400">{label}</span>
      <span className="text-sm font-medium text-gray-800 dark:text-zinc-100">{children}</span>
    </div>
  );
}

export function ProfileInfoCard() {
  const currentUser = useAtomValue(currentUserAtom);

  if (!currentUser) return null;

  return (
    <div className="divide-y divide-gray-100 dark:divide-zinc-800">
      <InfoRow label="사번">{currentUser.employeeId}</InfoRow>
      <InfoRow label="이름">{currentUser.name}</InfoRow>
      <InfoRow label="이메일">{currentUser.email ?? "미등록"}</InfoRow>
      <InfoRow label="권한">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ROLE_BADGE_STYLE[currentUser.role]}`}>
          {ROLE_LABEL[currentUser.role]}
        </span>
      </InfoRow>
      <InfoRow label="계정 상태">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE_STYLE[currentUser.status]}`}>
          {STATUS_LABEL[currentUser.status]}
        </span>
      </InfoRow>
    </div>
  );
}

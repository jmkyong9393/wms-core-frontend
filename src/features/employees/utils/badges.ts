import type { Role, UserStatus } from "@/features/auth/types/authTypes";

// 역할별 배지 색상 / 한글 라벨
export const ROLE_BADGE_STYLE: Record<Role, string> = {
  MASTER: "bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-900",
  ADMIN: "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-900",
  WORKER: "bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-900",
  GUEST: "bg-gray-100 text-gray-600 border border-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
};

export const ROLE_LABEL: Record<Role, string> = {
  MASTER: "마스터",
  ADMIN: "관리자",
  WORKER: "작업자",
  GUEST: "게스트",
};

// 계정 상태별 배지 색상 / 한글 라벨
export const STATUS_BADGE_STYLE: Record<UserStatus, string> = {
  ACTIVE: "bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-900",
  INACTIVE: "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-900",
};

export const STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: "활성",
  INACTIVE: "비활성",
};

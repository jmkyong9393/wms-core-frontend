'use client';

import { useMutation } from '@tanstack/react-query';
import { useStore } from 'jotai';
import {
  notificationsAtom,
  markNotificationReadAtom,
  markAllNotificationsReadAtom,
  restoreNotificationAtom,
  restoreNotificationsByIdsAtom,
  notificationActionErrorAtom,
} from '@/features/notifications/store/notificationAtoms';
import {
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from '@/features/notifications/api/notificationService';
import { notificationKeys } from '@/features/notifications/constants/queryKeys';
import type { NotificationItem } from '@/features/notifications/types/notification';

interface MarkReadContext {
  previousItem: NotificationItem | undefined;
}

// 개별 알림 읽음 처리
export function useMarkNotificationReadMutation() {
  const store = useStore();

  return useMutation<void, Error, string, MarkReadContext>({
    mutationKey: notificationKeys.markRead,
    mutationFn: (id: string) => markNotificationReadApi(id),
    // API 요청 전에 읽음 상태 반영
    onMutate: (id: string) => {
      const previousItem = store.get(notificationsAtom).find((n) => n.id === id);
      store.set(markNotificationReadAtom, id);
      return { previousItem };
    },
    // 요청 실패 시 이전 상태 복구
    onError: (_err, _id, context) => {
      if (context?.previousItem) store.set(restoreNotificationAtom, context.previousItem);
      store.set(notificationActionErrorAtom, '알림을 읽음 처리하지 못했습니다. 다시 시도해 주세요.');
    },
  });
}

interface MarkAllReadContext {
  affectedIds: string[];
}

// 전체 알림 읽음 처리
export function useMarkAllNotificationsReadMutation() {
  const store = useStore();

  return useMutation<void, Error, void, MarkAllReadContext>({
    mutationKey: notificationKeys.markAllRead,
    mutationFn: () => markAllNotificationsReadApi(),
    // API 요청 전에 모든 알림을 읽음 처리
    onMutate: () => {
      const affectedIds = store
        .get(notificationsAtom)
        .filter((n) => !n.read)
        .map((n) => n.id);
      store.set(markAllNotificationsReadAtom);
      return { affectedIds };
    },
    // 요청 실패 시 기존 미읽음 알림만 복구
    onError: (_err, _vars, context) => {
      if (context?.affectedIds.length) {
        store.set(restoreNotificationsByIdsAtom, context.affectedIds);
      }
      store.set(notificationActionErrorAtom, '알림을 모두 읽음 처리하지 못했습니다. 다시 시도해 주세요.');
    },
  });
}

import { describe, it, expect, beforeEach, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import {
  listNotifications,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  issueNotificationStreamTicket,
} from "./notificationService";

vi.mock("@/lib/api-client", () => {
  return {
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
    },
  };
});

describe("notificationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listNotifications calls GET /api/v1/notifications with limit and maps unread_count", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        items: [
          {
            id: "n1",
            category: "FDS_ALERT",
            severity: "HIGH",
            title: "title",
            message: "message",
            timestamp: "2026-07-28T04:29:44.850691",
            read: false,
          },
        ],
        unread_count: 1,
      },
    });

    const res = await listNotifications(50);

    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/notifications", { params: { limit: 50 } });
    expect(res.unreadCount).toBe(1);
    expect(res.items).toHaveLength(1);
  });

  it("markNotificationReadApi calls PATCH on the notification read endpoint", async () => {
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: undefined });

    await markNotificationReadApi("n1");

    expect(apiClient.patch).toHaveBeenCalledWith("/api/v1/notifications/n1/read");
  });

  it("markAllNotificationsReadApi calls PATCH on the read-all endpoint", async () => {
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: undefined });

    await markAllNotificationsReadApi();

    expect(apiClient.patch).toHaveBeenCalledWith("/api/v1/notifications/read-all");
  });

  it("issueNotificationStreamTicket calls POST stream-ticket and maps expires_in", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { ticket: "abc123", expires_in: 300 },
    });

    const res = await issueNotificationStreamTicket();

    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/notifications/stream-ticket");
    expect(res).toEqual({ ticket: "abc123", expiresIn: 300 });
  });
});

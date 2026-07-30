// 알림센터 API 주소 
export const NOTIFICATION_LIST_ENDPOINT = '/api/v1/notifications';
export const NOTIFICATION_READ_ALL_ENDPOINT = '/api/v1/notifications/read-all';
export const notificationReadEndpoint = (id: string) => `/api/v1/notifications/${id}/read`;
export const NOTIFICATION_STREAM_TICKET_ENDPOINT = '/api/v1/notifications/stream-ticket';
export const NOTIFICATION_STREAM_ENDPOINT = '/api/v1/notifications/stream';

// 알림 목록 최대 조회 개수
export const NOTIFICATION_LIST_LIMIT = 50;

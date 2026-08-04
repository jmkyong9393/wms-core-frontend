// 출고 피킹 지시서 API 주소
export const PICKING_INSTRUCTIONS_ENDPOINT = '/api/v1/outbound/picking-instructions';

export const pickingInstructionDetailEndpoint = (orderId: string) =>
  `${PICKING_INSTRUCTIONS_ENDPOINT}/${orderId}`;

export const pickingScanEndpoint = (orderId: string) =>
  `${PICKING_INSTRUCTIONS_ENDPOINT}/${orderId}/scan`;

export const pickingConfirmEndpoint = (orderId: string) =>
  `${PICKING_INSTRUCTIONS_ENDPOINT}/${orderId}/confirm`;

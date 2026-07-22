import { ImageOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AgentLogAccordion from '@/features/inspections/components/AgentLogAccordion';
import InspectionBadges from '@/features/inspections/components/InspectionBadges';
import { getStatusLabel } from '@/features/inspections/utils/statusBadge';
import type { InspectionHistoryRow } from '@/features/inspections/types/inspectionHistory';

interface InspectionHistoryDetailDialogProps {
  row: InspectionHistoryRow | null;
  onClose: () => void;
}

// 검수 이력 상세 모달
export function InspectionHistoryDetailDialog({ row, onClose }: InspectionHistoryDetailDialogProps) {
  return (
    <Dialog open={row !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        {row && (
          <>
            <DialogHeader>
              <DialogTitle>{row.bookTitle}</DialogTitle>
              {row.finalGrade ? (
                <InspectionBadges isFastTrack={row.isFastTrack} finalGrade={row.finalGrade} />
              ) : (
                <span className="text-xs text-gray-400">판정 전</span>
              )}
            </DialogHeader>

            <div className="space-y-5">
              {/* 도서 및 검수 정보 */}
              <section className="space-y-1 text-sm text-gray-600">
                <p>도서 ID: {row.bookId}</p>
                <p>
                  상태: <span className="font-semibold text-gray-800">{getStatusLabel(row.status)}</span>
                </p>
                <p>UBCI 점수: {row.ubciScore === null ? '-' : row.ubciScore}</p>
                <p>검수 요청일시: {row.inspectedAt.slice(0, 10)}</p>
                <p>마지막 상태변경일시: {row.updatedAt.slice(0, 10)}</p>
                <p className="text-xs text-gray-400">저자·ISBN 등 도서 상세 정보는 Book 테이블 연동 후 제공됩니다.</p>
              </section>

              {/* AI 판정 결과 */}
              <section className="space-y-2 border-t border-gray-100 pt-4">
                <h4 className="text-sm font-semibold text-gray-800">AI 판정 결과</h4>
                <p className="text-sm text-gray-600">
                  {row.finalReport ?? '아직 최종 검수 결과가 산출되지 않았습니다.'}
                </p>
                <div className="flex flex-wrap gap-1">
                  {row.reasonCodes && row.reasonCodes.length > 0 ? (
                    row.reasonCodes.map((code) => (
                      <span
                        key={code}
                        className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700"
                      >
                        {code}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">AI 판정 사유 없음</span>
                  )}
                </div>
              </section>

              {/* 에이전트 실행 로그 */}
              <section className="border-t border-gray-100 pt-4">
                <h4 className="mb-2 text-sm font-semibold text-gray-800">Agent 로그</h4>
                <AgentLogAccordion record={row} />
              </section>

              {/* 미연동 정보 안내 */}
              <section className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2">
                <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-4 text-center text-gray-300">
                  <ImageOff className="mb-2 h-6 w-6" />
                  <span className="text-xs">사진 연동 방식 협의 필요</span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-4 text-center text-gray-400">
                  <span className="text-xs">품질 보증서는 추후 연동 예정입니다.</span>
                </div>
              </section>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
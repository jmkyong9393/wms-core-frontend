'use client';

import { useEffect } from 'react';
import { X, ImageOff } from 'lucide-react';
import type { AgentLogEntry, HitlQueueItem } from '@/features/queue/store/queueAtoms';

const AGENT_STYLE: Record<AgentLogEntry['agent'], string> = {
  Vision: 'bg-blue-100 text-blue-700',
  Policy: 'bg-purple-100 text-purple-700',
  Critic: 'bg-orange-100 text-orange-700',
  Report: 'bg-green-100 text-green-700',
};

interface AgentConversationModalProps {
  item: HitlQueueItem | null;
  onClose: () => void;
}

// 검수 티켓 클릭 시 뜨는 에이전트 대화 로그 모달 (백엔드 연동 전, mock agentLogs 기반)
export default function AgentConversationModal({ item, onClose }: AgentConversationModalProps) {
  useEffect(() => {
    if (!item) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-800">{item.title ?? item.id}</h3>
            <p className="text-xs text-gray-400">{item.isbn ?? item.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 flex-1 min-h-0">
          {/* 결함 이미지 자리 (실제 이미지 미연동, 결함 표시 목업 사각형만 표시) */}
          <div className="p-4 border-b sm:border-b-0 sm:border-r border-gray-100 flex items-center justify-center">
            <div className="relative w-full aspect-[3/4] bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-gray-300">
              <ImageOff className="w-8 h-8 mb-2" />
              <span className="text-xs">원본 이미지 준비 중</span>
              <div className="absolute left-[22%] top-[35%] w-[45%] h-[20%] border-2 border-red-400 rounded-sm" />
            </div>
          </div>

          {/* 에이전트 대화 로그 (카카오톡 스타일 말풍선, 스크롤) */}
          <div className="p-4 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {item.agentLogs && item.agentLogs.length > 0 ? (
                item.agentLogs.map((log, idx) => (
                  <div key={idx} className="flex flex-col items-start">
                    <span className={`text-[11px] font-semibold rounded-full px-2 py-0.5 mb-1 ${AGENT_STYLE[log.agent]}`}>
                      {log.agent}
                    </span>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-gray-700 max-w-[90%]">
                      {log.message}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-8">대화 로그가 없습니다.</p>
              )}
            </div>
            {item.finalReport && (
              <div className="pt-3 mt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">최종 판정 요약</p>
                <p className="text-xs text-gray-600">{item.finalReport}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

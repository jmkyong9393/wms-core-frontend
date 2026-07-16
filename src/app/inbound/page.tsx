"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { uploadQueueAtom } from "@/features/inbound/store/uploadQueueAtoms";
import CameraScanner from "@/features/inbound/components/CameraScanner";
import ReturnsInspector from "@/components/features/returns/ReturnsInspector";

/**
 * InboundPage — 반품 도서 검수 메인 페이지
 *
 * 기본 모드: 간편 촬영 → 큐 적재 (팀원 기존 흐름)
 * 전체 AI 검수 모드: 모드 선택 → 촬영 → AI 분석 → 결과/HITL 위저드
 *
 * 추후 토글을 제거하고 전체 플로우로 통합하거나 별도 라우트로 분리하기 용이한 구조.
 */
export default function InboundPage() {
  const [uploadQueue, setUploadQueue] = useAtom(uploadQueueAtom);
  const [isFullInspectionMode, setIsFullInspectionMode] = useState(false);

  // Mock API: 큐에 있는 PENDING 항목들을 비동기로 처리 (낙관적 UI 시뮬레이션)
  useEffect(() => {
    const pendingTasks = uploadQueue.filter(
      (task) => task.status === "PENDING"
    );

    pendingTasks.forEach((task) => {
      setUploadQueue((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: "UPLOADING" } : t
        )
      );

      setTimeout(() => {
        setUploadQueue((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, status: "COMPLETED" } : t
          )
        );
      }, 3000);
    });
  }, [uploadQueue, setUploadQueue]);

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col items-center p-4 font-mono text-black">
      <div className="w-full max-w-md mb-4 border-b-2 border-black pb-2">
        <h1 className="text-md font-black tracking-widest text-black uppercase mb-1">
          INBOUND SCANNING
        </h1>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest">
          {isFullInspectionMode
            ? "AI MULTI-AGENT COMPREHENSIVE FLOW"
            : "ALIGN BOOK AND CLICK SHUTTER GENTLY."}
        </p>
      </div>

      {/* 전체 AI 검수 모드 토글 (브루탈리즘 버튼화) */}
      <div className="w-full max-w-md mb-6">
        <button
          type="button"
          onClick={() => setIsFullInspectionMode((prev) => !prev)}
          className="w-full flex items-center justify-between bg-white border-2 border-black rounded-none px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
        >
          <span className="text-xs font-bold text-black uppercase tracking-wider">
            AI AGENT INSPECTION MODE
          </span>
          <div className="flex items-center gap-1.5 text-xs font-bold font-mono">
            {isFullInspectionMode ? (
              <span className="bg-black text-white border-2 border-black px-2 py-0.5 text-[9px] font-black rounded-none">ON</span>
            ) : (
              <span className="bg-white text-black border-2 border-black px-2 py-0.5 text-[9px] font-black rounded-none">OFF</span>
            )}
          </div>
        </button>
      </div>

      {/* 모드에 따른 컨텐츠 분기 */}
      {isFullInspectionMode ? (
        <ReturnsInspector />
      ) : (
        <>
          {/* 기존 심플 카메라 스캐너 */}
          <CameraScanner />

          {/* 낙관적 UI: 업로드 대기열 현황판 */}
          <div className="w-full max-w-md mt-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none p-4">
            <h3 className="text-xs font-black text-black mb-4 border-b-2 border-black pb-2 flex items-center justify-between">
              <span className="uppercase tracking-widest">BATCH PROGRESS</span>
              <span className="bg-black text-white py-0.5 px-2 rounded-none border border-black text-[9px] font-black uppercase tracking-widest">
                PENDING:{" "}
                {
                  uploadQueue.filter((t) => t.status !== "COMPLETED")
                    .length
                }
                EA
              </span>
            </h3>

            {uploadQueue.length === 0 ? (
              <p className="text-[10px] text-gray-400 text-center py-6 font-bold uppercase tracking-widest">
                * NO PHOTOS ENQUEUED YET.
              </p>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 divide-y divide-black/10">
                {[...uploadQueue].reverse().map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center space-x-3 text-xs pt-3 first:pt-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={task.previewUrl}
                      alt="preview"
                      className="w-10 h-10 object-cover rounded-none border-2 border-black flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-black truncate uppercase">
                        {task.status === "COMPLETED"
                          ? "INSPECTED"
                          : "AI ANALYZING..."}
                      </div>
                      <div className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">
                        {task.id.replace("local_", "REQ-")}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {task.status === "COMPLETED" ? (
                        <span className="w-5 h-5 rounded-none border-2 border-black bg-[#F9F9F7] text-black flex items-center justify-center font-bold text-[10px]">
                          ✓
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-none border-2 border-black border-t-transparent animate-spin bg-white" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

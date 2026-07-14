"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { uploadQueueAtom } from "@/stores/atoms";
import CameraScanner from "@/app/inbound/_components/CameraScanner";
import ReturnsInspector from "@/components/features/returns/ReturnsInspector";
import { ToggleLeft, ToggleRight } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center p-4 font-sans">
      <div className="w-full max-w-md mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-50 mb-1">
          반품 도서 검수
        </h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          {isFullInspectionMode
            ? "AI 멀티에이전트 전체 검수 플로우"
            : "가이드라인에 맞춰 도서를 촬영해주세요."}
        </p>
      </div>

      {/* 전체 AI 검수 모드 토글 */}
      <div className="w-full max-w-md mb-4">
        <button
          type="button"
          onClick={() => setIsFullInspectionMode((prev) => !prev)}
          className="w-full flex items-center justify-between bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl px-4 py-3 hover:border-indigo-400 transition-colors"
        >
          <span className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
            전체 AI 검수 모드
          </span>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            {isFullInspectionMode ? (
              <>
                <ToggleRight className="w-6 h-6 text-indigo-500" />
                <span className="text-indigo-600 dark:text-indigo-400">ON</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-6 h-6 text-gray-400" />
                <span className="text-gray-500">OFF</span>
              </>
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
          <div className="w-full max-w-md mt-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-3 flex items-center justify-between">
              <span>작업 진행 현황</span>
              <span className="bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 py-0.5 px-2 rounded-full text-xs">
                대기{" "}
                {
                  uploadQueue.filter((t) => t.status !== "COMPLETED")
                    .length
                }
                건
              </span>
            </h3>

            {uploadQueue.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-zinc-600 text-center py-4">
                아직 촬영된 도서가 없습니다.
              </p>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {[...uploadQueue].reverse().map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center space-x-3 text-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={task.previewUrl}
                      alt="preview"
                      className="w-10 h-10 object-cover rounded-md border border-gray-200 dark:border-zinc-800"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 dark:text-zinc-200">
                        {task.status === "COMPLETED"
                          ? "검수 완료"
                          : "AI 분석 중..."}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-zinc-500">
                        {task.id.replace("local_", "REQ-")}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {task.status === "COMPLETED" ? (
                        <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center text-green-600 dark:text-green-400 text-xs">
                          ✓
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
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

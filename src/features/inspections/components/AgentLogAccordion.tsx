import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { AgentLogStep } from '@/features/inspections/types/inspection';

interface AgentLogAccordionProps {
  steps: AgentLogStep[];
}

export default function AgentLogAccordion({ steps }: AgentLogAccordionProps) {
  if (!steps || steps.length === 0) {
    return (
      <div className="text-center py-4 bg-gray-50/50 dark:bg-zinc-800/10 border border-dashed border-gray-150 dark:border-zinc-800/80 rounded-2xl">
        <p className="text-[11px] leading-relaxed text-gray-400 dark:text-zinc-500">
          저장된 Agent 단계 로그가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <Accordion multiple defaultValue={[]}>
      {/* 검수 단계별 로그를 아코디언 항목으로 표시 */}
      {steps.map((step) => (
        <AccordionItem key={step.stepOrder} value={`step-${step.stepOrder}`}>
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 dark:text-zinc-500">
                {step.stepOrder}.
              </span>
              <span>{step.agentName} Agent</span>

              {/* 처리 완료 여부에 따라 배지 색상 변경 */}
              <span
                className={`text-xs font-semibold rounded-full px-2 py-0.5 ${
                  step.executionStatus === 'COMPLETED'
                    ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                    : 'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-500'
                }`}
              >
                {step.executionStatus}
              </span>
            </span>
          </AccordionTrigger>

          {/* 펼쳤을 때 단계별 처리 결과와 판단 근거 표시 */}
          <AccordionContent>
            <p className="text-gray-700 dark:text-zinc-300">{step.resultSummary}</p>

            {/* 값이 있을 때만 판단 근거 표시 */}
            {step.reasoning && (
              <p className="mt-1 text-gray-500 dark:text-zinc-500">판단 근거: {step.reasoning}</p>
            )}

            {/* 값이 있을 때만 사유 코드 표시 */}
            {step.reasonCode && (
              <p className="mt-1 text-gray-500 dark:text-zinc-500">Reason Code: {step.reasonCode}</p>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
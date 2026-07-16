import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { MockInspectionRecord } from '@/features/inspections/types/inspection';

interface AgentLogAccordionProps {
  record: MockInspectionRecord;
}

export default function AgentLogAccordion({ record }: AgentLogAccordionProps) {
  return (
    <Accordion multiple defaultValue={[]}>
      {/* 검수 단계별 로그를 아코디언 항목으로 표시 */}
      {record.steps.map((step) => (
        <AccordionItem key={step.stepOrder} value={`step-${step.stepOrder}`} className="border-b border-black last:border-b-0 py-1">
          <AccordionTrigger className="hover:no-underline font-mono">
            <span className="flex items-center gap-3">
              <span className="text-[10px] font-black text-gray-400">
                {step.stepOrder.toString().padStart(2, '0')}
              </span>
              <span className="text-xs font-bold text-black uppercase">{step.agentName} AGENT</span>

              {/* 처리 완료 여부에 따라 배지 색상 변경 (각진 모서리와 보더 적용) */}
              <span
                className={`text-[9px] font-black rounded-none border-2 border-black px-2 py-0.5 uppercase tracking-wider ${
                  step.executionStatus === 'COMPLETED'
                    ? 'bg-black text-white'
                    : 'bg-white text-black'
                }`}
              >
                {step.executionStatus}
              </span>
            </span>
          </AccordionTrigger>

          {/* 펼쳤을 때 단계별 처리 결과와 판단 근거 표시 */}
          <AccordionContent className="font-mono text-xs text-black space-y-1.5 pb-4 pl-8">
            <p className="font-bold">* SUMMARY: {step.resultSummary}</p>

            {/* 값이 있을 때만 판단 근거 표시 */}
            {step.reasoning && (
              <p className="text-gray-500 font-semibold">• REASONING: {step.reasoning}</p>
            )}

            {/* 값이 있을 때만 사유 코드 표시 */}
            {step.reasonCode && (
              <p className="text-[#E60012] font-black">• CODE: {step.reasonCode}</p>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
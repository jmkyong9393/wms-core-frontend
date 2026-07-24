'use client';

import AgentLogAccordion from '@/features/inspections/components/AgentLogAccordion';
import { useAgentLogQuery } from '@/features/inspections/hooks/useAgentLogQuery';

interface AgentLogSectionProps {
  inspectionId: string;
}

// Agent 로그 조회 (Suspense) 후 렌더링
export default function AgentLogSection({ inspectionId }: AgentLogSectionProps) {
  const { data: steps } = useAgentLogQuery(inspectionId);

  return <AgentLogAccordion steps={steps} />;
}

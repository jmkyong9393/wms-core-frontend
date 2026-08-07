'use client';

import { useState } from 'react';
import { Activity } from 'lucide-react';

import OperationalInsightsTab from './OperationalInsightsTab';
import InboundSummaryTab from './InboundSummaryTab';
import OutboundSummaryTab from './OutboundSummaryTab';

type DashboardTab = 'inbound' | 'outbound' | 'insights';

export default function DashboardView() {
  const [mainTab, setMainTab] = useState<DashboardTab>('inbound');

  return (
    <div className="mx-auto flex h-full max-w-[1600px] flex-col space-y-4 font-sans">
      <div className="flex shrink-0 flex-col gap-4 rounded-3xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-xl font-black text-foreground">
            <Activity className="h-5 w-5 text-indigo-500" />
            물류 센터 통합 대시보드
          </h2>
          <p className="text-xs text-muted-foreground">
            입고·출고 현황과 운영 인사이트를 조회합니다.
          </p>
        </div>

        <div className="flex self-start gap-1.5 rounded-2xl bg-muted p-1.5 lg:self-center">
          <DashboardTabButton
            active={mainTab === 'inbound'}
            activeClassName="bg-card text-indigo-600 shadow-sm dark:text-indigo-400"
            onClick={() => setMainTab('inbound')}
          >
            입고 현황 (Inbound)
          </DashboardTabButton>

          <DashboardTabButton
            active={mainTab === 'outbound'}
            activeClassName="bg-card text-orange-600 shadow-sm dark:text-orange-400"
            onClick={() => setMainTab('outbound')}
          >
            출고 현황 (Outbound)
          </DashboardTabButton>

          <DashboardTabButton
            active={mainTab === 'insights'}
            activeClassName="bg-card text-violet-600 shadow-sm dark:text-violet-400"
            onClick={() => setMainTab('insights')}
          >
            운영 인사이트
          </DashboardTabButton>
        </div>
      </div>

      {mainTab === 'inbound' && (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <InboundSummaryTab />
        </div>
      )}

      {mainTab === 'outbound' && (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <OutboundSummaryTab />
        </div>
      )}

      {mainTab === 'insights' && (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <OperationalInsightsTab />
        </div>
      )}
    </div>
  );
}

function DashboardTabButton({
  active,
  activeClassName,
  children,
  onClick,
}: {
  active: boolean;
  activeClassName: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
        active
          ? activeClassName
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}
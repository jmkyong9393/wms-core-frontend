// 대시보드용 시스템 상태 패널 (Mock 고정값)
export default function SystemStatusPanel() {
  return (
    <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none p-5 font-mono">
      <h3 className="text-sm font-black tracking-wider text-black uppercase border-b-2 border-black pb-2 mb-4">SYSTEM STATUS</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-black font-semibold uppercase">Celery Worker Load</span>
            <span className="font-bold text-black">24%</span>
          </div>
          <div className="w-full bg-white border-2 border-black rounded-none h-4 overflow-hidden">
            <div className="bg-black h-full rounded-none" style={{ width: '24%' }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-black font-semibold uppercase">PostgreSQL DB IO</span>
            <span className="font-bold text-black">45%</span>
          </div>
          <div className="w-full bg-white border-2 border-black rounded-none h-4 overflow-hidden">
            <div className="bg-[#E60012] h-full rounded-none" style={{ width: '45%' }}></div>
          </div>
        </div>
        <div className="pt-4 mt-4 border-t-2 border-black">
          <p className="text-[11px] font-bold text-black leading-relaxed">
            * SYSTEM STATUS NORMAL. HPA RESOURCE ALLOCATION STABLE.
          </p>
        </div>
      </div>
    </div>
  );
}

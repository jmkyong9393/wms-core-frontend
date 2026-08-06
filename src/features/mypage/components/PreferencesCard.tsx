"use client";

import { useAtom } from "jotai";
import { Switch } from "@/components/ui/switch";
import { themeAtom } from "@/stores/atoms";
import { notificationsMutedAtom } from "@/features/notifications/store/notificationAtoms";

function PreferenceRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-zinc-100">{label}</p>
        <p className="text-xs text-gray-500 dark:text-zinc-400">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function PreferencesCard() {
  const [theme, setTheme] = useAtom(themeAtom);
  const [muted, setMuted] = useAtom(notificationsMutedAtom);

  return (
    <div className="divide-y divide-gray-100 dark:divide-zinc-800">
      <PreferenceRow
        label="다크 모드"
        description="화면을 어두운 테마로 표시합니다."
        checked={theme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
      <PreferenceRow
        label="알림 팝업 표시"
        description="꺼두면 새 알림 팝업이 뜨지 않습니다. 알림 목록·안읽음 개수는 계속 갱신됩니다."
        checked={!muted}
        onCheckedChange={(checked) => setMuted(!checked)}
      />
    </div>
  );
}

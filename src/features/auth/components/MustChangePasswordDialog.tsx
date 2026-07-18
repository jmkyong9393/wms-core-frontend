"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resolveMustChangePassword } from "../utils/devMock";

 /*
 * must_change_password 
 * - true : 초기 비밀번호를 아직 변경하지 않은 상태 → 목적지 화면에서 변경 권장 팝업 표시
 * - false: 비밀번호 변경 완료 상태 → 팝업 미표시
 * 초기 비밀번호를 사용 중인 사용자에게 비밀번호 변경을 권장
 * 비밀번호 변경을 미뤄도 현재 화면은 계속 이용 가능
 */

function isEligiblePath(path: string): boolean {
  return (
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path === "/inbound" ||
    path.startsWith("/inbound/")
  );
}

export function MustChangePasswordDialog() {
  const pathname = usePathname();
  const router = useRouter();

  // 현재 화면에서 사용자가 팝업을 닫았는지 관리
  const [dismissed, setDismissed] = useState(false);
  const [trackedPathname, setTrackedPathname] = useState(pathname);
  // 경로가 바뀌면 닫힘 상태를 초기화해 다시 안내할 수 있도록 처리
  if (pathname !== trackedPathname) {
    setTrackedPathname(pathname);
    setDismissed(false);
  }

  const open =
    !dismissed && isEligiblePath(pathname) && resolveMustChangePassword();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setDismissed(true);
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>비밀번호 변경을 권장합니다</DialogTitle>
          <DialogDescription>
            현재 발급된 초기 비밀번호를 사용하고 있습니다. 
            <br />
            계정 보안을 위해 새로운 비밀번호로 변경해 주세요.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDismissed(true)}>
            나중에 변경
          </Button>
          <Button
            onClick={() => {
              setDismissed(true);
              router.push("/change-password");
            }}
          >
            지금 변경
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

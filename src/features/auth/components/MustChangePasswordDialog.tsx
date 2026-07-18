"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { currentUserAtom } from "@/features/auth/store/authAtoms";


 // true : 초기 비밀번호를 아직 변경하지 않은 상태 → 변경 권장 팝업 표시
 // false: 비밀번호 변경 완료 상태 → 팝업 미표시
 // 팝업을 닫아도 서비스 이용 및 역할별 화면 접근 허용

export function MustChangePasswordDialog() {
  const router = useRouter();
  const user = useAtomValue(currentUserAtom);
  const [dismissed, setDismissed] = useState(false);

  const open = !dismissed && user?.mustChangePassword === true;

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

import type { Metadata } from "next";
import { LegalPageLayout } from "@/features/legal/components/LegalPageLayout";
import { LegalSection } from "@/features/legal/components/LegalSection";

export const metadata: Metadata = {
  title: "개인정보 처리방침 | NEWZED",
};

const EFFECTIVE_DATE = "2026년 8월 7일";

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="개인정보 처리방침" updatedAt={EFFECTIVE_DATE} activeHref="/privacy">
      <p>
        NEWZED AI_05조(이하 &ldquo;운영자&rdquo;)는 물류관리 서비스 NEWZED(이하 &ldquo;서비스&rdquo;)를 운영하며, 이용자의
        개인정보를 다음과 같이 처리합니다. 서비스는 원칙적으로 운영자로부터 계정을 부여받은 임직원이 이용하며, 계정
        없이 조회할 수 있는 일부 화면(품질인증정보 조회 등)에서는 별도로 개인정보를 입력받지 않습니다.
      </p>

      <LegalSection title="제1조(개인정보의 처리 목적)">
        <p>운영자는 다음의 목적을 위해 개인정보를 처리합니다.</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>이용자 계정 인증 및 서비스 이용 권한 부여</li>
          <li>입고, 검수, 재고관리, 출고 등 물류 업무 처리</li>
          <li>이용자 계정 관리(등록, 권한 변경, 이용 제한)</li>
          <li>서비스 운영과 관련된 알림 제공</li>
        </ol>
      </LegalSection>

      <LegalSection title="제2조(처리하는 개인정보 항목)">
        <ul className="list-disc space-y-1 pl-5">
          <li>필수 항목: 사번, 이름, 비밀번호 등 인증정보, 이용자 역할</li>
          <li>선택 항목: 이메일</li>
          <li>서비스 이용 과정에서 자동으로 생성되는 정보: 계정 등록일, 서비스 접속 이력 등</li>
          <li>현재 서비스에서 처리하지 않는 개인정보 항목: 주민등록번호, 전화번호, 결제정보, 생체정보</li>
        </ul>
      </LegalSection>

      <LegalSection title="제3조(개인정보의 처리 및 보유기간)">
        <p>
          운영자는 이용자의 재직 및 서비스 이용 기간 동안 개인정보를 보유합니다. 퇴사 또는 계정 이용이 종료된
          경우에는 종료일로부터 1년간 개인정보를 보관한 후 파기합니다. 다만 관계 법령에서 별도의 보존기간을 정하고
          있는 경우에는 해당 법령이 정한 기간 동안 보관합니다.
        </p>
      </LegalSection>

      <LegalSection title="제4조(개인정보의 제3자 제공)">
        <p>
          운영자는 이용자의 개인정보를 원칙적으로 서비스 제공 목적 범위 내에서만 처리하며, 법령에 특별한 규정이
          있는 경우를 제외하고는 이용자의 동의 없이 개인정보를 외부 제3자에게 제공하지 않습니다.
        </p>
      </LegalSection>

      <LegalSection title="제5조(개인정보 처리 위탁 및 국외 이전)">
        <p>
          운영자는 서비스 제공을 위해 클라우드 인프라를 이용하고 있으며, 관련 인프라는 대한민국(서울) 리전에서
          운영됩니다.
        </p>
        <p>
          운영자는 서비스 품질 향상을 위해 가격 산정, 재고 발주 추천 등 일부 기능에 인공지능 기술을 활용하고
          있습니다. 현재 서비스 운영 방식상 이 과정에서 이용자의 이름, 사번, 이메일 등 개인을 식별할 수 있는
          정보는 전달되지 않습니다.
        </p>
        <p>
          향후 서비스 확장 등으로 개인정보의 처리위탁 또는 국외 이전이 발생하는 경우, 운영자는 관련 법령에 따라
          그 사실과 항목·목적 등을 사전에 안내합니다.
        </p>
      </LegalSection>

      <LegalSection title="제6조(개인정보의 파기)">
        <p>
          운영자는 제3조에 따른 보유기간이 경과하거나 개인정보 처리 목적이 달성된 경우 해당 개인정보를 지체 없이
          파기합니다. 전자적 파일 형태로 저장된 개인정보는 재생할 수 없는 방법으로 안전하게 삭제합니다.
        </p>
      </LegalSection>

      <LegalSection title="제7조(이용자의 권리와 행사 방법)">
        <p>
          이용자는 운영자에게 언제든지 자신의 개인정보 열람, 정정, 처리정지를 요청할 수 있습니다. 권리 행사는
          아래 문의 채널을 통해 요청하실 수 있으며, 운영자는 관련 법령이 정한 기간 내에 필요한 조치를 취합니다.
        </p>
      </LegalSection>

      <LegalSection title="제8조(개인정보의 안전성 확보조치)">
        <p>운영자는 개인정보가 분실·도난·유출·변조되지 않도록 다음과 같은 보호조치를 취하고 있습니다.</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>비밀번호 등 인증정보의 안전한 저장</li>
          <li>개인정보에 대한 접근 권한 관리 및 통제</li>
          <li>인증정보의 유효기간 관리</li>
          <li>비정상적인 접근 시도에 대응하기 위한 절차 운영</li>
        </ol>
      </LegalSection>

      <LegalSection title="제9조(자동 수집 정보 및 쿠키)">
        <p>
          운영자는 로그인 상태 유지를 위해 필요한 최소한의 인증 정보를 이용자의 기기에 저장할 수 있습니다.
          서비스 이용 과정에서 접속 기록, 접속 IP, 브라우저 정보 등이 자동으로 생성되어 저장될 수 있습니다.
          운영자는 이용자를 대상으로 한 광고성 쿠키나 제3자 추적 도구를 사용하지 않습니다.
        </p>
      </LegalSection>

      <LegalSection title="제10조(개인정보 보호책임자)">
        <p>운영자는 개인정보 처리에 관한 업무를 총괄하며, 이용자의 개인정보 관련 문의에 아래 채널을 통해 답변해 드립니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>담당: NEWZED AI_05조 운영팀</li>
          <li>문의: hkp0706@naver.com</li>
        </ul>
      </LegalSection>

      <LegalSection title="제11조(개인정보 처리방침의 변경)">
        <p>
          본 방침은 법령, 정책 또는 서비스 내용의 변경에 따라 개정될 수 있으며, 변경 시 서비스 내 공지 등을
          통해 사전에 안내합니다.
        </p>
      </LegalSection>

      <LegalSection title="제12조(시행일)">
        <p>본 방침은 {EFFECTIVE_DATE}부터 적용됩니다.</p>
      </LegalSection>
    </LegalPageLayout>
  );
}

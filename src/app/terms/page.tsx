import type { Metadata } from "next";
import { LegalPageLayout } from "@/features/legal/components/LegalPageLayout";
import { LegalSection } from "@/features/legal/components/LegalSection";

export const metadata: Metadata = {
  title: "이용약관 | NEWZED",
};

const EFFECTIVE_DATE = "2026년 8월 7일";

export default function TermsPage() {
  return (
    <LegalPageLayout title="이용약관" updatedAt={EFFECTIVE_DATE} activeHref="/terms">
      <p>NEWZED는 판매·결제·환불 등 소비자 대상 거래 기능이 없는 물류관리 시스템입니다.</p>

      <LegalSection title="제1조(목적)">
        <p>
          본 약관은 NEWZED AI_05조(이하 &ldquo;운영자&rdquo;)가 제공하는 물류관리 서비스 NEWZED(이하
          &ldquo;서비스&rdquo;)의 이용과 관련하여 운영자와 이용자 간의 권리, 의무 및 책임사항을 정함을 목적으로
          합니다.
        </p>
      </LegalSection>

      <LegalSection title="제2조(용어의 정의)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>&ldquo;서비스&rdquo;란 운영자가 제공하는 입고, 검수, 재고관리, 출고 등 물류 관리 기능 및 관련 부가 기능을 말합니다.</li>
          <li>&ldquo;이용자&rdquo;란 운영자로부터 계정을 부여받아 서비스를 이용하는 자를 말합니다.</li>
          <li>&ldquo;계정&rdquo;이란 이용자가 서비스에 접속하기 위해 운영자로부터 부여받은 식별정보 및 인증 수단을 말합니다.</li>
          <li>
            &ldquo;품질인증정보(UBCI)&rdquo;란 서비스가 도서 상태를 평가하여 산출하는 품질 등급 및 관련 정보를
            말하며, 별도의 조회 페이지를 통해 계정 없이도 확인할 수 있습니다.
          </li>
        </ol>
      </LegalSection>

      <LegalSection title="제3조(약관의 효력 및 변경)">
        <p>운영자는 관련 법령을 위반하지 않는 범위에서 본 약관을 개정할 수 있으며, 개정 시 사전에 공지합니다.</p>
      </LegalSection>

      <LegalSection title="제4조(계정 및 인증)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>서비스의 계정은 운영자가 발급하며, 이용자가 임의로 신규 가입하는 절차는 제공되지 않습니다.</li>
          <li>이용자는 부여받은 계정 정보를 선량한 관리자의 주의로 관리해야 하며, 최초 로그인 시 비밀번호 변경이 요구될 수 있습니다.</li>
          <li>동일한 계정으로 다른 환경에서 다시 로그인하는 경우, 기존 접속은 종료될 수 있습니다.</li>
        </ol>
      </LegalSection>

      <LegalSection title="제5조(이용자 권한)">
        <p>
          운영자는 이용자의 역할에 따라 접근 가능한 화면과 기능을 다르게 제공합니다. 예를 들어 관리 권한을 가진
          이용자는 계정 관리 및 시스템 설정 등의 기능에, 현장 업무를 담당하는 이용자는 입고·검수·출고 등 실무
          기능에 접근할 수 있습니다. 세부 권한 범위는 운영자가 정하는 바에 따릅니다.
        </p>
      </LegalSection>

      <LegalSection title="제6조(서비스의 내용)">
        <p>운영자는 다음과 같은 서비스를 제공합니다.</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>도서 입고 및 상태 검수(인공지능 보조 판정 포함)</li>
          <li>재고 및 보관 위치 관리</li>
          <li>재고 상황에 따른 발주 추천 및 승인 절차</li>
          <li>출고를 위한 피킹·포장 관리</li>
          <li>서비스 운영 관련 알림 제공</li>
          <li>품질인증정보(UBCI) 조회 서비스 제공</li>
        </ol>
        <p>인공지능을 활용한 판정 결과 중 정확도가 낮다고 판단되는 사안은 담당자의 확인 절차를 거칠 수 있습니다.</p>
      </LegalSection>

      <LegalSection title="제7조(이용자의 의무)">
        <p>
          이용자는 계정 정보를 안전하게 관리해야 하며, 이를 제3자에게 공유·양도·대여해서는 안 됩니다. 서비스
          이용 과정에서 사실과 다른 정보를 등록해서는 안 됩니다.
        </p>
      </LegalSection>

      <LegalSection title="제8조(금지행위)">
        <p>이용자는 다음 행위를 해서는 안 됩니다.</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>부여받은 권한을 벗어난 기능에 접근하거나 접근을 시도하는 행위</li>
          <li>계정 정보를 공유·양도·대여하는 행위</li>
          <li>인공지능 검수 결과나 승인 절차를 부정한 방법으로 조작하거나 허위로 처리하는 행위</li>
          <li>서비스의 정상적인 운영을 방해하는 행위</li>
        </ol>
      </LegalSection>

      <LegalSection title="제9조(서비스의 변경 및 중단)">
        <p>
          운영자는 서비스 개선을 위해 필요한 경우 서비스의 전부 또는 일부를 변경하거나 중단할 수 있으며, 이
          경우 사전에 공지하는 것을 원칙으로 합니다.
        </p>
      </LegalSection>

      <LegalSection title="제10조(계정 이용 제한)">
        <p>운영자는 이용자가 본 약관을 위반하거나 서비스 이용 목적이 종료된 경우 해당 계정의 이용을 제한할 수 있습니다.</p>
      </LegalSection>

      <LegalSection title="제11조(지식재산권)">
        <p>
          서비스에 포함된 소프트웨어 및 콘텐츠에 대한 저작권은 운영자에게 귀속됩니다. 다만 서비스에 포함된 일부
          오픈소스 구성요소는 해당 라이선스 조건에 따르며, 관련 내용은 오픈소스 라이선스 고지 페이지에서 확인할
          수 있습니다.
        </p>
      </LegalSection>

      <LegalSection title="제12조(책임의 제한)">
        <ol className="list-decimal space-y-1 pl-5">
          <li>운영자는 천재지변 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
          <li>인공지능을 활용한 판정 결과는 참고 정보로 제공되며, 필요한 경우 담당자의 확인 절차를 거칩니다.</li>
          <li>그 외 운영자와 이용자의 책임 범위는 관련 법령에 따릅니다.</li>
        </ol>
      </LegalSection>

      <LegalSection title="제13조(분쟁의 해결)">
        <p>
          본 약관과 관련하여 분쟁이 발생하는 경우 운영자와 이용자는 원만한 해결을 위해 노력하며, 해결되지 않는
          경우 관련 법령이 정하는 관할법원에 따릅니다.
        </p>
      </LegalSection>

      <LegalSection title="제14조(시행일)">
        <p>본 약관은 {EFFECTIVE_DATE}부터 시행합니다.</p>
      </LegalSection>
    </LegalPageLayout>
  );
}

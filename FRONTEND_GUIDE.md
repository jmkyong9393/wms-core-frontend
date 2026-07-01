# 🎨 B2B WMS AI Platform - Frontend Architecture & Team Guide

본 문서는 프론트엔드 팀원들이 통일된 규칙으로 코드를 작성하고 유지보수하기 위한 **아키텍처 구조 및 코딩 컨벤션 가이드**입니다.
작업을 시작하기 전 반드시 숙지해 주시기 바랍니다.

---

## 📁 1. 디렉토리 구조 (Feature-driven Architecture)

우리 프로젝트는 역할과 책임(SRP)을 분리하여, 코드가 커져도 유지보수가 쉽도록 설계되었습니다. 기능 추가 시 아래의 폴더 용도에 맞게 파일을 생성해 주세요.

```text
src/
├── app/                  # 📍 라우팅 및 페이지 엔트리포인트
│   ├── (auth)/           # - 로그인, 회원가입 등 인증 관련 라우트 그룹
│   ├── dashboard/        # - 대시보드 페이지 라우트
│   ├── layout.tsx        # - 최상위 레이아웃
│   └── page.tsx          # - 메인(홈) 페이지
│
├── components/           # 🧩 UI 컴포넌트 모음 (가장 많이 작업하게 될 폴더)
│   ├── common/           # - Button, Input, Modal 등 전역 재사용 컴포넌트
│   ├── layout/           # - Header, Sidebar, Footer 등 틀(Layout) 컴포넌트
│   └── features/         # - 특정 도메인 로직이 포함된 덩어리 컴포넌트 (예: ReportCard)
│
├── hooks/                # 🪝 커스텀 React 훅
│   └── usePolling.ts     # - (예시) 서버 비동기 응답을 대기하는 폴링 로직 등
│
├── lib/                  # 🛠️ 범용 유틸리티 함수
│   ├── format.ts         # - 날짜, 금액 포맷팅 함수
│   └── s3_helper.ts      # - S3 업로드 유틸 함수 등
│
├── services/             # 🌐 API 호출 함수 (네트워크 계층)
│   └── api.ts            # - axios 인스턴스 설정 및 Fetch 로직
│
├── stores/               # 📦 전역 상태 관리 (Zustand 스토어)
│   └── useAuthStore.ts   # - 로그인 유저 정보 및 토큰 상태 관리
│
└── types/                # 🏷️ TypeScript 공통 인터페이스 및 타입 선언
    └── index.ts          # - DTO, 모델 인터페이스
```

---

## 💡 2. 팀원 필수 행동 가이드 (Do's & Don'ts)

코드가 꼬이거나 아키텍처가 붕괴되는 것을 막기 위한 핵심 원칙 3가지입니다.

### 🔴 1. `app/` 폴더에는 **오직 페이지(라우팅)** 로직만 두세요!
- `app/` 안에서 100줄이 넘어가는 복잡한 UI를 직접 그리지 마세요.
- UI 덩어리들은 무조건 `src/components/` 로 분리한 뒤, `page.tsx`에서는 이를 **Import 해서 조립(Assemble)**만 하는 형태로 작성해야 합니다.

### 🟡 2. API Fetching은 `services/`에서 담당합니다!
- 컴포넌트 내부에 `fetch()`나 `axios.get()`을 직접 하드코딩하지 마세요.
- API 호출 코드는 `src/services/` 폴더에 모아두고, 컴포넌트에서는 만들어진 함수를 불러와서 쓰거나 SWR/React-Query와 연동하세요.

### 🟢 3. 상대경로(`../../`) 대신 절대경로(`@/`)를 사용하세요!
- 본 프로젝트의 `tsconfig.json`에는 `@/` 경로가 `src/`로 매핑되어 있습니다.
- ❌ Bad: `import Button from '../../components/common/Button'`
- ✅ Good: `import Button from '@/components/common/Button'`

---

## 🚀 3. 로컬 실행 방법

이 레포지토리는 인프라 충돌을 방지하기 위해 Docker 환경을 지원합니다.

**방법 1. Node.js 네이티브 실행 (권장)**
```bash
npm ci
npm run dev
```

**방법 2. Docker 실행 (로컬 인프라 테스트용)**
```bash
docker-compose -f docker-compose.local.yml up -d
```

# 🎨 B2B WMS AI Platform - Frontend Architecture & Team Guide

본 문서는 프론트엔드 팀원들이 통일된 규칙으로 코드를 작성하고 유지보수하기 위한 **아키텍처 구조 및 코딩 컨벤션 가이드**입니다.
작업을 시작하기 전 반드시 숙지해 주시기 바랍니다.

---

## 👥 0. 담당자별 R&R (고영빈 & 박준희)

효율적인 협업과 코드 충돌 방지를 위해, 프론트엔드 파트를 두 분의 역할에 따라 아래와 같이 분리하여 개발을 진행합니다. (세부 사항은 협의에 따라 조율 가능)

### 🧑‍💻 고영빈 (FE UI/UX 메인 리드 & 정책 데이터 RAG 통합 메인 리드)
주로 **사용자 눈에 보이는 뷰(View)와 레이아웃 구조**를 총괄하며, **타사 정책 데이터 RAG 청크 마스터 통합** 업무를 메인으로 병행합니다.
- **주요 작업 폴더:** `app/` (페이지 라우팅), `components/` (UI 컴포넌트), `ai_knowledge_base/` (정책 데이터 마스터 통합)
- **주요 업무:** 
  - 기획 문서 및 요구사항을 바탕으로 공통 버튼, 인풋 등 재사용 가능한 UI 컴포넌트 제작 및 Tailwind CSS 반응형 웹 퍼블리싱 (FE 메인)
  - Next.js `app/` 폴더 내의 페이지 레이아웃 뼈대 구축
  - (사전 준비 단계) 팀원들(소한민, 홍경표)이 수집한 타사 정책 YAML 데이터를 검토하고 `policy_data_master.yaml`로 통합 및 구조 설계 (정책 데이터 메인)

### 🧑‍💻 박준희 (API 연동 및 비즈니스 로직 주도)
주로 **백엔드 통신과 전역 상태 관리, 데이터 플로우**를 책임집니다.
- **주요 작업 폴더:** `services/` (API 호출), `stores/` (상태 관리), `hooks/` (비즈니스 로직)
- **주요 업무:**
  - 백엔드(FastAPI) 명세서를 바탕으로 `axios` 또는 `fetch` API 함수 세팅
  - S3 Pre-signed URL 업로드 로직 및 폴링(Polling) 처리 로직 구현
  - Jotai 및 TanStack Query를 활용한 전역 상태 및 비동기 서버 데이터 관리

---

## 🛠️ 1. 프론트엔드 핵심 기술 스택 (Core Tech Stack)

본 프로젝트는 물류 현장의 열악한 네트워크와 디바이스 환경을 극복하기 위해 아래의 기술 스택을 엄격하게 사용합니다.

- **Framework:** Next.js (SSR/CSR 하이브리드 라우팅 적용)
- **UI Components:** shadcn/ui & Base UI (Tailwind CSS 기반 컴포넌트 시스템 및 Lucide-react)
- **State Management:** Jotai (Atomic 패턴을 활용한 가벼운 전역 상태 및 큐 관리)
- **Data Fetching:** TanStack Query (비동기 서버 상태, 캐싱 및 폴링 관리)
- **Edge AI & 최적화:** 
  - WebRTC 기반 커스텀 카메라 UI (기본 카메라 앱 의존성 탈피)
  - WASM OpenCV.js (브라우저 단독 흔들림/Blur 전처리 필터링)
  - Client-side 이미지 압축 및 낙관적 UI(Optimistic UI) 큐 적재

---

## 📁 2. 디렉토리 구조 (Feature-driven Domain Architecture)

우리 프로젝트는 역할과 책임(SRP)을 분리하고 도메인별 응집도를 극대화하기 위해, 핵심 기능들을 `src/features/` 하위에 도메인 단위로 묶는 **기능 중심 아키텍처**를 적용하고 있습니다.

```text
src/
├── app/                  # 📍 라우팅 및 페이지 엔트리포인트 (조립 계층)
│   ├── admin/            # - 관리자 영역 페이지 (queue, inventory, inspections)
│   ├── inbound/          # - 현장 반품 검수 페이지
│   ├── layout.tsx        # - 최상위 HTML/Body 및 Providers 레이아웃
│   └── page.tsx          # - 대시보드 메인 페이지
│
├── components/           # 🧩 공통 UI 컴포넌트 모음 (비즈니스 로직 없음)
│   ├── common/           # - Button, Input, Modal 등 도메인 비의존 재사용 컴포넌트
│   └── layout/           # - Header, Sidebar 등 애플리케이션 프레임워크 레이아웃
│
├── features/             # 🚀 도메인별 핵심 비즈니스 로직 및 전용 컴포넌트 응집
│   ├── inbound/          # - 반품 입고/스캔 기능 도메인
│   │   ├── api/          #   - S3 프리사인드 URL 발급 등 inbound 전용 API 호출
│   │   ├── components/   #   - CameraScanner 등 inbound 전용 UI 컴포넌트
│   │   ├── hooks/        #   - useCamera, useS3Upload 등 전용 React 훅
│   │   ├── store/        #   - uploadQueueAtoms.ts 등 해당 도메인 상태 관리 (Jotai)
│   │   └── utils/        #   - image-processor.ts 등 전용 유틸리티
│   │
│   ├── queue/            # - HITL(수동 검토) 대기열 도메인
│   │   ├── components/   #   - HitlQueueCard, HitlQueueSeeder 등
│   │   └── store/        #   - queueAtoms.ts 상태 관리
│   │
│   ├── inventory/        # - 재고/출고 도메인
│   │   └── types/        #   - inventory.ts 데이터 타입 정의
│   │
│   └── inspections/      # - AI 판정/검수 이력 도메인
│       ├── components/   #   - AgentLogAccordion 등 UI
│       └── mocks/        #   - mockAgentLogs.ts 모의 데이터
│
├── services/             # 🌐 공통 API 서비스 (네트워크/인프라 계층)
│   ├── authService.ts    # - Supabase/Mock 로그인 및 회원가입 비즈니스 로직
│   └── returnService.ts  # - 반품/검수 공통 CRUD 통신
│
├── stores/               # 📦 공통/전역 상태 관리 (Jotai Atoms)
│   └── atoms.ts          # - themeAtom, isSidebarOpenAtom, userAtom(인증) 등 공통 상태
│
└── types/                # 🏷️ TypeScript 애플리케이션 공통 타입 선언
```

---

## 💡 3. 팀원 필수 행동 가이드 (Do's & Don'ts)

코드가 꼬이거나 아키텍처가 붕괴되는 것을 막기 위한 핵심 원칙 3가지입니다.

### 🔴 1. `app/` 폴더에는 **오직 페이지(라우팅)** 로직만 두세요!
- `app/` 안에서 100줄이 넘어가는 복잡한 UI를 직접 그리지 마세요.
- UI 덩어리들은 무조건 `src/components/` 로 분리한 뒤, `page.tsx`에서는 이를 **Import 해서 조립(Assemble)**만 하는 형태로 작성해야 합니다.

### 🟡 2. API Fetching은 `services/`에서 담당합니다!
- 컴포넌트 내부에 `fetch()`나 `axios.get()`을 직접 하드코딩하지 마세요.
- API 호출 코드는 `src/services/` 폴더에 모아두고, 컴포넌트에서는 만들어진 함수를 불러와서 TanStack Query와 연동하세요.

### 🟢 3. 상대경로(`../../`) 대신 절대경로(`@/`)를 사용하세요!
- 본 프로젝트의 `tsconfig.json`에는 `@/` 경로가 `src/`로 매핑되어 있습니다.
- ❌ Bad: `import Button from '../../components/common/Button'`
- ✅ Good: `import Button from '@/components/common/Button'`

---

## 🚀 4. 로컬 실행 방법

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

---

## 📸 5. WebRTC 카메라 및 전처리 아키텍처 (v1.4 핵심)

우리 프론트엔드는 단순한 뷰 단을 넘어, 백엔드 서버 부하를 막기 위한 **극단적인 클라이언트 사이드 연산(Edge Pre-processing)**을 수행합니다. 

### 5-1. 주요 구조 및 파일
*   **`src/hooks/useCamera.ts`**: 디바이스의 후면 카메라를 호출하고 최고 해상도(Max Resolution)로 스트림을 엽니다.
*   **`src/lib/image-processor.ts`**: 
    *   **압축:** `canvas.toBlob`을 사용하여 촬영된 10MB 고화질 이미지를 500KB 이하로 브라우저에서 즉시 압축합니다.
    *   **흔들림 감지 (Blur Detection):** 픽셀 단위로 라플라시안 분산(Laplacian Variance)을 계산하여, 사진이 심하게 흔들린 경우 서버(AI)로 전송하지 않고 브라우저단에서 차단(경고)합니다. (추후 WASM OpenCV.js 로직으로 완전히 대체될 예정입니다.)
*   **`src/components/camera/CameraScanner.tsx`**: 책을 정렬할 수 있는 중앙 오버레이(BBox 가이드라인)를 띄워주는 핵심 뷰 컴포넌트입니다.

### 5-2. 낙관적 UI (Optimistic UI) 와 큐(Queue) 연동
작업자가 사진을 찍자마자 "로딩 스피너"를 보고 기다리게 하면 물류 창고의 작업 속도가 크게 떨어집니다.
1.  촬영 직후, 즉시 Jotai 전역 큐(`uploadQueueAtom`)에 임시 객체(PENDING 상태)를 집어넣습니다.
2.  화면은 즉시 '다음 촬영' 대기 상태로 전환되며 작업자는 다음 책을 스캔할 수 있습니다.
3.  백그라운드에서 비동기로 백엔드에 이미지를 POST 전송(`api.ts`)하고, 3초 주기 폴링(TanStack Query 활용)을 통해 COMPLETED 상태가 떨어지면 화면 하단의 뱃지 UI만 살짝 업데이트합니다.

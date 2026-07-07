# 📦 B2B WMS AI Platform - Frontend Guide (CLAUDE.md)

## 📌 Project Overview
본 프로젝트는 **B2B WMS AI Platform**의 **프론트엔드 레포지토리**입니다.
물류센터(WMS)의 도서 입출고·반품 및 재고 상태 관리의 실시간 모니터링을 담당하며, **Next.js 16 (App Router)** 기반으로 구축된 고성능 반응형 웹 애플리케이션(모바일 PWA 포함)입니다. 

### Key Frontend Features
1. **반품/중고 서적 AI 검수 뷰 (Returns & Used Books)**
   - **모바일 PWA 카메라 검수**: 스마트폰으로 바코드 및 도서 상태(외관/내지) 촬영 가이드 UI 제공.
   - **S3 Direct Upload (Pre-signed URL)**: 클라이언트에서 백엔드 API (`POST /api/upload/url`)를 호출하여 URL을 받아온 후, 대용량 이미지를 브라우저에서 S3로 다이렉트 업로드(PUT)하여 백엔드 병목 차단.
   - **실시간 비동기 업데이트**: API 요청(202 응답) 후 반환된 `job_id` 기반으로 SSE(Server-Sent Events) 또는 Polling을 통해 AI 검수 상태(진행율, Vision BBox 결과, UBCI 점수 및 최종 등급 리포트)를 실시간 반영.
   - **MemorySaver HITL UI**: 신뢰도가 낮은 판정 발생 시 관리자가 수동 보정 및 승인할 수 있는 관리자 중재(HITL) 인터페이스 제공.

2. **스마트 출고 뷰 (Smart Outbound)**
   - **출고 지시서 (Picking List)**: UBCI 상태 선입선출(FIFO) 기반으로 할당된 로케이션 시각화.
   - **3D Bin Packing 3D 시각화**: 다건 도서 주문 시 최적 택배 박스 적재 가이드를 추천하는 UI.
   - **UBCI 디지털 품질 보증서**: 출고 완료 후 소비자용 모바일 품질 보증서 페이지(QR/Link 연동) 렌더링.

3. **관리자 AI 인사이트 대시보드 (Dashboard)**
   - **실시간 가상 로케이션 현황판**: 창고 내 도서 등급별/로케이션별 재고 실시간 Grid 뷰.
   - **AI 분석 리포트**: 주간 반품 통계 및 이상거래탐지(FDS) 위젯 시각화.

---

## 🛠️ Technology Stack
- **Framework**: Next.js 16.2.9 (App Router)
- **Library & Runtime**: React 19.2.4, TypeScript 5
- **Styling**: Tailwind CSS v4 (CSS-first config), shadcn/ui, Lucide React (Icons), tw-animate-css
- **State Management**: Zustand (Global states like Auth, Modals), Jotai (Atomic state optional)
- **Data Fetching**: @tanstack/react-query v5 (API cache & query sync)
- **HTTP Client**: Axios (configured in `src/services/api.ts`)

---

## 💻 Essential Commands
### Local Development
```bash
# 1. 의존성 패키지 설치
npm ci

# 2. 로컬 개발 서버 구동 (http://localhost:3000)
npm run dev

# 3. ESLint 코드 규칙 검사
npm run lint

# 4. 프로덕션 빌드 테스트
npm run build

# 5. 빌드 결과물 로컬 가동
npm start
```

### Docker (Local E2E Local Environment)
프론트엔드 단독 실행 외에, API 서버 및 DB 등 백엔드/AI 인프라와 로컬 E2E 테스트가 필요할 시 루트에 마련된 Docker Compose 설정을 가동합니다.
```bash
# 1. 로컬 컨테이너 가동 (wms-frontend 포트 3000 오픈)
docker-compose -f docker-compose.local.yml up -d --build

# 2. 프론트엔드 컨테이너 실시간 로그 조회
docker-compose -f docker-compose.local.yml logs -f frontend

# 3. 로컬 컨테이너 종료 및 정리
docker-compose -f docker-compose.local.yml down
```

---

## 👥 Frontend Team & R&R
- **박준희 (Lead)**: API 연동, Zustand 전역 상태 관리, S3 업로드 로직, 비동기 작업 Polling/SSE 설계, 비즈니스 훅 개발.
- **고영빈 (UI/UX & Data)**: Next.js Layout/Page 구조 설계, Tailwind v4 퍼블리싱, shadcn/ui 공통 컴포넌트 커스터마이징, 모바일 PWA 반응형 최적화, 정책 YAML 지식베이스 취합.

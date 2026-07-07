<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 🤖 SYSTEM_PROMPT: AGENT_COGNITIVE_HARNESS

## [ROLE_IDENTITY]
- **Role**: Senior Frontend Engineer specializing in Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, and Jotai.
- **Goal**: Write zero-error, type-safe, highly performant component code mapping strictly to directory specifications.

## [CRITICAL_CONSTRAINTS]
- **No Placeholders**: Never write comments like `// ... (rest of the code)` or `/* same as before */`. You must output the entire, complete, and functional file contents.
- **Type Safety**: Avoid using `any`. Use custom types/interfaces or `unknown` with strict type guards.
- **Absolute Imports**: Always use absolute paths starting with `@/` mapping to `src/`. Do not use relative imports (`../`).
- **Decoupled API**: Do not embed raw axios or fetch calls in UI components. Put them in `src/services/`.
- **Tailwind v4 CSS-First**: Do not create `tailwind.config.js`. Define all themes, colors, and variables under the `@theme` directive inside `src/app/globals.css`.

---

## [NEXTJS_16_REACT_19_SPECIFIC_RULES]
<rules>
1. **Asynchronous params/searchParams (Next.js 16)**:
   - Page and Layout props `params` and `searchParams` are Promises. You MUST unwrap them using `await` (Server Components) or `use()` hook (Client Components).
   - *Server Component Example*:
     ```typescript
     export default async function Page({ params }: { params: Promise<{ id: string }> }) {
       const { id } = await params;
       return <div>ID: {id}</div>;
     }
     ```
   - *Client Component Example*:
     ```typescript
     'use client';
     import { use } from 'react';
     export default function Page({ params }: { params: Promise<{ id: string }> }) {
       const { id } = use(params);
       return <div>ID: {id}</div>;
     }
     ```
2. **Server vs Client Separation**:
   - Make all components Server Components by default.
   - Use `'use client'` only at leaf components requiring browser hooks (state, effects), Zustand states, or DOM events.
3. **Form Actions & Hooks**:
   - Utilize React 19 `<form action={action}>` handlers and hooks (`useActionState`, `useFormStatus`, `useOptimistic`) to manage pending/error state transitions instead of custom boolean states.
</rules>

---

## [STYLING_TAILWIND_V4_RULES]
<rules>
1. Utilize Tailwind utility classes natively for styling.
2. For global theme modifications, edit `src/app/globals.css` directly under `@theme`:
   ```css
   @import "tailwindcss";
   @theme {
     --color-brand-primary: #123456;
   }
   ```
3. Responsive design is mobile-first. Enforce mobile layouts using breakpoints (`sm:`, `md:`, `lg:`) before tailoring desktop screens (especially for PWA views).
</rules>

---

## [STATE_MANAGEMENT_JOTAI]
<rules>
1. Prevent wasteful React re-renders by using Jotai's selective atom retrieval hooks.
   - ❌ *Anti-pattern*: `const [value, setValue] = useAtom(myAtom);` (읽기+쓰기 동시 구독 → 불필요한 리렌더)
   - ✅ *Read-only pattern*:
     ```typescript
     const value = useAtomValue(myAtom);
     ```
   - ✅ *Write-only pattern*:
     ```typescript
     const setValue = useSetAtom(myAtom);
     ```
2. Place all Jotai atom definitions in `src/stores/`.
3. Derived atoms (`atom((get) => ...)`) should be co-located with their base atoms.
</rules>

---

## [DOCUMENTATION_COMMENTS]
<rules>
1. All complex custom hooks, shared components, and helper utilities must have JSDoc comments defining the function's purpose, parameters, and return types.
2. Inline comments must address **"Why"** a particular business logic, math formula (like UBCI penalty scoring, 3D Bin Packing fallback sizing) or browser workaround is needed, not **"What"** the code does syntax-wise.
3. Remove debug logs (`console.log`) and dead code before PR submissions.
</rules>

---

## [LOCAL_DEV_AND_INTEGRATION_TESTING]
<rules>
1. **API Server Integration & Environment Variables**:
   - The local backend API server is exposed at `http://localhost:8000`.
   - Do NOT hardcode the backend API endpoint (`http://localhost:8000`) in source code. Always reference `process.env.NEXT_PUBLIC_API_URL` for API endpoints.
   - Example configuration for API client setup:
     ```typescript
     const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
     ```
2. **Integration Verification via Docker**:
   - Local E2E testing requires launching the integrated Docker compose environment via `docker-compose -f docker-compose.local.yml up -d --build`.
   - Ensure the Next.js container (accessible at `http://localhost:3000`) communicates correctly with `wms-api` at `http://localhost:8000` without CORS or network configuration blocks.
</rules>

---

## [GIT_AND_COLLABORATION]
<rules>
1. Git Branch naming must match: `feat/FE-<issue>-<desc>`, `fix/FE-<issue>-<desc>`, or `design/FE-<issue>-<desc>`.
2. Commit message prefixes: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `chore:`.
3. Verify compile checks locally via `npm run build` and `npm run lint` before committing.
</rules>

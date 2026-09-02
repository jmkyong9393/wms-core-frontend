import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // MSW 워커와 서비스워커는 생성 산출물이다.
    "public/mockServiceWorker.js",
    "public/sw.js",
  ]),
  {
    // 기존 부채는 warn으로 가시화한다. error로 두면 CI가 상시 실패해
    // 새로 유입되는 위반을 걸러내지 못한다.
    rules: {
      // catch(err: any)와 서드파티 이벤트 페이로드가 대부분이다.
      "@typescript-eslint/no-explicit-any": "warn",
      // React Compiler 규칙. 현행 effect-setState 패턴은 동작하는 코드다.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
]);

export default eslintConfig;

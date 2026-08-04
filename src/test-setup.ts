import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/dom";

// 이 실행 환경은 여러 테스트 파일이 동시에 렌더링될 때 waitFor/findBy* 기본
// 타임아웃(1000ms)을 넘기는 경우가 있어 간헐적으로 실패한다. 여유를 두어
// 실제로 통과해야 할 케이스가 타이밍 때문에 실패하지 않도록 한다.
configure({ asyncUtilTimeout: 5000 });

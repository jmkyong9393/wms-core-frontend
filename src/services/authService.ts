import { supabase } from "@/lib/supabase";
import type { UserInfo } from "@/stores/atoms";

// 환경변수에서 Supabase 설정값 존재 여부 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const isPlaceholder = (val: string) => !val || val.includes("PLACEHOLDER") || val === "";
const isSupabaseConfigured = !isPlaceholder(supabaseUrl) && !isPlaceholder(supabasePublishableKey);

// 사내 코드 기본값 가져오기
const COMPANY_CODE = process.env.NEXT_PUBLIC_COMPANY_CODE || "aivle202609";

/**
 * 비밀번호를 SHA-256 해시로 변환하는 헬퍼 함수
 * Web Crypto API를 사용하여 브라우저 네이티브 환경에서 의존성 없이 처리합니다.
 */
export async function hashPassword(password: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    // SSR 환경 또는 매우 구형 브라우저 대응용 간단한 해시 폴백 (가상 해시)
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      hash = (hash << 5) - hash + password.charCodeAt(i);
      hash |= 0;
    }
    return `fallback_hash_${hash}`;
  }
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * UUID v4 생성기 (클라이언트 사이드에서 신규 유저 등록 시 사용)
 */
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// === Mock 데이터베이스용 인터페이스 (localStorage 기반 백업) ===
interface MockUser extends UserInfo {
  password_hash: string;
  created_at: string;
  update_at: string;
  last_login?: string | null;
}

const MOCK_USERS_KEY = "wms_mock_users_db";

function getMockUsers(): MockUser[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(MOCK_USERS_KEY);
  if (!stored) {
    // 디폴트 목 관리자 계정 생성
    const defaultAdmin: MockUser = {
      id: "admin-uuid-1111",
      employee_id: "admin",
      name: "최고 관리자",
      email: "admin@wms-corp.com",
      password_hash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", // admin123! 의 SHA-256 해시
      role: "MASTER",
      status: "ACTIVE",
      created_at: new Date().toISOString(),
      update_at: new Date().toISOString(),
    };
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify([defaultAdmin]));
    return [defaultAdmin];
  }
  return JSON.parse(stored);
}

function saveMockUsers(users: MockUser[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
  }
}

/**
 * 가상 세션 JWT 생성 헬퍼
 */
function createFakeToken(payload: { id: string; employee_id: string; role: string }): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const data = btoa(JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 }));
  const signature = "wms_signature_secret";
  return `${header}.${data}.${signature}`;
}

export const authService = {
  /**
   * 회원가입을 수행합니다.
   * 
   * @param payload 회원가입 입력 정보 및 사내 가입 코드
   * @returns 등록된 사용자 정보
   */
  async signup(payload: {
    employee_id: string;
    name: string;
    email: string | null;
    password: string;
    role: "MASTER" | "WORKER" | "GUEST" | "PENDING";
    companyCode: string;
  }): Promise<UserInfo> {
    // 1. 사내 코드 일치 여부 확인
    if (payload.companyCode !== COMPANY_CODE) {
      throw new Error("❌ 올바른 사내 코드가 아닙니다. 외부인은 가입이 제한됩니다.");
    }

    const passwordHash = await hashPassword(payload.password);
    const now = new Date().toISOString();

    // 2. Supabase 연동 분기
    if (isSupabaseConfigured) {
      // 2.1 사번 중복 체크
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("employee_id", payload.employee_id)
        .maybeSingle();

      if (checkError) {
        throw new Error(`회원 정보 확인 중 오류 발생: ${checkError.message}`);
      }
      if (existingUser) {
        throw new Error("❌ 이미 존재하는 사번입니다. 다른 사번을 입력해 주세요.");
      }

      // 2.2 신규 회원 등록
      const newUser = {
        id: generateUUID(),
        employee_id: payload.employee_id,
        name: payload.name,
        email: payload.email || null,
        password_hash: passwordHash,
        role: payload.role,
        status: "ACTIVE", // 기본 상태는 활성
        created_at: now,
        update_at: now, // 스펙 파일에 맞춤
      };

      const { data, error } = await supabase
        .from("users")
        .insert([newUser])
        .select()
        .single();

      if (error) {
        throw new Error(`회원가입 처리 중 오류 발생: ${error.message}`);
      }

      return {
        id: data.id,
        employee_id: data.employee_id,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
      };
    } else {
      // Mock 모드 동작
      const mockUsers = getMockUsers();
      if (mockUsers.some((u) => u.employee_id === payload.employee_id)) {
        throw new Error("❌ 이미 존재하는 사번입니다. 다른 사번을 입력해 주세요. (Mock 모드)");
      }

      const newMockUser: MockUser = {
        id: generateUUID(),
        employee_id: payload.employee_id,
        name: payload.name,
        email: payload.email,
        password_hash: passwordHash,
        role: payload.role,
        status: "ACTIVE",
        created_at: now,
        update_at: now,
      };

      mockUsers.push(newMockUser);
      saveMockUsers(mockUsers);

      return {
        id: newMockUser.id,
        employee_id: newMockUser.employee_id,
        name: newMockUser.name,
        email: newMockUser.email,
        role: newMockUser.role,
        status: newMockUser.status,
      };
    }
  },

  /**
   * 로그인을 수행하고 가상의 토큰과 사용자 프로필을 반환합니다.
   * 
   * @param credentials 로그인 정보 (사번 및 비밀번호)
   * @returns 토큰 및 세션 유저 정보
   */
  async login(credentials: {
    employee_id: string;
    password: string;
  }): Promise<{ token: string; user: UserInfo }> {
    const passwordHash = await hashPassword(credentials.password);
    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      // 1. 유저 정보 조회
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("employee_id", credentials.employee_id)
        .maybeSingle();

      if (error) {
        throw new Error(`로그인 조회 중 오류 발생: ${error.message}`);
      }
      if (!user) {
        throw new Error("❌ 일치하는 회원 정보가 없습니다. 사번을 확인해 주세요.");
      }

      // 2. 비밀번호 일치 검증
      if (user.password_hash !== passwordHash) {
        throw new Error("❌ 비밀번호가 올바르지 않습니다.");
      }

      // 3. 마지막 로그인 시각 기록
      await supabase
        .from("users")
        .update({ last_login: now })
        .eq("id", user.id);

      const token = createFakeToken({ id: user.id, employee_id: user.employee_id, role: user.role });

      const userInfo: UserInfo = {
        id: user.id,
        employee_id: user.employee_id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      };

      // 4. 로컬 스토리지 보존
      localStorage.setItem("wms_token", token);
      localStorage.setItem("wms_user", JSON.stringify(userInfo));

      return { token, user: userInfo };
    } else {
      // Mock 모드 동작
      const mockUsers = getMockUsers();
      const user = mockUsers.find((u) => u.employee_id === credentials.employee_id);

      if (!user) {
        throw new Error("❌ 일치하는 회원 정보가 없습니다. (Mock 모드)");
      }
      if (user.password_hash !== passwordHash) {
        throw new Error("❌ 비밀번호가 올바르지 않습니다. (Mock 모드)");
      }

      // 가상 로그인 기록
      user.last_login = now;
      saveMockUsers(mockUsers);

      const token = createFakeToken({ id: user.id, employee_id: user.employee_id, role: user.role });

      const userInfo: UserInfo = {
        id: user.id,
        employee_id: user.employee_id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      };

      localStorage.setItem("wms_token", token);
      localStorage.setItem("wms_user", JSON.stringify(userInfo));

      return { token, user: userInfo };
    }
  },

  /**
   * 세션을 초기화하고 로컬 토큰 정보를 말소합니다.
   */
  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("wms_token");
      localStorage.removeItem("wms_user");
    }
  },

  /**
   * 브라우저 스토리지에서 이전 로그인 정보를 복원합니다.
   */
  restoreSession(): { token: string; user: UserInfo } | null {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("wms_token");
    const userStr = localStorage.getItem("wms_user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as UserInfo;
        return { token, user };
      } catch {
        this.logout();
        return null;
      }
    }
    return null;
  },
};

"use client";

import React, { useState, useActionState, startTransition } from "react";
import { useSetAtom } from "jotai";
import { tokenAtom, userAtom } from "@/stores/atoms";
import { authService } from "@/services/authService";
import { Eye, EyeOff } from "lucide-react";

/**
 * 눈 달린 상자 아트워크(PLAY BOX)와 아방가르드 레이아웃 복원
 * 
 * 꼼데가르송을 연상시키는 텍스트(COMME des...)는 전부 제외하고,
 * WMS AI PLATFORM 본래의 이름과 해체주의적 디자인 요소를 조화시켰습니다.
 */
export default function AuthPage() {
  const setToken = useSetAtom(tokenAtom);
  const setUser = useSetAtom(userAtom);

  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [loginState, loginAction, isLoginPending] = useActionState(
    async (_prev: { error: string | null }, formData: FormData) => {
      const employeeId = formData.get("employee_id") as string;
      const password = formData.get("password") as string;
      if (!employeeId || !password) {
        return { error: "사원번호와 비밀번호를 모두 입력해 주십시오." };
      }
      try {
        const { token, user } = await authService.login({ employee_id: employeeId, password });
        setToken(token);
        setUser(user);
        return { error: null };
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : "로그인에 실패했습니다." };
      }
    },
    { error: null }
  );

  const [signupState, signupAction, isSignupPending] = useActionState(
    async (_prev: { error: string | null }, formData: FormData) => {
      const employeeId = formData.get("employee_id") as string;
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const role = formData.get("role") as "MASTER" | "WORKER";
      const companyCode = formData.get("company_code") as string;
      if (!employeeId || !name || !password || !role || !companyCode) {
        return { error: "필수 항목(*)을 모두 기입해 주십시오." };
      }
      try {
        await authService.signup({
          employee_id: employeeId,
          name,
          email: email || null,
          password,
          role,
          companyCode,
        });
        setSuccessMessage("회원가입이 완료되었습니다. 로그인을 진행해 주십시오.");
        setActiveTab("login");
        return { error: null };
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : "회원가입에 실패했습니다." };
      }
    },
    { error: null }
  );

  const switchTab = (tab: "login" | "signup") => {
    setActiveTab(tab);
    setSuccessMessage(null);
    setShowPassword(false);
  };

  return (
    // 크림화이트 생지 캔버스 배경 유지
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F9F9F7] px-6 py-12 font-mono text-black">

      <div className="w-full max-w-[420px] bg-white border-2 border-black p-8 md:p-10 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">

        {/* 상단 오마주 아트워크: 눈이 달린 빨간 상자 (WMS PLAY BOX) */}
        <div className="flex flex-col items-center mb-8 select-none">
          <div className="w-20 h-16 relative cursor-pointer hover:scale-105 transition-transform duration-200">
            {/* 눈 달린 상자 그래픽 SVG */}
            <svg viewBox="0 0 100 80" className="w-full h-full">
              {/* 메인 레드 상자 바디 */}
              <rect x="15" y="20" width="70" height="50" fill="#E60012" stroke="#000" strokeWidth="3" />
              {/* 상자 뚜껑 */}
              <polygon points="10,20 50,5 90,20" fill="#E60012" stroke="#000" strokeWidth="3" />
              {/* 왼쪽 흰 눈자위 */}
              <ellipse cx="40" cy="45" rx="10" ry="12" fill="#FFF" stroke="#000" strokeWidth="2.5" />
              {/* 왼쪽 동공 */}
              <circle cx="43" cy="41" r="5" fill="#000" />
              {/* 오른쪽 흰 눈자위 */}
              <ellipse cx="60" cy="45" rx="10" ry="12" fill="#FFF" stroke="#000" strokeWidth="2.5" />
              {/* 오른쪽 동공 */}
              <circle cx="57" cy="41" r="5" fill="#000" />
              {/* 미묘한 눈꺼풀 선 */}
              <path d="M30,35 Q40,38 50,35" stroke="#000" strokeWidth="2" fill="none" />
              <path d="M50,35 Q60,38 70,35" stroke="#000" strokeWidth="2" fill="none" />
            </svg>
          </div>

          {/* 타이틀에서 브랜드 이름 제거 및 고유 이름 매핑 */}
          <h1 className="text-lg font-black tracking-[0.18em] text-black uppercase mt-4">
            WMS AI PLATFORM
          </h1>
          <p className="text-[9px] tracking-[0.25em] text-gray-400 uppercase mt-1">
            INTEGRATED MANAGEMENT SYSTEM
          </p>
        </div>

        {/* 탭 인터페이스 - 고대비 굵은 실선 적용 */}
        <div className="flex border-b-2 border-black mb-8">
          <button
            type="button"
            onClick={() => switchTab("login")}
            className={`flex-1 text-center py-2.5 text-xs font-bold tracking-widest uppercase transition-all rounded-none cursor-pointer ${activeTab === "login"
                ? "bg-black text-white"
                : "text-black hover:bg-gray-100"
              }`}
          >
            LOGIN
          </button>
          <button
            type="button"
            onClick={() => switchTab("signup")}
            className={`flex-1 text-center py-2.5 text-xs font-bold tracking-widest uppercase transition-all rounded-none cursor-pointer ${activeTab === "signup"
                ? "bg-black text-white"
                : "text-black hover:bg-gray-100"
              }`}
          >
            SIGNUP
          </button>
        </div>

        {/* 성공 피드백 알림 */}
        {successMessage && (
          <div className="mb-6 border-2 border-black bg-[#E60012]/10 p-4 text-[11px] font-bold text-black rounded-none">
            * {successMessage}
          </div>
        )}

        {/* ── 로그인 폼 ── */}
        {activeTab === "login" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              startTransition(() => loginAction(new FormData(e.currentTarget)));
            }}
            className="space-y-6"
          >
            {loginState.error && (
              <div className="text-xs font-bold text-[#E60012]">
                ! ERROR: {loginState.error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="login_id" className="block text-[10px] font-bold tracking-widest text-black">
                EMPLOYEE ID *
              </label>
              <input
                id="login_id"
                name="employee_id"
                type="text"
                required
                placeholder="사원번호를 기입하십시오"
                className="w-full bg-transparent border-b-2 border-black py-2 text-xs focus:outline-none focus:border-[#E60012] placeholder-gray-300 rounded-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login_pw" className="block text-[10px] font-bold tracking-widest text-black">
                PASSWORD *
              </label>
              <div className="relative border-b-2 border-black">
                <input
                  id="login_pw"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="비밀번호를 기입하십시오"
                  className="w-full bg-transparent py-2 pr-10 text-xs focus:outline-none placeholder-gray-300 rounded-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-1 flex items-center text-black/60 hover:text-black cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={isLoginPending}
              className="w-full py-4 bg-black text-white hover:bg-[#E60012] font-black text-xs tracking-[0.25em] uppercase rounded-none border-2 border-black transition-all cursor-pointer disabled:opacity-40"
            >
              {isLoginPending ? "PROCESSING..." : "ACCESS SYSTEM"}
            </button>
          </form>
        )}

        {/* ── 회원가입 폼 ── */}
        {activeTab === "signup" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              startTransition(() => signupAction(new FormData(e.currentTarget)));
            }}
            className="space-y-4"
          >
            {signupState.error && (
              <div className="text-xs font-bold text-[#E60012]">
                ! ERROR: {signupState.error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="su_id" className="block text-[10px] font-bold tracking-widest text-black">
                  ID *
                </label>
                <input
                  id="su_id"
                  name="employee_id"
                  type="text"
                  required
                  placeholder="사번"
                  className="w-full bg-transparent border-b-2 border-black py-2 text-xs focus:outline-none focus:border-[#E60012] placeholder-gray-300 rounded-none"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="su_name" className="block text-[10px] font-bold tracking-widest text-black">
                  NAME *
                </label>
                <input
                  id="su_name"
                  name="name"
                  type="text"
                  required
                  placeholder="이름"
                  className="w-full bg-transparent border-b-2 border-black py-2 text-xs focus:outline-none focus:border-[#E60012] placeholder-gray-300 rounded-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="su_email" className="block text-[10px] font-bold tracking-widest text-black">
                EMAIL
              </label>
              <input
                id="su_email"
                name="email"
                type="email"
                placeholder="이메일을 기입하십시오 (선택)"
                className="w-full bg-transparent border-b-2 border-black py-2 text-xs focus:outline-none focus:border-[#E60012] placeholder-gray-300 rounded-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="su_pw" className="block text-[10px] font-bold tracking-widest text-black">
                  PASSWORD *
                </label>
                <input
                  id="su_pw"
                  name="password"
                  type="password"
                  required
                  placeholder="비밀번호"
                  className="w-full bg-transparent border-b-2 border-black py-2 text-xs focus:outline-none focus:border-[#E60012] placeholder-gray-300 rounded-none"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="su_role" className="block text-[10px] font-bold tracking-widest text-black">
                  ROLE *
                </label>
                <select
                  id="su_role"
                  name="role"
                  required
                  defaultValue="WORKER"
                  className="w-full bg-transparent border-b-2 border-black py-2 text-xs focus:outline-none rounded-none cursor-pointer"
                >
                  <option value="WORKER">현장 작업자</option>
                  <option value="MASTER">총괄 관리자</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="su_code" className="block text-[10px] font-bold tracking-widest text-black">
                SECURITY CODE *
              </label>
              <input
                id="su_code"
                name="company_code"
                type="password"
                required
                placeholder="사내 가입 제한 코드"
                className="w-full bg-transparent border-b-2 border-[#E60012] py-2 text-xs focus:outline-none placeholder-gray-300 rounded-none font-bold text-[#E60012]"
              />
            </div>

            {/* 가입 버튼 */}
            <button
              type="submit"
              disabled={isSignupPending}
              className="w-full py-4 bg-black text-white hover:bg-[#E60012] font-black text-xs tracking-[0.25em] uppercase rounded-none border-2 border-black transition-all cursor-pointer disabled:opacity-40 mt-4"
            >
              {isSignupPending ? "CREATING..." : "CREATE ACCOUNT"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

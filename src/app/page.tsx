import { redirect } from 'next/navigation';

// 로그인 기능 추가하면 '/login' 또는 '/admin'으로 분기하도록 교체할 예정
export default function RootPage() {
  redirect('/admin');
}

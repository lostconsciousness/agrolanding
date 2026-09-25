import { authConfigured } from '@/lib/server/auth';
import { LoginForm } from '@/components/chat/login-form';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Вхід — CORE AGRO' };
export default function LoginPage() {
  return <LoginForm ready={authConfigured()} />;
}

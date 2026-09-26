import { ChatWorkspace } from '@/components/chat/chat-workspace';
import { freeChatEnabled } from '@/lib/server/chat-access';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'AI-асистент — CORE AGRO',
  description:
    'Ваші аграрні запитання, збережені діалоги та контекст господарства.',
};
export default function ChatPage() {
  return <ChatWorkspace freeAccess={freeChatEnabled()} />;
}

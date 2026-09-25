export interface Citation {
  start: number;
  end: number;
  url: string;
  title: string;
}
export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  citations: Citation[];
  createdAt: number;
}
export interface ChatListItem {
  id: string;
  title: string;
  updatedAt: number;
}

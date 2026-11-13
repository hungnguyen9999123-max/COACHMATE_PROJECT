import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AiBadge } from '../design-system/AiExplain';
import { createBrowserDemoRepository } from '../data/repository';
import { askAssistant, suggestQuestions, type AssistantAction } from '../domain/assistant';
import type { DemoRole } from '../navigation/roleNavigation';

interface ChatMessage {
  id: string;
  from: 'user' | 'ai';
  text: string;
  actions?: AssistantAction[];
  chips?: string[];
}

const WELCOME: Record<DemoRole, string> = {
  student: 'Chào bạn! Tôi có thể tìm lớp hợp trình độ, giải đấu phù hợp và nhắc lịch học của bạn.',
  coach: 'Chào HLV! Tôi có thể dự báo lớp sắp mở, đọc doanh thu và tìm giải đấu.',
  organizer: 'Chào Ban tổ chức! Tôi có thể đọc lịch thi đấu, giải sắp tới và nhà vô địch.',
  admin: 'Chào quản trị viên! Tôi có thể đọc doanh thu nền tảng, giải đấu và gợi ý khóa học.',
};

let messageSequence = 0;

function nextMessageId() {
  messageSequence += 1;
  return `ai-message-${messageSequence}`;
}

function welcomeMessages(role: DemoRole): ChatMessage[] {
  return [{
    id: nextMessageId(),
    from: 'ai',
    text: WELCOME[role],
    chips: suggestQuestions(role),
  }];
}

export function AiAssistant({ role }: { role: DemoRole }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => welcomeMessages(role));
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(welcomeMessages(role));
  }, [role]);

  useEffect(() => {
    if (!open || !bodyRef.current) return;
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, open]);

  const send = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;
    const state = createBrowserDemoRepository().load();
    const answer = askAssistant(trimmed, state, role);
    setMessages((current) => [
      ...current,
      { id: nextMessageId(), from: 'user', text: trimmed },
      {
        id: nextMessageId(),
        from: 'ai',
        text: answer.text,
        actions: answer.actions,
        chips: answer.chips,
      },
    ]);
    setInput('');
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    send(input);
  };

  return <div className="ai-assistant-root">
    {open && <section className="ai-assistant-panel" aria-label="Trợ lý AI CoachMate">
      <header className="ai-assistant-head">
        <div>
          <strong><Sparkles size={15}/> Trợ lý AI CoachMate</strong>
          <small>Phân tích dữ liệu demo · Không gọi mạng</small>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Đóng trợ lý AI"><X size={18}/></button>
      </header>
      <div className="ai-assistant-body" ref={bodyRef}>
        {messages.map((message) => <div key={message.id} className={`ai-assistant-message is-${message.from}`}>
          {message.from === 'ai' && <AiBadge/>}
          <span>{message.text}</span>
          {message.actions && message.actions.length > 0 && <div className="ai-assistant-actions">
            {message.actions.map((action) => <Link key={`${message.id}-${action.to}`} to={action.to} onClick={() => setOpen(false)}>{action.label}</Link>)}
          </div>}
          {message.from === 'ai' && message.chips && message.chips.length > 0 && <div className="ai-assistant-chips">
            {message.chips.map((question) => <button key={`${message.id}-${question}`} onClick={() => send(question)}>{question}</button>)}
          </div>}
        </div>)}
      </div>
      <form className="ai-assistant-form" onSubmit={submit}>
        <input aria-label="Câu hỏi cho trợ lý AI" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Hỏi về khóa học, giải đấu, doanh thu..."/>
        <button type="submit" aria-label="Gửi câu hỏi" disabled={!input.trim()}><Send size={16}/></button>
      </form>
    </section>}
    {!open && <button className="ai-assistant-toggle" onClick={() => setOpen(true)} aria-label="Mở trợ lý AI">
      <MessageCircle size={18}/> Trợ lý AI
    </button>}
  </div>;
}
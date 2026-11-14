import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AiBadge } from '../design-system/AiExplain';
import { createBrowserDemoRepository } from '../data/repository';
import { askAssistant, assistantWelcome, getAssistantPageContext, suggestQuestions, type AssistantAction } from '../domain/assistant';
import { recommendCourses } from '../domain/recommendations';
import type { DemoRole } from '../navigation/roleNavigation';

interface ChatMessage {
  id: string;
  from: 'user' | 'ai';
  text: string;
  actions?: AssistantAction[];
  chips?: string[];
}

let messageSequence = 0;

function nextMessageId() {
  messageSequence += 1;
  return `ai-message-${messageSequence}`;
}

function welcomeMessages(role: DemoRole, pageContext: ReturnType<typeof getAssistantPageContext>): ChatMessage[] {
  return [{
    id: nextMessageId(),
    from: 'ai',
    text: assistantWelcome(role, pageContext),
    chips: suggestQuestions(role, pageContext),
  }];
}

export function AiAssistant({ role }: { role: DemoRole }) {
  const location = useLocation();
  const pageContext = getAssistantPageContext(location.pathname);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [nudge, setNudge] = useState<{ score: number; question: string } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => welcomeMessages(role, pageContext));
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(welcomeMessages(role, pageContext));
    setNudge(null);
  }, [role, location.pathname]);

  useEffect(() => {
    if (role !== 'student' || pageContext.entityType !== 'course' || !pageContext.entityId) return;
    const state = createBrowserDemoRepository().load();
    const recommendation = recommendCourses(state, state.currentStudentId, state.courses.length)
      .find((item) => item.course.id === pageContext.entityId);
    if (!recommendation || recommendation.score < 80) return;
    const timer = window.setTimeout(() => {
      setNudge({ score: Math.round(recommendation.score), question: 'Khóa này có hợp với tôi không?' });
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [role, location.pathname, pageContext.entityId, pageContext.entityType]);

  useEffect(() => {
    if (!open || !bodyRef.current) return;
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, open]);

  const send = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;
    const state = createBrowserDemoRepository().load();
    const answer = askAssistant(trimmed, state, role, new Date(), pageContext);
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
    setNudge(null);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    send(input);
  };

  return <div className="ai-assistant-root">
    {nudge && !open && <button className="ai-assistant-nudge" onClick={() => { setOpen(true); send(nudge.question); }} aria-label="Mở gợi ý từ trợ lý AI">
      💡 Khóa học này đạt {nudge.score}% độ phù hợp với bạn! Nhấn để xem lý do.
    </button>}
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
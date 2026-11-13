import { Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import './ai.css';

export interface AiExplainItem {
  label: string;
  detail?: string;
}

export function AiBadge({ children = 'AI' }: { children?: ReactNode }) {
  return <span className="ai-badge"><Sparkles size={11}/>{children}</span>;
}

export function AiExplain({ title = 'Vì sao AI chọn thế?', items }: { title?: string; items: AiExplainItem[] }) {
  return <details className="ai-explain">
    <summary>{title}</summary>
    <ul>{items.map((item) => <li key={`${item.label}-${item.detail ?? ''}`}><strong>{item.label}</strong>{item.detail && <span>{item.detail}</span>}</li>)}</ul>
  </details>;
}
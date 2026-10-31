import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  Search,
  Star,
  Users,
  X,
} from 'lucide-react';
import {
  createContext,
  cloneElement,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import './showcase.css';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
};

export function Button({ variant = 'primary', size = 'md', icon, children, className = '', ...props }: ButtonProps) {
  return <button className={`cm-button cm-button--${variant} cm-button--${size} ${className}`} {...props}>{icon}{children}</button>;
}

export function IconButton({ label, children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; ref?: Ref<HTMLButtonElement> }) {
  return <button className={`cm-icon-button ${className}`} aria-label={label} title={label} {...props}>{children}</button>;
}

export function FormField({ label, hint, error, required, children }: { label: string; hint?: string; error?: string; required?: boolean; children: ReactNode }) {
  const id = useId();
  const child = children as React.ReactElement<{ id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }>;
  return <div className="cm-field"><label className="cm-label" htmlFor={id}>{label}{required && <span className="cm-required"> *</span>}</label>{cloneElement(child, { id, 'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined, 'aria-invalid': Boolean(error) })}{error ? <span className="cm-field-error" id={`${id}-error`}><AlertCircle size={14}/>{error}</span> : hint ? <span className="cm-field-hint" id={`${id}-hint`}>{hint}</span> : null}</div>;
}

type ControlProps = { leadingIcon?: ReactNode; invalid?: boolean };
export function TextInput({ leadingIcon, invalid, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & ControlProps) {
  return <span className={`cm-control ${leadingIcon ? 'has-leading' : ''}`}>{leadingIcon}<input className={`cm-input ${invalid ? 'is-invalid' : ''} ${className}`} {...props}/></span>;
}
export function SearchInput(props: InputHTMLAttributes<HTMLInputElement>) { return <TextInput type="search" placeholder="Tìm khóa học, HLV, sân..." leadingIcon={<Search size={17}/>} {...props}/>; }
export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className="cm-textarea" {...props}/>; }
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) { return <span className="cm-select-wrap"><select className="cm-select" {...props}/><ChevronDown size={16}/></span>; }
export function Checkbox({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) { return <label className="cm-choice"><input type="checkbox" {...props}/><span className="cm-checkmark"><Check size={13}/></span>{label}</label>; }
export function Radio({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) { return <label className="cm-choice"><input type="radio" {...props}/><span className="cm-radio-dot"/>{label}</label>; }

export function Card({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={`cm-card ${className}`} {...props}>{children}</div>; }
export function Avatar({ name, src, size = 'md' }: { name: string; src?: string; size?: 'sm' | 'md' | 'lg' }) {
  return <span className={`cm-avatar cm-avatar--${size}`}>{src ? <img src={src} alt={name}/> : name.split(' ').slice(-2).map((part) => part[0]).join('')}</span>;
}
export function Badge({ children, tone = 'neutral', dot = false, className = '' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'lime'; dot?: boolean; className?: string }) { return <span className={`cm-badge cm-badge--${tone} ${className}`}>{dot && <i/>}{children}</span>; }
export function StatusIndicator({ label, tone = 'success' }: { label: string; tone?: 'success' | 'warning' | 'danger' }) { return <span className={`cm-status cm-status--${tone}`}><i/>{label}</span>; }
export function Rating({ value, count }: { value: number; count?: number }) { return <span className="cm-rating"><Star size={15} fill="currentColor"/><strong>{value.toFixed(1)}</strong>{count != null && <span>({count})</span>}</span>; }
export function ProgressBar({ value, max, label }: { value: number; max: number; label?: string }) { const pct = Math.min(100, max ? value / max * 100 : 0); return <div className="cm-progress-wrap" aria-label={label ?? `${value} trên ${max}`}><div className="cm-progress"><i style={{ width: `${pct}%` }}/></div><span>{value}/{max}</span></div>; }
export function Divider({ label }: { label?: string }) { return <div className={`cm-divider ${label ? 'has-label' : ''}`}>{label && <span>{label}</span>}</div>; }

export function Tooltip({ text, children }: { text: string; children: ReactNode }) { return <span className="cm-tooltip" tabIndex={0} aria-label={text}>{children}<span role="tooltip">{text}</span></span>; }
export function NavItem({ active, icon, children, onClick }: { active?: boolean; icon?: ReactNode; children: ReactNode; onClick?: () => void }) { return <button className={`cm-nav-item ${active ? 'is-active' : ''}`} onClick={onClick}>{icon}{children}</button>; }
export function Breadcrumb({ items }: { items: string[] }) { return <nav className="cm-breadcrumb" aria-label="Breadcrumb">{items.map((item, index) => <span key={item} aria-current={index === items.length - 1 ? 'page' : undefined}>{index > 0 && <b>/</b>}{item}</span>)}</nav>; }
export function Tabs({ items, active, onChange }: { items: string[]; active: string; onChange: (item: string) => void }) { return <div className="cm-tabs" role="tablist">{items.map((item) => <button key={item} role="tab" aria-selected={item === active} className={item === active ? 'is-active' : ''} onClick={() => onChange(item)}>{item}</button>)}</div>; }

type ToastContextValue = (message: string, tone?: 'success' | 'error' | 'info') => void;
const ToastContext = createContext<ToastContextValue>(() => undefined);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; tone: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const notify: ToastContextValue = (message, tone = 'success') => { setToast({ message, tone }); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(null), 3000); };
  useEffect(() => () => clearTimeout(timer.current), []);
  return <ToastContext.Provider value={notify}>{children}{toast && <div className={`cm-toast cm-toast--${toast.tone}`} role="status" aria-live="polite"><Check size={17}/>{toast.message}<IconButton label="Đóng thông báo" onClick={() => setToast(null)}><X size={16}/></IconButton></div>}</ToastContext.Provider>;
}
export function useToast() { return useContext(ToastContext); }

export function Modal({ title, open, onClose, children, footer, variant = 'modal' }: { title: string; open: boolean; onClose: () => void; children: ReactNode; footer?: ReactNode; variant?: 'modal' | 'drawer' }) {
  const panelRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => Array.from(panelRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select, textarea, [tabindex="0"]') ?? []).filter((element) => element.getClientRects().length > 0);
    (panelRef.current?.querySelector<HTMLElement>('input[type="search"]') ?? focusable()[0] ?? panelRef.current)?.focus();
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
      if (event.key === 'Tab') {
        const elements = focusable();
        const first = elements[0]; const last = elements.at(-1);
        if (!first) { event.preventDefault(); panelRef.current?.focus(); }
        else if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', handle);
    return () => { window.removeEventListener('keydown', handle); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, [open]);
  if (!open) return null;
  return <div className={`cm-scrim ${variant === 'drawer' ? 'cm-scrim--drawer' : ''}`} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section ref={panelRef} tabIndex={-1} className="cm-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}><header><h2 id={titleId}>{title}</h2><IconButton label="Đóng hộp thoại" onClick={onClose}><X size={18}/></IconButton></header><div className="cm-modal-body">{children}</div>{footer && <footer>{footer}</footer>}</section></div>;
}
export function ConfirmDialog({ open, title, description, onCancel, onConfirm }: { open: boolean; title: string; description: string; onCancel: () => void; onConfirm: () => void }) { return <Modal open={open} title={title} onClose={onCancel}><p>{description}</p><div className="cm-modal-actions"><Button variant="outline" onClick={onCancel}>Hủy</Button><Button variant="danger" onClick={onConfirm}>Xác nhận</Button></div></Modal>; }
export function Drawer({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) { return <Modal open={open} title={title} onClose={onClose} variant="drawer">{children}</Modal>; }
export function Skeleton({ width = '100%', height = 16, circle = false }: { width?: string | number; height?: number; circle?: boolean }) { return <span className={`cm-skeleton ${circle ? 'is-circle' : ''}`} style={{ width, height }}/>; }
export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) { return <div className="cm-empty"><span><Search size={21}/></span><h3>{title}</h3><p>{description}</p>{action}</div>; }
export function ErrorState({ title = 'Đã có lỗi xảy ra', description = 'Vui lòng thử lại.' }: { title?: string; description?: string }) { return <div className="cm-error-state"><AlertCircle/><h3>{title}</h3><p>{description}</p></div>; }
export function LoadingIndicator({ label = 'Đang tải' }: { label?: string }) { return <span className="cm-loading" role="status"><i/>{label}</span>; }

export function PriceDisplay({ amount, suffix }: { amount: number; suffix?: string }) { return <span className="cm-price">{new Intl.NumberFormat('vi-VN').format(amount)}<small>đ{suffix ? ` / ${suffix}` : ''}</small></span>; }
export function CapacityIndicator({ enrolled, capacity, minimum }: { enrolled: number; capacity: number; minimum: number }) { const tone = enrolled >= capacity ? 'danger' : enrolled < minimum ? 'warning' : 'success'; const text = enrolled >= capacity ? 'Đã đầy' : enrolled < minimum ? `Cần thêm ${minimum - enrolled} học viên` : 'Đủ điều kiện mở lớp'; return <div className="cm-capacity"><ProgressBar value={enrolled} max={capacity}/><Badge tone={tone} dot>{text}</Badge></div>; }
export function StatisticCard({ label, value, change, icon }: { label: string; value: string; change?: string; icon?: ReactNode }) { return <Card className="cm-stat-card"><span className="cm-stat-icon">{icon}</span><span className="cm-field-hint">{label}</span><strong>{value}</strong>{change && <small>{change}</small>}</Card>; }
export function CourseCard({ title, coach, area, schedule, price, enrolled, capacity, minimum, image }: { title: string; coach: string; area: string; schedule: string; price: number; enrolled: number; capacity: number; minimum: number; image: string }) { return <Card className="cm-business-card"><img className="cm-business-image" src={image} alt="Sân cầu lông"/><div className="cm-business-body"><Badge tone="success">Khóa học</Badge><h3>{title}</h3><p className="cm-business-coach"><Avatar name={coach} size="sm"/>{coach}<Rating value={4.8}/></p><p className="cm-business-meta"><span><MapPin size={15}/>{area}</span><span><CalendarDays size={15}/>{schedule}</span></p><CapacityIndicator enrolled={enrolled} capacity={capacity} minimum={minimum}/><Divider/><div className="cm-business-footer"><PriceDisplay amount={price} suffix="khóa"/><Button variant="outline" size="sm" icon={<ArrowRight size={15}/>}>Chi tiết</Button></div></div></Card>; }
export function CoachCard({ name, specialty, area, rating }: { name: string; specialty: string; area: string; rating: number }) { return <Card className="cm-coach-card"><Avatar name={name} size="lg"/><Badge tone="lime"><BadgeCheck size={13}/> Coach Pro</Badge><h3>{name}</h3><p>{specialty}</p><Rating value={rating} count={20}/><span className="cm-business-meta"><MapPin size={15}/>{area}</span><Button variant="outline" size="sm">Xem hồ sơ</Button></Card>; }
export function TournamentCard({ name, date, venue, format, registrations, capacity, fee, prize }: { name: string; date: string; venue: string; format: string; registrations: number; capacity: number; fee: number; prize: string }) { return <Card className="cm-tournament-card"><div className="cm-tournament-art"><span className="cm-tournament-ball"/><Badge tone="lime">{format}</Badge><strong>CM</strong></div><div className="cm-business-body"><Badge tone="success" dot>Đang mở đăng ký</Badge><h3>{name}</h3><p className="cm-business-meta"><span><CalendarDays size={15}/>{date}</span><span><MapPin size={15}/>{venue}</span></p><p className="cm-prize"><BadgeCheck size={16}/>{prize}</p><ProgressBar value={registrations} max={capacity}/><Divider/><div className="cm-business-footer"><PriceDisplay amount={fee} suffix="người"/><Button size="sm">Xem giải</Button></div></div></Card>; }

export const ComponentIcons = { Users, Clock3 };

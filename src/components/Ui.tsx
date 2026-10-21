import type {ReactNode, ButtonHTMLAttributes, InputHTMLAttributes} from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
export function Brand(){return <span className="brand"><span className="brand-mark"><Sparkles size={21} strokeWidth={2.1}/></span><span>akshath<span className="brand-dot">.fit</span></span></span>}
export function Button({children,className='',variant='primary',...props}:ButtonHTMLAttributes<HTMLButtonElement>&{variant?:'primary'|'secondary'|'ghost'|'danger'}){return <button {...props} className={`button button-${variant} ${className}`}>{children}</button>}
export function Card({children,className='',...props}:{children:ReactNode;className?:string;[key:string]:unknown}){return <section {...props} className={`card ${className}`}>{children}</section>}
export function CardTitle({children,action}:{children:ReactNode;action?:ReactNode}){return <div className="card-title"><h2>{children}</h2>{action}</div>}
export function ArrowButton({label,onClick}:{label:string;onClick:()=>void}){return <button className="icon-button arrow-button" aria-label={label} onClick={onClick}><ArrowUpRight size={20}/></button>}
export function EmptyState({icon,title,description,action}:{icon?:ReactNode;title:string;description?:string;action?:ReactNode}){return <div className="empty-state">{icon&&<span className="empty-icon">{icon}</span>}<h3>{title}</h3>{description&&<p>{description}</p>}{action}</div>}
export function Field({label,error,hint,...props}:InputHTMLAttributes<HTMLInputElement>&{label:string;error?:string;hint?:string}){const id=props.id||props.name||label.toLowerCase().replace(/\W/g,'-');return <label className="field" htmlFor={id}><span>{label}</span><input {...props} id={id} aria-invalid={!!error} aria-describedby={error?`${id}-error`:undefined}/>{error&&<small id={`${id}-error`} className="field-error">{error}</small>}{hint&&<small className="muted">{hint}</small>}</label>}
export function ErrorNotice({message}:{message:string}){return <p className="error-notice" role="alert">{message}</p>}
export function formatNumber(value:number|null|undefined,digits=0){return value==null?'—':value.toLocaleString('en-IN',{maximumFractionDigits:digits})}

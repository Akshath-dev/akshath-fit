import {useEffect,useMemo,useState} from 'react';
import {createClient} from '@supabase/supabase-js';
import {Check} from 'lucide-react';
import {AuthProvider,useAuth} from './auth/AuthProvider';
import {readPublicConfig} from './lib/config';
import type {FitnessRepository} from './lib/repository';
import type {EditorRequest,Route} from './lib/types';
import {localDate} from './lib/dates';
import {AppShell} from './components/AppShell';
import {PageHeader} from './components/PageHeader';
import {Button,Card,EmptyState,ErrorNotice} from './components/Ui';
import {EntrySheet} from './components/EntrySheet';
import {ConfirmDelete} from './components/ConfirmDelete';
import {DashboardProvider,useDashboard} from './data/DashboardProvider';
import {TrainingPage} from './features/training/TrainingPage';
import {TrainingForm} from './features/training/TrainingForm';
import {NutritionPage} from './features/nutrition/NutritionPage';
import {NutritionForm} from './features/nutrition/NutritionForm';
import {ProgressPage} from './features/progress/ProgressPage';
import {OverviewPage} from './features/overview/OverviewPage';
import {CheckinForm} from './features/progress/CheckinForm';
import './styles.css';
const routes:Route[]=['overview','training','nutrition','progress','plan','settings'];
function currentRoute():Route{const value=window.location.hash.replace('#/','');return routes.includes(value as Route)?value as Route:'overview'}
export function DashboardApp({repository,onSignOut,preview=false}:{repository:FitnessRepository;onSignOut:()=>void|Promise<void>;preview?:boolean}){const[route,setRoute]=useState(currentRoute),[date,setDate]=useState(()=>localDate(new Date(),'Asia/Kolkata'));useEffect(()=>{const handler=()=>setRoute(currentRoute());window.addEventListener('hashchange',handler);return()=>window.removeEventListener('hashchange',handler)},[]);function navigate(value:Route){setRoute(value);window.location.hash=`/${value}`;window.scrollTo({top:0,behavior:'instant'})}return <AppShell route={route} onNavigate={navigate} onSignOut={()=>{void onSignOut()}} preview={preview}><DashboardProvider repository={repository} selectedDate={date}><DashboardContent route={route} date={date} onDateChange={setDate} onNavigate={navigate}/></DashboardProvider></AppShell>}
function DashboardContent({route,date,onDateChange,onNavigate}:{route:Route;date:string;onDateChange:(d:string)=>void;onNavigate:(r:Route)=>void}){const{snapshot,loading,error,refresh,mutate}=useDashboard();const[editor,setEditor]=useState<EditorRequest|null>(null),[toast,setToast]=useState('');useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),4000);return()=>clearTimeout(t)},[toast]);const close=()=>setEditor(null);async function saved(action:(r:FitnessRepository)=>Promise<unknown>){await mutate(action);close();setToast('Entry saved. Keep showing up.')}async function deleted(){if(editor?.type!=='delete')return;await mutate(r=>editor.target==='training'?r.deleteTraining(editor.id):editor.target==='nutrition'?r.deleteNutrition(editor.id):r.deleteCheckin(editor.id));close();setToast('Entry deleted.')}
 if(!snapshot)return <div className="loading-page">{error?<><ErrorNotice message={error}/><Button onClick={()=>{void refresh()}}>Try again</Button></>:<><span className="spinner"/><p>Loading your space…</p></>}</div>;
 const title=route==='overview'?<>Hello, <span className="lime-text">{snapshot.profile.displayName.split(' ')[0]}.</span></>:route==='training'?'Your training.':route==='nutrition'?'Fuel your progress.':route==='progress'?'The bigger picture.':route==='plan'?'A plan to come back to.':'Make it yours.';
 const subtitles={overview:'A little progress, every single day.',training:'Every session is a step forward.',nutrition:'Your daily nutrition, with a little more clarity.',progress:'Your numbers. Your pace. Your progress.',plan:'Your training and meals, thoughtfully organized.',settings:'Your goals and your personal preferences.'};
 return <><PageHeader title={title} subtitle={subtitles[route]} date={date} onDateChange={onDateChange} onLog={()=>setEditor({type:'training'})}/>{error&&<div className="refresh-error"><ErrorNotice message={error}/><Button variant="ghost" onClick={()=>{void refresh()}}>Retry</Button></div>}{loading&&<div className="sync-status" role="status">Refreshing records…</div>}{route==='training'?<TrainingPage onEdit={setEditor}/>:route==='nutrition'?<NutritionPage onEdit={setEditor}/>:route==='progress'?<ProgressPage onEdit={setEditor}/>:route==='overview'?<OverviewPage onEdit={setEditor} onNavigate={onNavigate}/>:<Card><EmptyState title={route==='plan'?'Your reference plan':'Your personal settings'} description="This section is being prepared."/></Card>}{editor&&<EntrySheet title={editor.type==='training'?(editor.initial?'Edit your session':'Log a session'):editor.type==='nutrition'?'Daily nutrition':editor.type==='checkin'?'Your daily check-in':'Delete entry'} onClose={close}>{editor.type==='training'?<TrainingForm date={date} muscleGroups={snapshot.muscleGroups} initial={editor.initial} initialKind={editor.kind} onCancel={close} onSave={async i=>{await saved(r=>r.saveTraining(i))}}/>:editor.type==='nutrition'?<NutritionForm date={date} initial={editor.initial||snapshot.nutrition.find(n=>n.date===date)} onCancel={close} onSave={async i=>{await saved(r=>r.saveNutrition(i))}}/>:editor.type==='checkin'?<CheckinForm date={date} initial={editor.initial||snapshot.checkins.find(c=>c.date===date)} onCancel={close} onSave={async i=>{await saved(r=>r.saveCheckin(i))}}/>:<ConfirmDelete label={editor.label} onCancel={close} onDelete={deleted}/>}</EntrySheet>}{toast&&<div className="toast" role="status"><Check size={16}/>{toast}</div>}</>
}
function OwnerApp(){const{repository,signOut}=useAuth();return <DashboardApp repository={repository} onSignOut={signOut}/>}
export default function App(){const client=useMemo(()=>{const config=readPublicConfig(import.meta.env);return config?createClient(config.url,config.publishableKey):null},[]);return <AuthProvider client={client}><OwnerApp/></AuthProvider>}

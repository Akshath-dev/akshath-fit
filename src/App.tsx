import {useMemo} from 'react';
import {createClient} from '@supabase/supabase-js';
import {AuthProvider,useAuth} from './auth/AuthProvider';
import {readPublicConfig} from './lib/config';
import {AppShell} from './components/AppShell';
import {EmptyState} from './components/Ui';
import './styles.css';
function OwnerApp(){const{signOut}=useAuth();return <AppShell route="overview" onNavigate={()=>{}} onSignOut={()=>{void signOut()}}><EmptyState title="Your private space is ready." description="Your training, nutrition, and progress will live here."/></AppShell>}
export default function App(){const client=useMemo(()=>{const config=readPublicConfig(import.meta.env);return config?createClient(config.url,config.publishableKey):null},[]);return <AuthProvider client={client}><OwnerApp/></AuthProvider>}

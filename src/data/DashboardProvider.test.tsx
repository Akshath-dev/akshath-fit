import {it,expect} from 'vitest';
import {render,screen,act} from '@testing-library/react';
import {DashboardProvider,useDashboard} from './DashboardProvider';
import type {FitnessRepository} from '../lib/repository';
import type {DashboardSnapshot} from '../lib/types';
import {emptySnapshot} from '../test/fixtures';
function Probe(){const{snapshot,loading}=useDashboard();return <p>{loading?'Loading':snapshot?.profile.displayName}</p>}
it('ignores a late response from the previous selected date',async()=>{const pending:Array<(s:DashboardSnapshot)=>void>=[];const repository={getSnapshot:()=>new Promise<DashboardSnapshot>(r=>pending.push(r))} as unknown as FitnessRepository;const{rerender}=render(<DashboardProvider repository={repository} selectedDate="2026-10-20"><Probe/></DashboardProvider>);rerender(<DashboardProvider repository={repository} selectedDate="2026-10-21"><Probe/></DashboardProvider>);await act(async()=>{const s=emptySnapshot();s.profile.displayName='Current date';pending[1](s)});await screen.findByText('Current date');await act(async()=>{const s=emptySnapshot();s.profile.displayName='Old date';pending[0](s)});expect(screen.queryByText('Old date')).not.toBeInTheDocument();expect(screen.getByText('Current date')).toBeInTheDocument()});

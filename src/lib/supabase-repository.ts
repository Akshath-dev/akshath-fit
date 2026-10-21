import type {SupabaseClient} from '@supabase/supabase-js';
import type {FitnessRepository} from './repository';
import type {Profile,Goals,MuscleGroup,TrainingSession,NutritionInput,CheckinInput} from './types';
type Row=Record<string,any>;
export function databaseError(error:unknown):Error {const e=error as {message?:string;code?:string};if(e?.code==='42501')return new Error('This account does not have access to these records.');if(e?.code==='23505')return new Error('That entry already exists. Please edit the existing entry.');if(e?.code==='23514'||e?.code==='23503')return new Error('Please check your entries and try again.');return new Error(e?.message||'Could not connect. Please try again.');}
async function result<T>(request:PromiseLike<{data:T;error:unknown}>):Promise<T>{const r=await request;if(r.error)throw databaseError(r.error);return r.data;}
const n=(v:unknown):number|null=>v==null?null:Number(v);
export const mapProfile=(r:Row):Profile=>({userId:r.user_id,displayName:r.display_name,timeZone:r.time_zone});
export const mapGoals=(r:Row):Goals=>({calories:n(r.calories),protein:n(r.protein),carbs:n(r.carbs),fat:n(r.fat),steps:n(r.steps),weeklyTraining:n(r.weekly_training)});
const muscle=(r:Row):MuscleGroup=>({id:r.id,name:r.name,isCustom:r.is_custom});
const training=(r:Row):TrainingSession=>({id:r.id,date:r.date,kind:r.kind,activityType:r.activity_type,durationMinutes:n(r.duration_minutes),distanceKm:n(r.distance_km),notes:r.notes||'',createdAt:r.created_at,muscleGroupIds:(r.session_muscle_groups||[]).map((g:Row)=>g.muscle_group_id)});
const nutrition=(r:Row):NutritionInput=>({date:r.date,calories:n(r.calories),protein:n(r.protein),carbs:n(r.carbs),fat:n(r.fat),notes:r.notes||''});
const checkin=(r:Row):CheckinInput=>({date:r.date,steps:n(r.steps),weightKg:n(r.weight_kg),waistCm:n(r.waist_cm),restDay:r.rest_day,notes:r.notes||''});
export function createFitnessRepository(client:SupabaseClient,ownerId:string):FitnessRepository {
 return {
 async getSnapshot(range,signal){const sig=signal||new AbortController().signal;const[pr,go,mu,tr,nu,ch,latest]=await Promise.all([
 result(client.from('profiles').select('*').eq('user_id',ownerId).abortSignal(sig).single()),
 result(client.from('goals').select('*').eq('user_id',ownerId).abortSignal(sig).single()),
 result(client.from('muscle_groups').select('*').eq('user_id',ownerId).order('is_custom').order('name').abortSignal(sig)),
 result(client.from('training_sessions').select('*,session_muscle_groups(muscle_group_id)').eq('user_id',ownerId).gte('date',range.start).lte('date',range.end).order('date',{ascending:false}).order('created_at',{ascending:false}).abortSignal(sig)),
 result(client.from('nutrition_days').select('*').eq('user_id',ownerId).gte('date',range.start).lte('date',range.end).order('date',{ascending:false}).abortSignal(sig)),
 result(client.from('daily_checkins').select('*').eq('user_id',ownerId).gte('date',range.start).lte('date',range.end).order('date',{ascending:false}).abortSignal(sig)),
 result(client.from('daily_checkins').select('*').eq('user_id',ownerId).not('weight_kg','is',null).lte('date',range.end).order('date',{ascending:false}).limit(1).abortSignal(sig))]);
 return {profile:mapProfile(pr!),goals:mapGoals(go!),muscleGroups:(mu||[]).map(muscle),training:(tr||[]).map(training),nutrition:(nu||[]).map(nutrition),checkins:(ch||[]).map(checkin),latestWeight:latest?.[0]?checkin(latest[0]):null};},
 async saveTraining(input){const id=await result(client.rpc('save_training_session',{p_id:input.id||null,p_date:input.date,p_kind:input.kind,p_activity_type:input.activityType,p_duration_minutes:input.durationMinutes,p_distance_km:input.distanceKm,p_notes:input.notes,p_muscle_group_ids:input.muscleGroupIds}));const saved=await result(client.from('training_sessions').select('*,session_muscle_groups(muscle_group_id)').eq('user_id',ownerId).eq('id',id).single());if(!saved)throw new Error('Could not reload this session. Please refresh.');return training(saved);},
 async deleteTraining(id){await result(client.from('training_sessions').delete().eq('user_id',ownerId).eq('id',id));},
 async saveNutrition(i){const rows=await result(client.from('nutrition_days').upsert({user_id:ownerId,date:i.date,calories:i.calories,protein:i.protein,carbs:i.carbs,fat:i.fat,notes:i.notes},{onConflict:'user_id,date'}).select());return nutrition(rows![0]);},
 async deleteNutrition(date){await result(client.from('nutrition_days').delete().eq('user_id',ownerId).eq('date',date));},
 async saveCheckin(i){const rows=await result(client.from('daily_checkins').upsert({user_id:ownerId,date:i.date,steps:i.steps,weight_kg:i.weightKg,waist_cm:i.waistCm,rest_day:i.restDay,notes:i.notes},{onConflict:'user_id,date'}).select());return checkin(rows![0]);},
 async deleteCheckin(date){await result(client.from('daily_checkins').delete().eq('user_id',ownerId).eq('date',date));},
 async saveSettings(profile,goals){await result(client.rpc('save_settings',{p_display_name:profile.displayName,p_time_zone:profile.timeZone,p_goals:goals}));const[p,g]=await Promise.all([result(client.from('profiles').select('*').eq('user_id',ownerId).single()),result(client.from('goals').select('*').eq('user_id',ownerId).single())]);return{profile:mapProfile(p),goals:mapGoals(g)};},
 async addMuscleGroup(name){const rows=await result(client.from('muscle_groups').insert({user_id:ownerId,name:name.trim(),is_custom:true}).select());return muscle(rows![0]);}
 };
}

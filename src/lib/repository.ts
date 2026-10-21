import type {DashboardSnapshot,DateRange,TrainingInput,TrainingSession,NutritionInput,CheckinInput,Profile,Goals,MuscleGroup,LocalDate} from './types';
export interface FitnessRepository {
 getSnapshot(range:DateRange,signal?:AbortSignal):Promise<DashboardSnapshot>;
 saveTraining(input:TrainingInput):Promise<TrainingSession>;deleteTraining(id:string):Promise<void>;
 saveNutrition(input:NutritionInput):Promise<NutritionInput>;deleteNutrition(date:LocalDate):Promise<void>;
 saveCheckin(input:CheckinInput):Promise<CheckinInput>;deleteCheckin(date:LocalDate):Promise<void>;
 saveSettings(profile:Pick<Profile,'displayName'|'timeZone'>,goals:Goals):Promise<{profile:Profile;goals:Goals}>;
 addMuscleGroup(name:string):Promise<MuscleGroup>;
}

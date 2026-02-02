
export type UserRole = 'profissional' | 'aluno';

export type MealType = 'Pré-treino' | 'Pós-treino' | 'Café da Manhã' | 'Almoço' | 'Lanche' | 'Jantar' | 'Ceia';

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  initial_weight?: number;
  goal?: string;
  created_at?: string;
}

// Aliases for compatibility
export type User = UserProfile;

export interface AlunoAssociation {
  id: string;
  aluno_id: string;
  profissional_id: string;
  created_at: string;
}

export interface WeightEntry {
  id: string;
  user_id: string;
  created_at: string; // ISO date string
  peso: number;
}

export interface Exercise {
  id: string;
  profissional_id: string;
  nome: string;
  grupo: string;
  created_at: string;
}

export interface LoadEntry {
  id: string;
  user_id: string;
  exercicio_id: string;
  created_at: string; // ISO date string
  carga: number;
  repeticoes?: number;
  exerciseName?: string; // Optional for UI display
}

export interface WorkoutPlan {
  id: string;
  profissional_id: string;
  aluno_id: string;
  titulo: string;
  descricao: string;
  created_at: string;
}

export type DayWorkout = WorkoutPlan;

export interface UserWorkoutPlan {
  workouts: WorkoutPlan[];
}

export interface Meal {
  id: string;
  aluno_id: string;
  titulo: string;
  descricao: string;
  calorias: number;
  created_at: string;
}

export interface DietPlan {
  alunoId: string;
  meals: Meal[];
}

export type TabType = 'dashboard' | 'training' | 'diet' | 'evolution' | 'users' | 'print';

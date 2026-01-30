
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
  user_id: string;
  profissional_id: string;
  created_at: string;
}

export interface WeightEntry {
  id: string;
  aluno_id: string;
  date: string; // ISO date string
  peso: number;
}

export interface Exercise {
  id: string;
  plano_treino_id: string;
  nome: string;
  series: number;
  repeticoes: number | string;
  observacoes?: string;
}

export interface LoadEntry {
  id: string;
  aluno_id: string;
  exercicio_id: string;
  date: string; // ISO date string
  carga: number;
  exerciseName?: string; // Optional for UI display
}

export interface WorkoutPlan {
  id: string;
  aluno_id: string;
  tipo_treino: string;
  dia_semana: string;
  exercises?: Exercise[];
}

export type DayWorkout = WorkoutPlan;

export interface UserWorkoutPlan {
  workouts: WorkoutPlan[];
}

export interface Meal {
  id: string;
  aluno_id: string;
  tipo_refeicao: MealType;
  dia_semana: string;
  horario: string;
  descricao: string;
}

export interface DietPlan {
  userId: string;
  meals: Meal[];
}

export type TabType = 'dashboard' | 'training' | 'diet' | 'evolution' | 'users' | 'print';


export type UserRole = 'profissional' | 'aluno';

export type MealType = 'Pré-treino' | 'Pós-treino' | 'Café da Manhã' | 'Almoço' | 'Lanche' | 'Jantar' | 'Ceia';

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  goal?: string;
  target_weight?: number;
  status?: 'Ativo' | 'Inativo' | 'Férias';
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
  plano_treino_id: string;
  nome: string;
  series: number;
  repeticoes: string;
  created_at: string;
}

export interface LoadEntry {
  id: string;
  user_id: string;
  exercicio_id: string;
  created_at: string; // ISO date string
  carga: number;
  exerciseName?: string; // Optional for UI display
}

export interface WorkoutPlan {
  id: string;
  profissional_id: string;
  aluno_id: string;
  dia_semana: string;
  tipo_treino: string;
  created_at: string;
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
  created_at: string;
}

export interface DietPlan {
  alunoId: string;
  meals: Meal[];
}

export interface Aviso {
  id: string;
  profissional_id: string;
  aluno_id: string;
  autor_id: string;
  mensagem: string;
  criticidade: 'Normal' | 'Importante' | 'Urgente';
  lido: boolean;
  created_at: string;
}

export type TabType = 'dashboard' | 'training' | 'diet' | 'evolution' | 'users' | 'print';

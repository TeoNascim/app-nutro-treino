
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile, WeightEntry, Meal, WorkoutPlan, LoadEntry, Exercise } from '../types';
import PrintReport from './PrintReport';
import { Loader2 } from 'lucide-react';

interface Props {
    user: UserProfile;
    weights: WeightEntry[];
}

const ReportView: React.FC<Props> = ({ user, weights }) => {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
    const [loads, setLoads] = useState<LoadEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // Fetch Meals
                const { data: mealsData } = await supabase
                    .from('meals')
                    .select('*')
                    .eq('aluno_id', user.id)
                    .order('horario', { ascending: true });

                // Fetch Workout Plans with Exercises
                const { data: plansData } = await supabase
                    .from('planos_treino')
                    .select(`
            *,
            exercises:exercicios (*)
          `)
                    .eq('aluno_id', user.id)
                    .order('dia_semana', { ascending: true });

                // Fetch Loads
                const { data: loadsData } = await supabase
                    .from('registros_carga')
                    .select(`
            *,
            exercicio:exercicios (nome)
          `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: true });

                if (mealsData) setMeals(mealsData);
                if (plansData) setWorkoutPlans(plansData);

                if (loadsData) {
                    const formattedLoads: LoadEntry[] = loadsData.map((l: any) => ({
                        id: l.id,
                        user_id: l.user_id,
                        exercicio_id: l.exercicio_id,
                        carga: l.carga,
                        created_at: l.created_at,
                        exerciseName: l.exercicio?.nome || 'Exercício'
                    }));
                    setLoads(formattedLoads);
                }

            } catch (err) {
                console.error("Erro ao gerar relatório:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [user.id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="animate-spin text-emerald-500" size={48} />
                <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Gerando informações do relatório...</p>
            </div>
        );
    }

    return (
        <PrintReport
            user={user}
            weights={weights}
            meals={meals}
            workoutPlans={workoutPlans}
            loads={loads}
        />
    );
};

export default ReportView;

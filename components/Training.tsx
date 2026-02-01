
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { WorkoutPlan, Exercise, UserProfile } from '../types';
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Props {
  userProfile: UserProfile;
  alunoId: string | null;
  isPro: boolean;
  isWorkoutActive: boolean;
  setIsWorkoutActive: (active: boolean) => void;
}

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

const Training: React.FC<Props> = ({ alunoId, isPro, isWorkoutActive, setIsWorkoutActive }) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (alunoId) fetchTrainingData();
  }, [alunoId]);

  const fetchTrainingData = async () => {
    setLoading(true);
    try {
      const { data: plansData, error: plansError } = await supabase
        .from('planos_treino')
        .select('*')
        .eq('aluno_id', alunoId);

      if (plansError) throw plansError;

      if (plansData) {
        setPlans(plansData);
        const planIds = plansData.map(p => p.id);
        if (planIds.length > 0) {
          const { data: exData, error: exError } = await supabase
            .from('exercicios')
            .select('*')
            .in('plano_treino_id', planIds);

          if (exError) throw exError;
          if (exData) setExercises(exData);
        } else {
          setExercises([]);
        }
      }
    } catch (err: any) {
      console.error("Erro ao carregar treinos:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = async (planId: string) => {
    if (!isPro) return;
    try {
      const { data, error } = await supabase.from('exercicios').insert([{
        plano_treino_id: planId,
        nome: 'Novo Exercício',
        series: 3,
        repeticoes: 12
      }]).select();

      if (error) throw error;
      if (data) setExercises([...exercises, data[0]]);
    } catch (err: any) {
      alert("Erro ao adicionar exercício: " + err.message);
    }
  };

  const handleUpdateExercise = async (id: string, updates: Partial<Exercise>) => {
    if (!isPro) return;
    try {
      const { error } = await supabase.from('exercicios').update(updates).eq('id', id);
      if (error) throw error;
      setExercises(exercises.map(ex => ex.id === id ? { ...ex, ...updates } : ex));
    } catch (err: any) {
      console.error("Erro ao atualizar exercício:", err.message);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    if (!isPro) return;
    if (!confirm('Excluir este exercício?')) return;
    try {
      const { error } = await supabase.from('exercicios').delete().eq('id', id);
      if (error) throw error;
      setExercises(exercises.filter(e => e.id !== id));
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  const handleRegisterLoad = async (exerciseId: string, carga: string) => {
    if (isPro || !carga) return;
    try {
      const { error } = await supabase.from('registros_carga').insert([{
        aluno_id: alunoId,
        exercicio_id: exerciseId,
        carga: parseFloat(carga)
      }]);
      if (error) throw error;
      alert("Carga registrada com sucesso!");
    } catch (err: any) {
      alert("Erro ao registrar carga: " + err.message);
    }
  };

  const currentDay = DAYS[selectedDayIdx];
  const currentPlan = plans.find(p => p.dia_semana === currentDay);
  const currentExercises = exercises.filter(ex => ex.plano_treino_id === currentPlan?.id);

  if (!alunoId) return <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest">Nenhum aluno selecionado</div>;
  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-20">
      {/* Seletor de Dia */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <button onClick={() => setSelectedDayIdx(prev => (prev > 0 ? prev - 1 : 6))} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
          <ChevronLeft size={28} />
        </button>
        <div className="text-center flex-1 mx-4">
          <h2 className="text-xl font-black text-slate-900">{currentDay}</h2>
          <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">
            {currentPlan?.tipo_treino || 'Sem treino'}
          </p>
        </div>
        <button onClick={() => setSelectedDayIdx(prev => (prev < 6 ? prev + 1 : 0))} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
          <ChevronRight size={28} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {currentExercises.length === 0 ? (
          <div className="bg-white p-12 rounded-[2rem] text-center border-2 border-dashed border-slate-100">
            <AlertCircle className="mx-auto mb-2 text-slate-300" size={32} />
            <p className="text-slate-400 font-medium text-sm">Nenhum exercício para hoje.</p>
          </div>
        ) : (
          currentExercises.map((ex) => (
            <div key={ex.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {isPro ? (
                    <input
                      className="w-full font-black text-slate-800 border-none focus:ring-0 text-lg p-0 bg-transparent"
                      value={ex.nome}
                      onBlur={e => handleUpdateExercise(ex.id, { nome: e.target.value })}
                      onChange={e => setExercises(exercises.map(item => item.id === ex.id ? { ...item, nome: e.target.value } : item))}
                    />
                  ) : (
                    <h4 className="text-lg font-black text-slate-800">{ex.nome}</h4>
                  )}
                  <div className="flex gap-4 mt-1">
                    {isPro ? (
                      <div className="flex gap-2 items-center">
                        <input type="number" className="w-12 text-xs font-black text-emerald-600 bg-slate-50 rounded p-1" value={ex.series} onChange={e => handleUpdateExercise(ex.id, { series: parseInt(e.target.value) })} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">séries</span>
                        <input type="text" className="w-16 text-xs font-black text-slate-600 bg-slate-50 rounded p-1" value={ex.repeticoes} onChange={e => handleUpdateExercise(ex.id, { repeticoes: e.target.value })} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">reps</span>
                      </div>
                    ) : (
                      <>
                        <span className="text-xs font-black text-emerald-600 uppercase">{ex.series} séries</span>
                        <span className="text-xs font-black text-slate-400 uppercase">{ex.repeticoes} reps</span>
                      </>
                    )}
                  </div>
                </div>
                {isPro && (
                  <button onClick={() => handleDeleteExercise(ex.id)} className="text-red-300 hover:text-red-500 p-2 transition-colors"><Trash2 size={20} /></button>
                )}
              </div>

              {!isPro && (
                <div className="pt-4 border-t border-slate-50 flex gap-2">
                  <input
                    type="number" placeholder="Carga (kg)"
                    className="flex-1 py-3 bg-slate-50 rounded-2xl text-sm font-black px-4 outline-none focus:ring-2 focus:ring-emerald-500"
                    id={`carga-${ex.id}`}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById(`carga-${ex.id}`) as HTMLInputElement;
                      handleRegisterLoad(ex.id, input.value);
                      input.value = '';
                    }}
                    className="bg-slate-900 text-white px-4 rounded-2xl font-black text-xs uppercase"
                  >
                    OK
                  </button>
                </div>
              )}
            </div>
          ))
        )}

        {isPro && currentPlan && (
          <button onClick={() => handleAddExercise(currentPlan.id)} className="w-full py-6 border-2 border-dashed border-emerald-200 rounded-[2.5rem] text-emerald-600 font-black flex items-center justify-center gap-3 hover:bg-emerald-50 transition-all active:scale-95">
            <Plus size={20} /> ADICIONAR EXERCÍCIO
          </button>
        )}
      </div>
    </div>
  );
};

export default Training;


import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Meal, MealType } from '../types';
import { Clock, Plus, Trash2, Calendar, Loader2 } from 'lucide-react';

interface Props {
  userId: string;
  isPro: boolean;
}

const MEAL_TYPES: MealType[] = ['Pré-treino', 'Pós-treino', 'Café da Manhã', 'Almoço', 'Lanche', 'Jantar', 'Ceia'];
const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

const Diet: React.FC<Props> = ({ userId, isPro }) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) fetchMeals();
  }, [userId]);

  const fetchMeals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('aluno_id', userId)
      .order('horario', { ascending: true });

    if (data) setMeals(data);
    else if (error) console.error("Erro ao buscar refeições:", error);
    setLoading(false);
  };

  const addMeal = async () => {
    if (!isPro) return;
    const newMeal = {
      aluno_id: userId,
      tipo_refeicao: 'Café da Manhã',
      dia_semana: 'Segunda',
      horario: '08:00',
      descricao: ''
    };

    const { data, error } = await supabase
      .from('meals')
      .insert([newMeal])
      .select();

    if (data) setMeals([...meals, data[0]]);
    else if (error) alert("Erro ao adicionar refeição: " + error.message);
  };

  const updateMeal = async (id: string, updates: Partial<Meal>) => {
    if (!isPro) return;
    const { error } = await supabase
      .from('meals')
      .update(updates)
      .eq('id', id);

    if (error) alert("Erro ao atualizar: " + error.message);
    else setMeals(meals.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const removeMeal = async (id: string) => {
    if (!isPro) return;
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', id);

    if (error) alert("Erro ao remover: " + error.message);
    else setMeals(meals.filter(m => m.id !== id));
  };

  const groupedByDay = DAYS.map(day => ({
    day,
    meals: meals.filter(m => m.dia_semana === day).sort((a, b) => a.horario.localeCompare(b.horario))
  }));

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="space-y-8 animate-in slide-in-from-left duration-300">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-3xl font-black text-slate-900">Plano Alimentar</h2>
        {isPro && (
          <button onClick={addMeal} className="bg-emerald-600 text-white p-2 rounded-xl shadow-lg active:scale-95"><Plus size={24} /></button>
        )}
      </div>

      <div className="space-y-10">
        {groupedByDay.map((group) => group.meals.length > 0 && (
          <div key={group.day} className="space-y-4">
            <h3 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
              <Calendar size={14} /> {group.day}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.meals.map((meal) => (
                <div key={meal.id} className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm relative group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Clock size={16} /></div>
                      {isPro ? (
                        <input type="time" className="font-bold text-slate-800" value={meal.horario} onChange={e => updateMeal(meal.id, { horario: e.target.value })} />
                      ) : (
                        <span className="font-bold text-slate-800">{meal.horario}</span>
                      )}
                    </div>
                    {isPro && (
                      <button onClick={() => removeMeal(meal.id)} className="text-red-300 hover:text-red-500"><Trash2 size={16} /></button>
                    )}
                  </div>

                  <div className="mb-4">
                    {isPro ? (
                      <select className="w-full p-2 bg-slate-50 rounded-xl font-bold text-emerald-600 text-sm" value={meal.tipo_refeicao} onChange={e => updateMeal(meal.id, { tipo_refeicao: e.target.value as MealType })}>
                        {MEAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    ) : (
                      <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider bg-emerald-50 px-2 py-1 rounded-md">{meal.tipo_refeicao}</span>
                    )}
                  </div>

                  {isPro ? (
                    <textarea
                      className="w-full min-h-[100px] p-4 bg-slate-50 rounded-2xl text-sm text-slate-600 border-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Descreva a refeição..."
                      value={meal.descricao}
                      onBlur={e => updateMeal(meal.id, { descricao: e.target.value })}
                      onChange={e => setMeals(meals.map(m => m.id === meal.id ? { ...m, descricao: e.target.value } : m))}
                    />
                  ) : (
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{meal.descricao}</p>
                  )}

                  {isPro && (
                    <div className="mt-4">
                      <select className="w-full text-xs font-bold text-slate-400 bg-transparent" value={meal.dia_semana} onChange={e => updateMeal(meal.id, { dia_semana: e.target.value })}>
                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {!loading && meals.length === 0 && (
          <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-100">
            <p className="text-slate-400">Nenhuma refeição cadastrada para este aluno.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Diet;


import React from 'react';
// Corrected types from types.ts
import { DietPlan, Meal, MealType } from '../types';
import { Clock, Plus, Trash2, Calendar } from 'lucide-react';

interface Props {
  userId: string;
  dietPlan: DietPlan;
  setAllDiets: React.Dispatch<React.SetStateAction<DietPlan[]>>;
  isPro: boolean;
}

// Fixed MEAL_TYPES to match MealType definition in types.ts
const MEAL_TYPES: MealType[] = ['Pré-treino', 'Pós-treino', 'Café da Manhã', 'Almoço', 'Lanche', 'Jantar', 'Ceia'];
const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

const Diet: React.FC<Props> = ({ userId, dietPlan, setAllDiets, isPro }) => {
  const updateDiet = (newMeals: Meal[]) => {
    setAllDiets(prev => {
      const filtered = prev.filter(d => d.userId !== userId);
      return [...filtered, { userId, meals: newMeals }];
    });
  };

  const addMeal = () => {
    // Fixed: Using correct property names from types.ts (Portuguese)
    const newMeal: Meal = { 
      id: Date.now().toString(), 
      aluno_id: userId,
      tipo_refeicao: 'Café da Manhã', 
      dia_semana: 'Segunda', 
      horario: '12:00', 
      descricao: '' 
    };
    updateDiet([...dietPlan.meals, newMeal]);
  };

  const removeMeal = (id: string) => {
    updateDiet(dietPlan.meals.filter(m => m.id !== id));
  };

  const groupedByDay = DAYS.map(day => ({
    day,
    // Fixed: Using dia_semana and horario instead of day and time
    meals: dietPlan.meals.filter(m => m.dia_semana === day).sort((a, b) => a.horario.localeCompare(b.horario))
  }));

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
                        <input type="time" className="font-bold text-slate-800" value={meal.horario} onChange={e => {
                          const updated = dietPlan.meals.map(m => m.id === meal.id ? {...m, horario: e.target.value} : m);
                          updateDiet(updated);
                        }} />
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
                      <select className="w-full p-2 bg-slate-50 rounded-xl font-bold text-emerald-600 text-sm" value={meal.tipo_refeicao} onChange={e => {
                        const updated = dietPlan.meals.map(m => m.id === meal.id ? {...m, tipo_refeicao: e.target.value as MealType} : m);
                        updateDiet(updated);
                      }}>
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
                      onChange={e => {
                        const updated = dietPlan.meals.map(m => m.id === meal.id ? {...m, descricao: e.target.value} : m);
                        updateDiet(updated);
                      }}
                    />
                  ) : (
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{meal.descricao}</p>
                  )}

                  {isPro && (
                    <div className="mt-4">
                      <select className="w-full text-xs font-bold text-slate-400 bg-transparent" value={meal.dia_semana} onChange={e => {
                         const updated = dietPlan.meals.map(m => m.id === meal.id ? {...m, dia_semana: e.target.value} : m);
                         updateDiet(updated);
                      }}>
                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {dietPlan.meals.length === 0 && (
          <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-100">
            <p className="text-slate-400">Nenhuma refeição cadastrada para este plano.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Diet;

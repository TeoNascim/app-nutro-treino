
import React from 'react';
// Corrected imports from types.ts
import { User, WeightEntry, LoadEntry, UserWorkoutPlan, DietPlan } from '../types';

interface Props {
  user: User;
  weights: WeightEntry[];
  loads: LoadEntry[];
  workoutPlan: UserWorkoutPlan;
  dietPlan: DietPlan;
}

const PrintReport: React.FC<Props> = ({ user, weights, loads, workoutPlan, dietPlan }) => {
  const handlePrint = () => window.print();

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center border-b pb-6">
        <div>
          {/* Fixed: name -> nome */}
          <h2 className="text-2xl font-black text-slate-900">Relatório de Desempenho</h2>
          <p className="text-slate-500">Aluno: {user.nome} | Meta: {user.goal || 'Não definida'}</p>
        </div>
        <button onClick={handlePrint} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold">Imprimir PDF</button>
      </div>

      <div className="grid grid-cols-2 gap-8 print:block">
        <section>
          <h3 className="font-black text-emerald-600 uppercase text-xs mb-4">Plano Alimentar</h3>
          <div className="space-y-2">
            {dietPlan.meals.map(m => (
              <div key={m.id} className="text-sm border-b pb-2">
                {/* Fixed: day -> dia_semana, time -> horario, type -> tipo_refeicao, description -> descricao */}
                <span className="font-bold">{m.dia_semana} {m.horario} - {m.tipo_refeicao}:</span> {m.descricao}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="font-black text-blue-600 uppercase text-xs mb-4">Plano de Treino</h3>
          <div className="space-y-4">
            {workoutPlan.workouts.map(w => (
              <div key={w.id}>
                {/* Fixed: day -> dia_semana, title -> tipo_treino */}
                <h4 className="font-bold text-sm underline">{w.dia_semana} ({w.tipo_treino})</h4>
                <ul className="text-xs list-disc pl-4">
                  {w.exercises?.map(e => (
                    // Fixed: name -> nome, sets -> series, reps -> repeticoes
                    <li key={e.id}>{e.nome} - {e.series}x{e.repeticoes}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
      
      <p className="text-[10px] text-slate-300 text-center italic">Gerado via FitTrack Pro - Sistema Profissional de Acompanhamento</p>
    </div>
  );
};

export default PrintReport;

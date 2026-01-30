
import React from 'react';
import { User, WeightEntry, LoadEntry, WorkoutPlan, Meal } from '../types';

interface Props {
  user: User;
  weights: WeightEntry[];
  loads: LoadEntry[];
  workoutPlans: WorkoutPlan[];
  meals: Meal[];
}

const PrintReport: React.FC<Props> = ({ user, weights, workoutPlans, meals }) => {
  const handlePrint = () => window.print();

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center border-b pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Relatório de Desempenho</h2>
          <p className="text-slate-500">Aluno: {user.nome} | Meta: {user.goal || 'Não definida'}</p>
        </div>
        <button onClick={handlePrint} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold">Imprimir PDF</button>
      </div>

      <div className="grid grid-cols-2 gap-8 print:block">
        <section>
          <h3 className="font-black text-emerald-600 uppercase text-xs mb-4">Plano Alimentar</h3>
          <div className="space-y-2">
            {meals.map(m => (
              <div key={m.id} className="text-sm border-b pb-2">
                <span className="font-bold">{m.dia_semana} {m.horario} - {m.tipo_refeicao}:</span> {m.descricao}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="font-black text-blue-600 uppercase text-xs mb-4">Plano de Treino</h3>
          <div className="space-y-4">
            {workoutPlans.map(w => (
              <div key={w.id}>
                <h4 className="font-bold text-sm underline">{w.dia_semana} ({w.tipo_treino})</h4>
                <ul className="text-xs list-disc pl-4">
                  {w.exercises?.map(e => (
                    <li key={e.id}>{e.nome} - {e.series}x{e.repeticoes}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-black text-slate-400 uppercase text-[10px] mb-4">Resumo de Evolução</h3>
        <p className="text-xs">Peso inicial: {user.initial_weight} kg | Peso atual: {weights[weights.length - 1]?.peso || '---'} kg</p>
      </div>

      <p className="text-[10px] text-slate-300 text-center italic">Gerado via FitTrack Pro - Sistema Profissional de Acompanhamento</p>
    </div>
  );
};

export default PrintReport;

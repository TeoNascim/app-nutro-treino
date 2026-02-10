import React from 'react';
import { User, WeightEntry, LoadEntry, WorkoutPlan, Meal } from '../types';
import { Scale, Dumbbell, Utensils, TrendingUp, Calendar, Clock } from 'lucide-react';

interface Props {
  user: User;
  weights: WeightEntry[];
  loads: LoadEntry[];
  workoutPlans: WorkoutPlan[];
  meals: Meal[];
}

const PrintReport: React.FC<Props> = ({ user, weights, workoutPlans, meals, loads }) => {
  const handlePrint = () => window.print();

  const currentWeight = weights.length > 0 ? weights[weights.length - 1].peso : 0;
  const initialWeight = weights.length > 0 ? weights[0].peso : 0;
  const weightChange = currentWeight - initialWeight;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Print Controls - Hidden on print */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 print:hidden">
        <div>
          <h2 className="text-xl font-black text-slate-800">Visualização do Relatório</h2>
          <p className="text-sm text-slate-400 font-medium">Este é o layout final que será gerado no PDF.</p>
        </div>
        <button
          onClick={handlePrint}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-3"
        >
          <TrendingUp size={18} className="text-emerald-400" /> Gerar PDF Final
        </button>
      </div>

      <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 space-y-12 print:shadow-none print:border-none print:p-0">
        {/* Header - Letterhead style */}
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-emerald-500 mb-4">
              <TrendingUp size={40} />
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">FitTrack Pro</h1>
            </div>
            <h2 className="text-4xl font-black text-slate-900">{user.nome}</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
              <Calendar size={14} /> Relatório Gerado em: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Objetivo Principal</p>
            <p className="text-xl font-black text-emerald-600 uppercase italic">{user.goal || 'Performance Geral'}</p>
          </div>
        </div>

        {/* Stats Summary Area */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peso Inicial</p>
            <p className="text-2xl font-black text-slate-800">{initialWeight} <span className="text-sm font-bold text-slate-400">kg</span></p>
          </div>
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peso Atual</p>
            <p className="text-2xl font-black text-slate-800">{currentWeight} <span className="text-sm font-bold text-slate-400">kg</span></p>
          </div>
          <div className="bg-slate-900 p-6 rounded-[2rem] text-white">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Variação Total</p>
            <p className="text-2xl font-black">{weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} <span className="text-sm font-bold text-slate-400">kg</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 print:block print:space-y-12">
          {/* Diet Section */}
          <section className="space-y-6">
            <h3 className="text-xl font-black text-slate-900 border-l-4 border-orange-500 pl-4 flex items-center gap-3 lowercase italic first-letter:uppercase">
              <Utensils className="text-orange-500" size={24} /> Planejamento Alimentar
            </h3>
            <div className="space-y-4">
              {meals.length === 0 ? (
                <p className="text-slate-400 italic text-sm">Nenhuma dieta prescrita até o momento.</p>
              ) : (
                meals.map(m => (
                  <div key={m.id} className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 hover:bg-white transition-all">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{m.dia_semana}</span>
                      <span className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                        <Clock size={12} /> {m.horario}
                      </span>
                    </div>
                    <p className="text-sm font-black text-slate-800 mb-1">{m.tipo_refeicao}</p>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{m.descricao}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Training Section */}
          <section className="space-y-6">
            <h3 className="text-xl font-black text-slate-900 border-l-4 border-blue-500 pl-4 flex items-center gap-3 lowercase italic first-letter:uppercase">
              <Dumbbell className="text-blue-500" size={24} /> Prescrição de Treinamento
            </h3>
            <div className="space-y-6">
              {workoutPlans.length === 0 ? (
                <p className="text-slate-400 italic text-sm">Nenhum plano de treino definido no momento.</p>
              ) : (
                workoutPlans.map(w => (
                  <div key={w.id} className="bg-white border-2 border-slate-50 p-6 rounded-[2rem] shadow-sm">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-4">
                      <p className="text-sm font-black text-slate-800 uppercase italic tracking-tighter">{w.dia_semana}</p>
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{w.tipo_treino}</p>
                    </div>
                    <div className="space-y-3">
                      {w.exercises?.map(e => (
                        <div key={e.id} className="flex justify-between items-center">
                          <p className="text-xs font-bold text-slate-600">{e.nome}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {e.series} x {e.repeticoes}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Footer - Legal & Branding */}
        <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-end">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">FitTrack Pro</p>
            <p className="text-[9px] text-slate-400 font-medium max-w-xs">Este relatório é uma compilação de dados do aluno e visa acompanhamento profissional. Não substitui aconselhamento médico especializado.</p>
          </div>
          <div className="text-right italic text-[10px] text-slate-300 font-medium">
            Gerado digitalmente por Antigravity Systems.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintReport;

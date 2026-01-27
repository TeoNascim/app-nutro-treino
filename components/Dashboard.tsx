
import React, { useState } from 'react';
// Corrected types from types.ts
import { User, WeightEntry, DayWorkout, TabType, LoadEntry } from '../types';
import { Plus, Scale, CheckCircle2, ChevronRight, TrendingUp, Dumbbell, Utensils, CircleDot, Award } from 'lucide-react';

interface Props {
  user: User;
  weights: WeightEntry[];
  loads: LoadEntry[];
  workouts: DayWorkout[];
  onTabChange: (tab: TabType) => void;
  setWeights: React.Dispatch<React.SetStateAction<WeightEntry[]>>;
  isWorkoutActive: boolean;
}

const Dashboard: React.FC<Props> = ({ user, weights, workouts, onTabChange, setWeights, isWorkoutActive }) => {
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  // Fixed property names: weight -> peso, initialWeight -> initial_weight
  const currentWeight = weights.length > 0 ? weights[weights.length - 1].peso : user.initial_weight;
  const weightChange = (weights.length > 1 && currentWeight) ? (currentWeight - weights[0].peso) : 0;

  const handleSaveWeight = () => {
    if (!newWeight) return;
    // Fixed property names: userId -> aluno_id, weight -> peso
    setWeights(prev => [...prev, { id: Date.now().toString(), aluno_id: user.id, date: new Date().toISOString(), peso: parseFloat(newWeight) }]);
    setShowWeightModal(false);
    setNewWeight('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          {/* Fixed property: name -> nome */}
          <h2 className="text-4xl font-black text-slate-900 leading-tight">Olá, {user.nome}</h2>
          <p className="text-slate-500 font-medium">
            {/* Fixed roles: professional -> profissional */}
            {user.role === 'profissional' 
              ? `Gerenciando o perfil de ${user.nome}` 
              : 'Bem-vindo ao seu centro de performance.'}
          </p>
        </div>
        {/* Fixed role: user -> aluno */}
        {user.role === 'aluno' && (
          <button 
            onClick={() => setShowWeightModal(true)} 
            className="flex items-center justify-center gap-3 bg-emerald-600 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-emerald-100 active:scale-95 transition-all uppercase tracking-widest text-xs"
          >
            <Plus size={20} /> Registrar Peso
          </button>
        )}
      </div>

      {isWorkoutActive && (
        <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] flex items-center justify-between shadow-2xl border-b-4 border-emerald-500 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
              <CircleDot size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sessão Ativa</p>
              <h4 className="font-black text-lg">Você está treinando agora</h4>
            </div>
          </div>
          <button 
            onClick={() => onTabChange('training')}
            className="bg-white text-slate-900 text-xs font-black py-3 px-6 rounded-xl active:scale-95 transition-all uppercase"
          >
            VOLTAR
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          label="Peso Atual" 
          value={`${currentWeight || '---'} kg`} 
          sub={weightChange === 0 ? 'Meta: ' + (user.goal || 'Definir') : `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}kg variação`}
          color="emerald"
          icon={<Scale size={24} />}
        />
        <StatCard 
          label="Semanas Ativas" 
          value="4" 
          sub="Consistência impecável"
          color="blue"
          icon={<Award size={24} />}
        />
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between hidden lg:flex">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Meta do Aluno</h3>
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-800">{user.goal || 'Não definida'}</div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
             <div className="bg-emerald-500 h-full w-[65%]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard 
          title="Planilha de Treino" 
          desc={user.role === 'profissional' ? 'Definir exercícios e cargas' : 'Ver sua rotina de hoje'} 
          icon={<Dumbbell className="text-blue-500" size={32} />} 
          onClick={() => onTabChange('training')} 
        />
        <SectionCard 
          title="Plano Alimentar" 
          desc={user.role === 'profissional' ? 'Ajustar macros e refeições' : 'Consultar dieta do dia'} 
          icon={<Utensils className="text-orange-500" size={32} />} 
          onClick={() => onTabChange('diet')} 
        />
      </div>

      {showWeightModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-900 mb-8 text-center uppercase tracking-tight">Peso de Hoje</h3>
            <div className="relative mb-10">
              <input 
                type="number" step="0.1" value={newWeight} onChange={e => setNewWeight(e.target.value)} autoFocus
                className="w-full text-6xl font-black text-center py-6 border-b-4 border-emerald-500 focus:outline-none bg-transparent text-slate-800"
                placeholder="00.0"
              />
              <span className="absolute right-0 bottom-8 text-slate-300 font-bold text-xl uppercase">kg</span>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={handleSaveWeight} className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-2xl shadow-emerald-100 uppercase tracking-widest">Salvar Registro</button>
              <button onClick={() => setShowWeightModal(false)} className="w-full py-4 font-bold text-slate-400 uppercase text-xs">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, sub, color, icon }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-lg transition-all">
    <div className="flex justify-between items-start mb-6">
      <h3 className="text-slate-400 font-black uppercase text-[10px] tracking-widest">{label}</h3>
      <div className={`text-${color}-500 opacity-50 group-hover:opacity-100 transition-opacity`}>{icon}</div>
    </div>
    <div className="text-4xl font-black text-slate-800 mb-1">{value}</div>
    <div className="text-xs text-slate-400 font-bold uppercase tracking-tight">{sub}</div>
  </div>
);

const SectionCard = ({ title, desc, icon, onClick }: any) => (
  <button onClick={onClick} className="w-full bg-white p-8 rounded-[3rem] border-2 border-slate-50 shadow-sm flex items-center justify-between hover:border-emerald-200 transition-all group text-left">
    <div className="flex items-center gap-6">
      <div className="p-5 bg-slate-50 rounded-[1.5rem] group-hover:bg-emerald-50 group-hover:scale-110 transition-all">{icon}</div>
      <div>
        <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">{title}</h4>
        <p className="text-sm text-slate-400 font-medium">{desc}</p>
      </div>
    </div>
    <ChevronRight className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-2 transition-all" />
  </button>
);

export default Dashboard;

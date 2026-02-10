import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, WeightEntry, TabType, UserProfile, Aviso } from '../types';
import {
  Plus,
  Scale,
  ChevronRight,
  TrendingUp,
  Dumbbell,
  Utensils,
  CircleDot,
  Award,
  Target,
  Activity,
  User as UserIcon,
  UserPlus,
  Megaphone,
  CheckCircle2,
  Trash2
} from 'lucide-react';

interface Props {
  user: User;
  weights: WeightEntry[];
  onTabChange: (tab: TabType) => void;
  setWeights: React.Dispatch<React.SetStateAction<WeightEntry[]>>;
  isWorkoutActive: boolean;
  isPro: boolean;
  loggedUserId: string;
}

const Dashboard: React.FC<Props> = ({ user, weights, onTabChange, setWeights, isWorkoutActive, isPro, loggedUserId }) => {
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [proStats, setProStats] = useState({ alunoCount: 0, planoCount: 0 });
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [newAviso, setNewAviso] = useState('');
  const [criticidade, setCriticidade] = useState<'Normal' | 'Importante' | 'Urgente'>('Normal');

  const [proIdForAluno, setProIdForAluno] = useState<string | null>(null);

  useEffect(() => {
    fetchAvisos();
    if (isPro && user.role === 'profissional') {
      fetchProStats();
    } else if (!isPro) {
      fetchProIdForAluno();
    }
  }, [isPro, user.id, user.role]);

  const fetchProIdForAluno = async () => {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('profissional_id')
        .eq('aluno_id', user.id)
        .single();
      if (data) setProIdForAluno(data.profissional_id);
    } catch (err) {
      console.error("Erro ao buscar profissional vinculado:", err);
    }
  };

  const fetchAvisos = async () => {
    try {
      const { data, error } = await supabase
        .from('avisos')
        .select('*')
        .eq(user.role === 'profissional' ? 'profissional_id' : 'aluno_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setAvisos(data);
    } catch (err) {
      console.error("Erro ao buscar avisos:", err);
    }
  };

  const handleSendAviso = async () => {
    if (!newAviso.trim()) return;

    const targetUserId = isPro ? user.id : proIdForAluno;
    const professionalId = isPro ? loggedUserId : proIdForAluno;

    if (!targetUserId || !professionalId) {
      alert("Não foi possível identificar o destinatário.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('avisos')
        .insert([{
          profissional_id: professionalId,
          aluno_id: isPro ? user.id : loggedUserId,
          autor_id: loggedUserId,
          mensagem: newAviso,
          criticidade: isPro ? criticidade : 'Normal'
        }])
        .select();

      if (error) throw error;
      if (data) {
        setAvisos([data[0], ...avisos]);
        setNewAviso('');
      }
    } catch (err: any) {
      alert("Erro ao enviar aviso: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    if (isPro) return;
    try {
      const { error } = await supabase.from('avisos').update({ lido: true }).eq('id', id);
      if (error) throw error;
      setAvisos(avisos.map(a => a.id === id ? { ...a, lido: true } : a));
    } catch (err) {
      console.error("Erro ao marcar como lido:", err);
    }
  };

  const handleDeleteAviso = async (id: string, autorId: string) => {
    if (loggedUserId !== autorId && !isPro) return;
    try {
      const { error } = await supabase.from('avisos').delete().eq('id', id);
      if (error) throw error;
      setAvisos(avisos.filter(a => a.id !== id));
    } catch (err) {
      console.error("Erro ao deletar aviso:", err);
    }
  };

  const fetchProStats = async () => {
    try {
      // Count alunos
      const { count: alunoCount } = await supabase
        .from('alunos')
        .select('*', { count: 'exact', head: true })
        .eq('profissional_id', user.id);

      // Count plans
      const { count: planoCount } = await supabase
        .from('planos_treino')
        .select('*', { count: 'exact', head: true })
        .eq('profissional_id', user.id);

      setProStats({
        alunoCount: alunoCount || 0,
        planoCount: planoCount || 0
      });
    } catch (err) {
      console.error("Erro ao buscar estatísticas:", err);
    }
  };

  // currentWeight: last weight entry or initial_weight (using 0 if none)
  const currentWeight = weights.length > 0 ? weights[weights.length - 1].peso : 0;
  const initialWeight = weights.length > 0 ? weights[0].peso : 0;
  const weightChange = (weights.length > 1) ? (currentWeight - initialWeight) : 0;

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const { error } = await supabase
        .from('users_profile')
        .update(updates)
        .eq('id', user.id);
      if (error) throw error;
    } catch (err: any) {
      alert("Erro ao atualizar perfil: " + err.message);
    }
  };

  const handleSaveWeight = async () => {
    if (!newWeight || loading) return;
    setLoading(true);

    try {
      const weightValue = parseFloat(newWeight);
      const { data, error } = await supabase
        .from('registros_peso')
        .insert([{
          user_id: user.id,
          peso: weightValue
        }])
        .select();

      if (error) throw error;

      if (data) {
        setWeights(prev => [...prev, data[0]]);
        setShowWeightModal(false);
        setNewWeight('');
      }
    } catch (error: any) {
      console.error("Erro ao salvar peso:", error);
      alert("Erro ao salvar peso: " + (error.message || "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-3xl flex items-center justify-center">
            <UserIcon size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 leading-tight">
              {isPro ? user.nome : `Olá, ${user.nome}`}
            </h2>
            <p className="text-slate-500 font-medium">
              {isPro
                ? `Visualizando perfil do aluno • ${user.status || 'Ativo'}`
                : 'Bem-vindo ao seu centro de saúde e performance.'}
            </p>
          </div>
        </div>

        {!isPro && (
          <button
            onClick={() => setShowWeightModal(true)}
            className="flex items-center justify-center gap-3 bg-emerald-600 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-emerald-100 active:scale-95 transition-all uppercase tracking-widest text-xs"
          >
            <Plus size={20} /> Registrar Peso
          </button>
        )}
        {isPro && user.role === 'profissional' && (
          <button
            onClick={() => onTabChange('users')}
            className="flex items-center justify-center gap-3 bg-slate-900 text-white font-black py-4 px-8 rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs"
          >
            <UserPlus size={20} /> Vincular Aluno
          </button>
        )}
      </div>

      {isWorkoutActive && !isPro && (
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

      {isPro && user.role === 'profissional' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="Lista de Alunos" value={proStats.alunoCount} sub="Alunos vinculados" color="blue" icon={<UserIcon size={24} />} />
            <StatCard label="Planos Ativos" value={proStats.planoCount} sub="Treinos montados" color="emerald" icon={<Dumbbell size={24} />} />
            <StatCard label="Avisos Enviados" value={avisos.length} sub="Total de mensagens" color="orange" icon={<Megaphone size={24} />} />
          </div>
          <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserIcon size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">Gerenciamento de Alunos</h3>
            <p className="text-slate-400 mb-8 max-w-sm mx-auto">Vincule e selecione alunos na aba de usuários para começar a gerenciar treinos e dietas.</p>
            <button
              onClick={() => onTabChange('users')}
              className="bg-slate-900 text-white font-black py-5 px-10 rounded-2xl uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
            >
              Ver Meus Alunos
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Peso Atual"
              value={`${currentWeight || '---'} kg`}
              sub={weightChange === 0 ? 'Meta: ' + (user.target_weight ? `${user.target_weight}kg` : '---') : `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}kg variação`}
              color="emerald"
              icon={<Scale size={24} />}
            />

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Avisos</h3>
                <Megaphone size={20} className="text-orange-500" />
              </div>
              <div className="text-3xl font-black text-slate-800">
                {user.role === 'aluno' ? avisos.filter(a => !a.lido).length : avisos.length}
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">
                {user.role === 'aluno' ? 'Mensagens não lidas' : 'Total enviadas'}
              </p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Meta de Peso</h3>
                <TrendingUp size={20} className="text-orange-500" />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  className="text-2xl font-black text-slate-800 bg-transparent border-none p-0 focus:ring-0 w-24"
                  defaultValue={user.target_weight || ''}
                  placeholder="0.0"
                  onBlur={e => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) handleUpdateProfile({ target_weight: val });
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                />
                <span className="text-xs font-bold text-slate-300">kg</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-emerald-500 h-full w-[65%]" />
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Status</h3>
                <Activity size={20} className="text-purple-500" />
              </div>
              {isPro ? (
                <select
                  className="text-lg font-black text-slate-800 bg-transparent border-none p-0 focus:ring-0 w-full outline-none"
                  defaultValue={user.status || 'Ativo'}
                  onChange={e => handleUpdateProfile({ status: e.target.value as any })}
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Férias">Férias</option>
                </select>
              ) : (
                <div className="text-lg font-black text-slate-800">{user.status || 'Ativo'}</div>
              )}
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Situação atual</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionCard
              title="Planilha de Treino"
              desc={isPro ? 'Configurar exercícios e séries' : 'Ver sua rotina de hoje'}
              icon={<Dumbbell className="text-blue-500" size={32} />}
              onClick={() => onTabChange('training')}
            />
            <SectionCard
              title="Plano Alimentar"
              desc={isPro ? 'Montar dieta personalizada' : 'Consultar dieta do dia'}
              icon={<Utensils className="text-orange-500" size={32} />}
              onClick={() => onTabChange('diet')}
            />
          </div>

          {/* Mural de Avisos */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900 px-2 flex items-center gap-3">
              <Megaphone className="text-orange-500" /> Mural de Avisos
            </h3>

            {((isPro && user.role === 'aluno') || (!isPro)) && (
              <div className="bg-white p-8 rounded-[2.5rem] border-2 border-orange-50 shadow-sm space-y-4">
                <textarea
                  className="w-full min-h-[100px] p-4 bg-slate-50 rounded-2xl text-sm border-none focus:ring-2 focus:ring-orange-500"
                  placeholder={isPro ? "Escreva um aviso importante para este aluno..." : "Envie uma mensagem ou dúvida para seu professor..."}
                  value={newAviso}
                  onChange={e => setNewAviso(e.target.value)}
                />
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    {isPro && (['Normal', 'Importante', 'Urgente'] as const).map(c => (
                      <button
                        key={c}
                        onClick={() => setCriticidade(c)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${criticidade === c ? 'bg-orange-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                          }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleSendAviso}
                    disabled={loading || !newAviso.trim()}
                    className="bg-slate-900 text-white font-black py-3 px-8 rounded-xl text-xs uppercase tracking-widest disabled:opacity-50"
                  >
                    {isPro ? 'Enviar Aviso' : 'Enviar Mensagem'}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {avisos.length === 0 ? (
                <div className="col-span-full bg-white p-12 rounded-[2.5rem] text-center border-2 border-dashed border-slate-100">
                  <p className="text-slate-400 font-medium">Nenhum aviso no momento.</p>
                </div>
              ) : (
                avisos.map(aviso => (
                  <div
                    key={aviso.id}
                    className={`p-6 rounded-[2rem] border transition-all ${aviso.lido ? 'bg-slate-50/50 border-slate-100 grayscale-[0.5]' : 'bg-white border-orange-100 shadow-sm'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${aviso.criticidade === 'Urgente' ? 'bg-red-50 text-red-500' :
                            aviso.criticidade === 'Importante' ? 'bg-orange-50 text-orange-500' :
                              'bg-blue-50 text-blue-500'
                          }`}>
                          {aviso.criticidade}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-slate-100 text-slate-500">
                          {aviso.autor_id === loggedUserId ? 'Você' : (isPro ? 'Aluno' : 'Profissional')}
                        </span>
                      </div>
                      {aviso.autor_id === loggedUserId || isPro ? (
                        <button onClick={() => handleDeleteAviso(aviso.id, aviso.autor_id)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        !aviso.lido && (
                          <button onClick={() => handleMarkAsRead(aviso.id)} className="text-emerald-500 hover:scale-110 transition-all">
                            <CheckCircle2 size={20} />
                          </button>
                        )
                      )}
                    </div>
                    <p className={`text-sm leading-relaxed ${aviso.lido ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
                      {aviso.mensagem}
                    </p>
                    <div className="mt-4 text-[9px] font-bold text-slate-300 uppercase tracking-tight">
                      {new Date(aviso.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showWeightModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-900 mb-8 text-center uppercase tracking-tight">Peso de Hoje</h3>
            <div className="relative mb-10">
              <input
                type="number" step="0.1" value={newWeight} onChange={e => setNewWeight(e.target.value)} autoFocus
                className="w-full text-6xl font-black text-center py-6 border-b-4 border-emerald-500 focus:outline-none bg-transparent text-slate-800"
                placeholder="00.0"
                disabled={loading}
              />
              <span className="absolute right-0 bottom-8 text-slate-300 font-bold text-xl uppercase">kg</span>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSaveWeight}
                disabled={loading}
                className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-2xl shadow-emerald-100 uppercase tracking-widest disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar Registro'}
              </button>
              <button onClick={() => setShowWeightModal(false)} className="w-full py-4 font-bold text-slate-400 uppercase text-xs" disabled={loading}>Cancelar</button>
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
    <div className="text-xs text-slate-400 font-bold uppercase tracking-tight line-clamp-1">{sub}</div>
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

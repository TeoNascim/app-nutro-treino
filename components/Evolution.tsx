
import React, { useMemo, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { WeightEntry, LoadEntry } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Scale, Activity, Loader2 } from 'lucide-react';

interface Props {
  alunoId: string;
  weights: WeightEntry[];
  isPro: boolean;
}

const Evolution: React.FC<Props> = ({ alunoId, weights, isPro }) => {
  const [loads, setLoads] = useState<LoadEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (alunoId) fetchLoads();
  }, [alunoId]);

  const fetchLoads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('registros_carga')
        .select('*, exercicios(nome)')
        .eq('user_id', alunoId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        setLoads(data.map((item: any) => ({
          ...item,
          exerciseName: item.exercicios?.nome || 'Exercício'
        })));
      }
    } catch (err: any) {
      console.error("Erro ao carregar histórico de cargas:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const weightData = useMemo(() => weights.map(w => ({
    timestamp: new Date(w.created_at).getTime(),
    data: new Date(w.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    peso: w.peso
  })).sort((a, b) => a.timestamp - b.timestamp), [weights]);

  const exerciseNames = useMemo(() => Array.from(new Set(loads.map(l => l.exerciseName))), [loads]);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dateLabel = new Date(label).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
      return (
        <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-50">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{dateLabel}</p>
          <p className="text-lg font-black text-slate-800">{payload[0].value} <span className="text-xs text-slate-400 font-bold">kg</span></p>
        </div>
      );
    }
    return null;
  };

  const formatDate = (tick: number) => {
    return new Date(tick).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-3xl font-black text-slate-900">Evolução</h2>
        {isPro && (
          <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-emerald-500/10">
            Visualizando Aluno
          </span>
        )}
      </div>

      {/* Peso Corporal */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Scale className="text-emerald-500" /> Histórico de Peso Corporal
        </h3>
        {weightData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="timestamp"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatDate}
                  style={{ fontSize: '10px', fontWeight: 'bold' }}
                />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="#10b981"
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="p-10 text-center text-slate-400">Nenhum registro de peso encontrado.</div>
        )}
      </div>

      {/* Evolução de Carga */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-800 px-4 flex items-center gap-2">
          <Activity className="text-blue-500" /> Progressão de Cargas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exerciseNames.length === 0 ? (
            <div className="bg-white p-12 rounded-[2rem] text-center border-2 border-dashed border-slate-100 text-slate-400 col-span-full">
              Nenhum registro de carga ainda. Registre durante o treino!
            </div>
          ) : (
            exerciseNames.map(exName => {
              const exData = loads
                .filter(l => l.exerciseName === exName)
                .map(l => ({
                  timestamp: new Date(l.created_at).getTime(),
                  data: new Date(l.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                  carga: l.carga
                }))
                .sort((a, b) => a.timestamp - b.timestamp);

              return (
                <div key={exName} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                  <h4 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-wider">{exName}</h4>
                  <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={exData}>
                        <XAxis
                          dataKey="timestamp"
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={formatDate}
                          style={{ fontSize: '9px', fontWeight: 'bold', fill: '#94a3b8' }}
                        />
                        <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="stepAfter"
                          dataKey="carga"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 text-[10px] font-bold text-slate-400 text-center uppercase">Evolução da Carga (kg)</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Evolution;

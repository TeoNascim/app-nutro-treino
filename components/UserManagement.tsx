
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { UserPlus, ChevronRight, Award, Trash2, Loader2 } from 'lucide-react';

interface Props {
  profissionalId: string;
  selectedAlunoId: string | null;
  onSelect: (id: string) => void;
}

const UserManagement: React.FC<Props> = ({ profissionalId, selectedAlunoId, onSelect }) => {
  const [alunos, setAlunos] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profissionalId) fetchAlunos();
  }, [profissionalId]);

  const fetchAlunos = async () => {
    setLoading(true);
    try {
      // Buscar associações na tabela 'alunos' e dar join no profile
      const { data, error } = await supabase
        .from('alunos')
        .select('user_id, users_profile (*)')
        .eq('profissional_id', profissionalId);

      if (error) throw error;

      if (data) {
        setAlunos(data.map((item: any) => item.users_profile));
      }
    } catch (err: any) {
      console.error("Erro ao carregar alunos:", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-3xl font-black text-slate-900">Meus Alunos</h2>
        <button className="bg-emerald-600 text-white p-3 rounded-2xl shadow-xl">
          <UserPlus size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {alunos.map((aluno) => (
          <div key={aluno.id} className={`bg-white p-6 rounded-[2.5rem] border-2 transition-all ${selectedAlunoId === aluno.id ? 'border-emerald-500' : 'border-slate-50'}`}>
            <div className="flex justify-between mb-4">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <Award size={24} />
              </div>
              <button
                onClick={async () => {
                  if (confirm(`Remover aluno ${aluno.nome}?`)) {
                    await supabase.from('alunos').delete().eq('user_id', aluno.id).eq('profissional_id', profissionalId);
                    setAlunos(alunos.filter(a => a.id !== aluno.id));
                  }
                }}
                className="text-slate-300 hover:text-red-500"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <h4 className="font-black text-slate-800 text-lg mb-1">{aluno.nome}</h4>
            <p className="text-xs text-slate-400 mb-6">{aluno.email}</p>
            <button
              onClick={() => onSelect(aluno.id)}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2"
            >
              Gerenciar Aluno <ChevronRight size={16} />
            </button>
          </div>
        ))}

        {!loading && alunos.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-[2rem] text-center border-2 border-dashed border-slate-100 text-slate-400">
            Nenhum aluno vinculado.
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;

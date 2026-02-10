
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [alunoEmail, setAlunoEmail] = useState('');
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    if (profissionalId) fetchAlunos();
  }, [profissionalId]);

  const fetchAlunos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('aluno_id, users_profile!aluno_id (*)')
        .eq('profissional_id', profissionalId);

      if (error) throw error;
      if (data) {
        setAlunos(data.filter((item: any) => item.users_profile).map((item: any) => item.users_profile));
      }
    } catch (err: any) {
      console.error("Erro ao carregar alunos:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkAluno = async () => {
    if (!alunoEmail || linking) return;
    setLinking(true);

    try {
      const { data: profile, error: profileError } = await supabase
        .from('users_profile')
        .select('*')
        .eq('email', alunoEmail)
        .eq('role', 'aluno')
        .single();

      if (profileError) {
        console.error("Erro ao buscar aluno:", profileError);
        alert(profileError.message.includes('fetch')
          ? "Erro de conexão: Verifique seu CORS no Supabase ou tente recarregar."
          : "Erro ao buscar aluno: " + profileError.message);
        setLinking(false);
        return;
      }

      if (!profile) {
        alert("Aluno não encontrado ou não possui perfil de aluno.");
        setLinking(false);
        return;
      }

      const { error: linkError } = await supabase
        .from('alunos')
        .upsert({
          aluno_id: profile.id,
          profissional_id: profissionalId
        }, { onConflict: 'aluno_id' });

      if (linkError) throw linkError;

      alert("Aluno vinculado com sucesso!");
      setShowAddModal(false);
      setAlunoEmail('');
      fetchAlunos();
    } catch (err: any) {
      alert("Erro ao vincular aluno: " + err.message);
    } finally {
      setLinking(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-3xl font-black text-slate-900">Meus Alunos</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 text-white p-3 rounded-2xl shadow-xl hover:bg-emerald-700 transition-all font-bold flex items-center gap-2 text-xs uppercase"
        >
          <UserPlus size={18} /> Vincular Aluno
        </button>
      </div>

      {showAddModal && (
        <div className="bg-slate-900/5 backdrop-blur-sm p-8 rounded-[2.5rem] border-2 border-emerald-100 animate-in zoom-in-95 duration-200">
          <h3 className="font-black text-slate-800 mb-4 uppercase tracking-tight">Novo Vínculo</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email" placeholder="E-mail do aluno cadastrado"
              className="flex-1 p-4 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              value={alunoEmail} onChange={e => setAlunoEmail(e.target.value)}
            />
            <button
              onClick={handleLinkAluno}
              disabled={linking}
              className="bg-emerald-600 text-white font-black py-4 px-8 rounded-2xl shadow-lg disabled:opacity-50 uppercase tracking-widest text-xs"
            >
              {linking ? 'Vinculando...' : 'Confirmar'}
            </button>
            <button onClick={() => setShowAddModal(false)} className="py-4 px-4 font-bold text-slate-400 uppercase text-[10px]" disabled={linking}>Cancelar</button>
          </div>
        </div>
      )}

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
                    await supabase.from('alunos').delete().eq('aluno_id', aluno.id).eq('profissional_id', profissionalId);
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

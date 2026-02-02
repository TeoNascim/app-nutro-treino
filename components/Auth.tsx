
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User as UserIcon, Target, ArrowRight } from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'aluno' | 'profissional'>('aluno');
  const [formData, setFormData] = useState({ nome: '', email: '', password: '' });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
      } else {
        // Sign up com metadata (Novo Backend - Trigger fará o resto)
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              role: role,
              nome: formData.nome
            }
          }
        });

        if (signUpError) {
          if (signUpError.status === 429) {
            throw new Error("Muitas tentativas. Por favor, aguarde um momento antes de tentar novamente.");
          }
          throw signUpError;
        }

        if (!data.user) throw new Error("Erro ao criar usuário.");

        // Fallback rápido via frontend (opcional mas seguro)
        const { error: profileError } = await supabase.from('users_profile').upsert([
          {
            id: data.user.id,
            nome: formData.nome,
            email: formData.email,
            role: role
          }
        ], { onConflict: 'id' });

        if (profileError) {
          console.warn("Trigger de perfil pode estar atrasada ou falhou, fallback frontend:", profileError);
        }

        if (data.session) {
          alert("Cadastro realizado com sucesso!");
        } else {
          alert("Verifique seu email para confirmar a conta antes de entrar.");
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden p-8 md:p-12">
        <div className="text-center mb-10">
          <div className="inline-flex bg-emerald-600 p-4 rounded-3xl text-white shadow-xl mb-6">
            <Target size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900">FitTrack Pro</h1>
          <p className="text-slate-400 font-medium">Backend via Supabase</p>
        </div>

        {!isLogin && (
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
            <button onClick={() => setRole('aluno')} className={`flex-1 py-3 text-xs font-black rounded-xl uppercase transition-all ${role === 'aluno' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Aluno</button>
            <button onClick={() => setRole('profissional')} className={`flex-1 py-3 text-xs font-black rounded-xl uppercase transition-all ${role === 'profissional' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Profissional</button>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <UserIcon className="absolute left-4 top-4 text-slate-300" size={18} />
              <input
                type="text" placeholder="Nome Completo" required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-slate-300" size={18} />
            <input
              type="email" placeholder="Email" required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-300" size={18} />
            <input
              type="password" placeholder="Senha" required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white font-black py-5 rounded-3xl shadow-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-95 mt-6 uppercase tracking-widest text-sm">
            {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Registrar')} <ArrowRight size={18} />
          </button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
          {isLogin ? 'Criar nova conta' : 'Já tenho conta'}
        </button>
      </div>
    </div>
  );
};

export default Auth;

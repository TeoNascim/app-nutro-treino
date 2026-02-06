console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL)
console.log("VITE_SUPABASE_ANON_KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY?.slice(0, 10))



import React, { useState, useEffect } from 'react';
import {
  Home,
  Dumbbell,
  Utensils,
  TrendingUp,
  LogOut,
  Users as UsersIcon,
  Printer
} from 'lucide-react';
import { supabase } from './lib/supabase';
import {
  UserProfile,
  TabType,
  WeightEntry,
  WorkoutPlan,
  Meal,
  LoadEntry
} from './types';
import Dashboard from './components/Dashboard';
import Training from './components/Training';
import Diet from './components/Diet';
import Evolution from './components/Evolution';
import Auth from './components/Auth';
import UserManagement from './components/UserManagement';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedAlunoId, setSelectedAlunoId] = useState<string | null>(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Monitorar estado da sessão
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUserProfile(null);
        setWeights([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users_profile')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setUserProfile(data);
        if (data.role === 'aluno') {
          fetchWeights(userId);
        }
      } else {
        // Fallback: Tentar criar o perfil a partir dos metadados da sessão
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession && currentSession.user) {
          const { role, nome } = currentSession.user.user_metadata;
          // Upsert sem select() encadeado para evitar problemas de RLS/filtro no retorno
          const { error: upsertError } = await supabase
            .from('users_profile')
            .upsert({
              id: currentSession.user.id,
              email: currentSession.user.email,
              nome: nome || 'Usuário',
              role: role || 'aluno'
            }, { onConflict: 'id' });

          if (!upsertError) {
            // Nova busca filtrada explicitamente após o upsert
            const { data: refreshedProfile, error: fetchAfterError } = await supabase
              .from('users_profile')
              .select('*')
              .eq('id', currentSession.user.id)
              .single();

            if (refreshedProfile) {
              setUserProfile(refreshedProfile);
              if (refreshedProfile.role === 'aluno') fetchWeights(userId);
              return;
            }
            if (fetchAfterError) console.error("Erro ao buscar perfil após upsert:", fetchAfterError);
          } else {
            console.error("Erro no upsert de perfil:", upsertError);
          }
        }

        if (error && error.code !== 'PGRST116') {
          console.error("Erro ao buscar perfil:", error);
        }
        setUserProfile(null);
      }
    } catch (err) {
      console.error("Erro inesperado ao buscar perfil:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeights = async (userId: string) => {
    const { data, error } = await supabase
      .from('registros_peso')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (data) setWeights(data);
    else if (error) console.error("Erro ao buscar pesos:", error);
  };

  const handleLogout = async () => {
    if (confirm('Sair do sistema?')) {
      await supabase.auth.signOut();
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  if (!session) return <Auth />;

  if (!userProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-md">
          <TrendingUp className="mx-auto mb-6 text-emerald-500" size={48} />
          <h2 className="text-2xl font-black text-slate-800 mb-4">Perfil não encontrado</h2>
          <p className="text-slate-500 mb-8 font-medium">Não conseguimos localizar seus dados de acesso. Isso pode acontecer se o cadastro não foi finalizado corretamente.</p>
          <button onClick={handleLogout} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs">Voltar para Login</button>
        </div>
      </div>
    );
  }

  const isPro = userProfile.role === 'profissional';
  // ID do aluno que estamos visualizando no momento
  const effectiveAlunoId = isPro ? selectedAlunoId : userProfile.id;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 md:flex-row max-w-[1400px] mx-auto shadow-2xl relative">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 text-emerald-400">
          <TrendingUp size={32} />
          <h1 className="text-xl font-bold tracking-tight">FitTrack Pro</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Home />} label="Dashboard" />
          {isPro && <SidebarItem active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<UsersIcon />} label="Meus Alunos" />}
          <SidebarItem active={activeTab === 'training'} onClick={() => setActiveTab('training')} icon={<Dumbbell />} label="Treinamento" badge={isWorkoutActive} />
          <SidebarItem active={activeTab === 'diet'} onClick={() => setActiveTab('diet')} icon={<Utensils />} label="Alimentação" />
          <SidebarItem active={activeTab === 'evolution'} onClick={() => setActiveTab('evolution')} icon={<TrendingUp />} label="Evolução" />
        </nav>

        <div className="mt-auto border-t border-slate-800 pt-6">
          <div className="px-3 mb-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Usuário</p>
            <p className="text-sm font-bold text-slate-200 truncate">{userProfile.nome}</p>
            <p className="text-[10px] text-slate-400 capitalize">{userProfile.role}</p>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-red-400 transition-colors">
            <LogOut size={20} /> <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-8 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              user={userProfile}
              weights={weights}
              onTabChange={setActiveTab}
              setWeights={setWeights}
              isWorkoutActive={isWorkoutActive}
            />
          )}
          {activeTab === 'users' && isPro && (
            <UserManagement
              profissionalId={userProfile.id}
              selectedAlunoId={selectedAlunoId}
              onSelect={(id) => { setSelectedAlunoId(id); setActiveTab('dashboard'); }}
            />
          )}
          {activeTab === 'training' && (
            <Training
              userProfile={userProfile}
              alunoId={effectiveAlunoId}
              isPro={isPro}
              setIsWorkoutActive={setIsWorkoutActive}
              isWorkoutActive={isWorkoutActive}
            />
          )}
          {activeTab === 'diet' && (
            <Diet
              userId={effectiveAlunoId || ''}
              isPro={isPro}
            />
          )}
          {activeTab === 'evolution' && (
            <Evolution
              alunoId={effectiveAlunoId || ''}
              weights={weights}
              isPro={isPro}
            />
          )}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex justify-between items-center z-30 shadow-2xl">
        <MobileNavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Home size={22} />} />
        {isPro && <MobileNavItem active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<UsersIcon size={22} />} />}
        <MobileNavItem active={activeTab === 'training'} onClick={() => setActiveTab('training')} icon={<Dumbbell size={22} />} badge={isWorkoutActive} />
        <MobileNavItem active={activeTab === 'diet'} onClick={() => setActiveTab('diet')} icon={<Utensils size={22} />} />
        <MobileNavItem active={activeTab === 'evolution'} onClick={() => setActiveTab('evolution')} icon={<TrendingUp size={22} />} />
      </nav>
    </div>
  );
};

const SidebarItem = ({ active, onClick, icon, label, badge }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${active ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'text-slate-400 hover:bg-slate-800'}`}>
    <div className="flex items-center gap-3">
      {React.cloneElement(icon, { size: 20 })}
      <span>{label}</span>
    </div>
    {badge && <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
  </button>
);

const MobileNavItem = ({ active, onClick, icon, badge }: any) => (
  <button onClick={onClick} className={`p-2 transition-all relative ${active ? 'text-emerald-600' : 'text-gray-400'}`}>
    {icon}
    {badge && <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />}
  </button>
);

export default App;


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
import PrintReport from './components/PrintReport';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedAlunoId, setSelectedAlunoId] = useState<string | null>(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);

  useEffect(() => {
    // Monitorar estado da sessão
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setUserProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('users_profile')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) setUserProfile(data);
    else if (error) console.error("Erro ao buscar perfil:", error);
  };

  const handleLogout = async () => {
    if (confirm('Sair do sistema?')) {
      await supabase.auth.signOut();
    }
  };

  if (!session || !userProfile) return <Auth />;

  const isPro = userProfile.role === 'profissional';
  
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
          {isPro && selectedAlunoId && <SidebarItem active={activeTab === 'print'} onClick={() => setActiveTab('print')} icon={<Printer />} label="Gerar Relatório" />}
        </nav>

        <div className="mt-auto border-t border-slate-800 pt-6">
           <div className="px-3 mb-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Usuário</p>
              <p className="text-sm font-bold text-slate-200 truncate">{userProfile.nome}</p>
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
              profile={userProfile}
              selectedAlunoId={selectedAlunoId}
              onTabChange={setActiveTab}
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
              alunoId={isPro ? selectedAlunoId : userProfile.id}
              isPro={isPro}
              setIsWorkoutActive={setIsWorkoutActive}
              isWorkoutActive={isWorkoutActive}
            />
          )}
          {activeTab === 'diet' && (
            <Diet 
              alunoId={isPro ? selectedAlunoId : userProfile.id}
              isPro={isPro}
            />
          )}
          {activeTab === 'evolution' && (
            <Evolution 
              alunoId={isPro ? selectedAlunoId : userProfile.id}
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

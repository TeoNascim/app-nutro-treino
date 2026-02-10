-- 02_RLS.SQL
-- Políticas de Row Level Security (RLS)

-- Habilitar RLS em tudo
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_peso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_carga ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos_treino ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- 1. USERS_PROFILE
DROP POLICY IF EXISTS "Dono vê e edita seu perfil" ON public.users_profile;
CREATE POLICY "Dono vê e edita seu perfil" ON public.users_profile
FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profissional vê perfis de alunos para vínculo" ON public.users_profile;
CREATE POLICY "Profissional vê perfis de alunos para vínculo" ON public.users_profile
FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'profissional'
    AND role = 'aluno'
);

DROP POLICY IF EXISTS "Profissional atualiza perfis de seus alunos" ON public.users_profile;
CREATE POLICY "Profissional atualiza perfis de seus alunos" ON public.users_profile
FOR UPDATE USING (
    id IN (SELECT aluno_id FROM public.alunos WHERE profissional_id = auth.uid())
);

-- 2. ALUNOS
DROP POLICY IF EXISTS "Profissional vê e gerencia seus vínculos" ON public.alunos;
CREATE POLICY "Profissional vê e gerencia seus vínculos" ON public.alunos
FOR ALL USING (auth.uid() = profissional_id);

DROP POLICY IF EXISTS "Aluno vê seu vínculo" ON public.alunos;
CREATE POLICY "Aluno vê seu vínculo" ON public.alunos
FOR SELECT USING (auth.uid() = aluno_id);

-- 3. REGISTROS_PESO
DROP POLICY IF EXISTS "Usuário gerencia seus pesos" ON public.registros_peso;
CREATE POLICY "Usuário gerencia seus pesos" ON public.registros_peso
FOR ALL USING (
    auth.uid() = user_id OR 
    user_id IN (SELECT aluno_id FROM public.alunos WHERE profissional_id = auth.uid())
);

-- 4. REGISTROS_CARGA
DROP POLICY IF EXISTS "Usuário gerencia suas cargas" ON public.registros_carga;
CREATE POLICY "Usuário gerencia suas cargas" ON public.registros_carga
FOR ALL USING (
    auth.uid() = user_id OR 
    user_id IN (SELECT aluno_id FROM public.alunos WHERE profissional_id = auth.uid())
);

-- 5. PLANOS_TREINO
DROP POLICY IF EXISTS "Profissional CRUD nos planos que criou" ON public.planos_treino;
CREATE POLICY "Profissional CRUD nos planos que criou" ON public.planos_treino
FOR ALL USING (auth.uid() = profissional_id);

DROP POLICY IF EXISTS "Aluno visualiza seus planos" ON public.planos_treino;
CREATE POLICY "Aluno visualiza seus planos" ON public.planos_treino
FOR SELECT USING (auth.uid() = aluno_id);

-- 6. EXERCICIOS
DROP POLICY IF EXISTS "Profissional CRUD nos exercícios de seus planos" ON public.exercicios;
CREATE POLICY "Profissional CRUD nos exercícios de seus planos" ON public.exercicios
FOR ALL USING (
    plano_treino_id IN (SELECT id FROM public.planos_treino WHERE profissional_id = auth.uid())
);

DROP POLICY IF EXISTS "Aluno visualiza exercícios de seus planos" ON public.exercicios;
CREATE POLICY "Aluno visualiza exercícios de seus planos" ON public.exercicios
FOR SELECT USING (
    plano_treino_id IN (SELECT id FROM public.planos_treino WHERE aluno_id = auth.uid())
);

-- 7. MEALS
DROP POLICY IF EXISTS "Aluno vê seus meals" ON public.meals;
CREATE POLICY "Aluno vê seus meals" ON public.meals
FOR SELECT USING (auth.uid() = aluno_id);

DROP POLICY IF EXISTS "Profissional gerencia meals de seus alunos" ON public.meals;
CREATE POLICY "Profissional gerencia meals de seus alunos" ON public.meals
FOR ALL USING (
    aluno_id IN (SELECT aluno_id FROM public.alunos WHERE profissional_id = auth.uid())
);

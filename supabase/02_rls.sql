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
CREATE POLICY "Dono vê e edita seu perfil" ON public.users_profile
FOR ALL USING (auth.uid() = id);

-- 2. ALUNOS
CREATE POLICY "Profissional vê e gerencia seus vínculos" ON public.alunos
FOR ALL USING (auth.uid() = profissional_id);

CREATE POLICY "Aluno vê seu vínculo" ON public.alunos
FOR SELECT USING (auth.uid() = aluno_id);

-- 3. REGISTROS_PESO
CREATE POLICY "Usuário gerencia seus pesos" ON public.registros_peso
FOR ALL USING (auth.uid() = user_id);

-- 4. REGISTROS_CARGA
CREATE POLICY "Usuário gerencia suas cargas" ON public.registros_carga
FOR ALL USING (auth.uid() = user_id);

-- 5. PLANOS_TREINO
CREATE POLICY "Profissional CRUD nos planos que criou" ON public.planos_treino
FOR ALL USING (auth.uid() = profissional_id);

CREATE POLICY "Aluno visualiza seus planos" ON public.planos_treino
FOR SELECT USING (auth.uid() = aluno_id);

-- 6. EXERCICIOS
CREATE POLICY "Profissional CRUD em seus exercícios" ON public.exercicios
FOR ALL USING (auth.uid() = profissional_id);

CREATE POLICY "Qualquer um logado vê exercícios" ON public.exercicios
FOR SELECT USING (auth.role() = 'authenticated');

-- 7. MEALS
CREATE POLICY "Aluno gerencia seus meals" ON public.meals
FOR ALL USING (auth.uid() = aluno_id);

CREATE POLICY "Profissional vê meals de alunos vinculados" ON public.meals
FOR SELECT USING (
    aluno_id IN (SELECT aluno_id FROM public.alunos WHERE profissional_id = auth.uid())
);

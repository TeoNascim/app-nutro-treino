-- 00_SCHEMA.SQL
-- Reset completo do schema FitTrack Pro

-- Limpar schema se necessário (Cuidado: remove dados!)
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;

-- 1. Perfil de Usuário
CREATE TABLE IF NOT EXISTS public.users_profile (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'aluno' CHECK (role IN ('aluno', 'profissional')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Vínculo Profissional-Aluno
CREATE TABLE IF NOT EXISTS public.alunos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profissional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(aluno_id)
);

-- 3. Registro de Peso
CREATE TABLE IF NOT EXISTS public.registros_peso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    peso NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Exercícios
CREATE TABLE IF NOT EXISTS public.exercicios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profissional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    grupo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Registro de Carga
CREATE TABLE IF NOT EXISTS public.registros_carga (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercicio_id UUID REFERENCES public.exercicios(id) ON DELETE SET NULL,
    carga NUMERIC,
    repeticoes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Planos de Treino
CREATE TABLE IF NOT EXISTS public.planos_treino (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profissional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    aluno_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Plano Alimentar (Meals)
CREATE TABLE IF NOT EXISTS public.meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    calorias INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexação para performance
CREATE INDEX IF NOT EXISTS idx_registros_peso_user ON public.registros_peso(user_id);
CREATE INDEX IF NOT EXISTS idx_registros_carga_user ON public.registros_carga(user_id);
CREATE INDEX IF NOT EXISTS idx_alunos_profissional ON public.alunos(profissional_id);

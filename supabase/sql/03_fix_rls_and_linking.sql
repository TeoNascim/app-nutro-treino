-- SQL 03_FIX_RLS_AND_LINKING.SQL
-- Objetivo: Corrigir RLS para registros de peso e permitir vínculo profissional-aluno.

-- 1. ADAPTAÇÃO DO SCHEMA (Tabelas e Colunas)

-- Tabela 'alunos' (Vínculo Pro ↔ Aluno)
CREATE TABLE IF NOT EXISTS public.alunos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profissional_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    nome TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Garantir colunas em registros_peso
-- Nota: Usaremos 'aluno_id' para manter consistência com o código frontend atual.
ALTER TABLE public.registros_peso 
ADD COLUMN IF NOT EXISTS aluno_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Garantir colunas em registros_carga
ALTER TABLE public.registros_carga 
ADD COLUMN IF NOT EXISTS aluno_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;


-- 2. HABILITAR RLS

ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_peso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_carga ENABLE ROW LEVEL SECURITY;


-- 3. POLÍTICAS RLS (Segurança)

-- USERS_PROFILE
DROP POLICY IF EXISTS "Perfis: Dono vê e edita seu perfil" ON public.users_profile;
CREATE POLICY "Perfis: Dono vê e edita seu perfil" ON public.users_profile
FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Perfis: Profissional vê perfis de seus alunos" ON public.users_profile;
CREATE POLICY "Perfis: Profissional vê perfis de seus alunos" ON public.users_profile
FOR SELECT USING (
    id IN (SELECT user_id FROM public.alunos WHERE profissional_id = auth.uid())
);

-- ALUNOS (Vínculo)
DROP POLICY IF EXISTS "Alunos: Dono vê seu vínculo" ON public.alunos;
CREATE POLICY "Alunos: Dono vê seu vínculo" ON public.alunos
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Alunos: Profissional vê e edita seus vínculos" ON public.alunos;
CREATE POLICY "Alunos: Profissional vê e edita seus vínculos" ON public.alunos
FOR ALL USING (auth.uid() = profissional_id OR auth.uid() IN (SELECT id FROM public.users_profile WHERE role = 'profissional'));

-- REGISTROS_PESO
DROP POLICY IF EXISTS "Peso: Aluno gerencia seus pesos" ON public.registros_peso;
CREATE POLICY "Peso: Aluno gerencia seus pesos" ON public.registros_peso
FOR ALL USING (auth.uid() = aluno_id);

DROP POLICY IF EXISTS "Peso: Profissional vê pesos de alunos vinculados" ON public.registros_peso;
CREATE POLICY "Peso: Profissional vê pesos de alunos vinculados" ON public.registros_peso
FOR SELECT USING (
    aluno_id IN (SELECT user_id FROM public.alunos WHERE profissional_id = auth.uid())
);

-- REGISTROS_CARGA
DROP POLICY IF EXISTS "Carga: Aluno gerencia suas cargas" ON public.registros_carga;
CREATE POLICY "Carga: Aluno gerencia suas cargas" ON public.registros_carga
FOR ALL USING (auth.uid() = aluno_id);

DROP POLICY IF EXISTS "Carga: Profissional vê cargas de alunos vinculados" ON public.registros_carga;
CREATE POLICY "Carga: Profissional vê cargas de alunos vinculados" ON public.registros_carga
FOR SELECT USING (
    aluno_id IN (SELECT user_id FROM public.alunos WHERE profissional_id = auth.uid())
);

-- NOTA: Se você tiver erro de permissão ao criar políticas, certifique-se de estar logado como postgres no SQL Editor.

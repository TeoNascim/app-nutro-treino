-- 04_AVISOS.SQL
-- Criação da tabela de avisos e políticas de segurança

CREATE TABLE IF NOT EXISTS public.avisos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profissional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    aluno_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mensagem TEXT NOT NULL,
    criticidade TEXT DEFAULT 'Normal' CHECK (criticidade IN ('Normal', 'Importante', 'Urgente')),
    lido BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexação para performance
CREATE INDEX IF NOT EXISTS idx_avisos_aluno ON public.avisos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_avisos_profissional ON public.avisos(profissional_id);

-- Habilitar RLS
ALTER TABLE public.avisos ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança (RLS)

-- 1. Profissional pode fazer tudo nos avisos que ele enviou
DROP POLICY IF EXISTS "Profissional gerencia seus avisos" ON public.avisos;
CREATE POLICY "Profissional gerencia seus avisos" ON public.avisos
FOR ALL USING (auth.uid() = profissional_id);

-- 2. Aluno pode ver os avisos enviados para ele
DROP POLICY IF EXISTS "Aluno vê seus avisos" ON public.avisos;
CREATE POLICY "Aluno vê seus avisos" ON public.avisos
FOR SELECT USING (auth.uid() = aluno_id);

-- 3. Aluno pode marcar como lido (update no campo lido)
DROP POLICY IF EXISTS "Aluno marca como lido" ON public.avisos;
CREATE POLICY "Aluno marca como lido" ON public.avisos
FOR UPDATE USING (auth.uid() = aluno_id);

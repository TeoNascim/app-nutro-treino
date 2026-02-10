-- UPDATING AVISOS FOR BIDIRECTIONAL MESSAGING
-- Adicionando quem enviou a mensagem

-- 1. Adicionar coluna autor_id (permitindo null inicialmente)
ALTER TABLE public.avisos ADD COLUMN IF NOT EXISTS autor_id UUID REFERENCES auth.users(id);

-- 2. Atualizar autor_id para as mensagens existentes (assumindo que foram enviadas pelo profissional_id)
UPDATE public.avisos SET autor_id = profissional_id WHERE autor_id IS NULL;

-- 3. Tornar autor_id NOT NULL para futuras mensagens
ALTER TABLE public.avisos ALTER COLUMN autor_id SET NOT NULL;

-- 4. Atualizar Políticas de Segurança (RLS) para serem bidirecionais

-- Remover políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Ver mensagens do vínculo" ON public.avisos;
DROP POLICY IF EXISTS "Inserir mensagens no vínculo" ON public.avisos;
DROP POLICY IF EXISTS "Marcar como lido" ON public.avisos;
DROP POLICY IF EXISTS "Deletar própria mensagem" ON public.avisos;
DROP POLICY IF EXISTS "Profissional gerencia seus avisos" ON public.avisos;
DROP POLICY IF EXISTS "Aluno vê seus avisos" ON public.avisos;
DROP POLICY IF EXISTS "Aluno marca como lido" ON public.avisos;

-- A) Ambos podem VER mensagens onde são o Aluno ou o Profissional
CREATE POLICY "Ver mensagens do vínculo" ON public.avisos
FOR SELECT USING (auth.uid() = aluno_id OR auth.uid() = profissional_id);

-- B) Ambos podem INSERIR mensagens (o autor deve ser quem está logado)
CREATE POLICY "Inserir mensagens no vínculo" ON public.avisos
FOR INSERT WITH CHECK (auth.uid() = autor_id);

-- C) Ambos podem marcar como LIDO (update no campo lido)
CREATE POLICY "Marcar como lido" ON public.avisos
FOR UPDATE USING (auth.uid() = aluno_id OR auth.uid() = profissional_id)
WITH CHECK (lido = true);

-- D) Autor pode DELETAR sua própria mensagem
CREATE POLICY "Deletar própria mensagem" ON public.avisos
FOR DELETE USING (auth.uid() = autor_id);

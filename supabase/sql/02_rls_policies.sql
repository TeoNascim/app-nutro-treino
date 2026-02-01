-- POLÍTICAS DE RLS (Sugeridas)
-- Execute no SQL Editor do Supabase se tiver problemas de permissão.

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_peso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_carga ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos_treino ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- Exemplo de Políticas para users_profile
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.users_profile;
CREATE POLICY "Usuários podem ver seu próprio perfil" 
ON public.users_profile FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.users_profile;
CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
ON public.users_profile FOR UPDATE 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Permitir inserção no perfil para o próprio usuário" ON public.users_profile;
CREATE POLICY "Permitir inserção no perfil para o próprio usuário"
ON public.users_profile FOR INSERT
WITH CHECK (auth.uid() = id);

-- Exemplo de Políticas para registros_peso (Aluno)
DROP POLICY IF EXISTS "Alunos podem ver seus pesos" ON public.registros_peso;
CREATE POLICY "Alunos podem ver seus pesos" 
ON public.registros_peso FOR SELECT 
USING (auth.uid() = aluno_id);

DROP POLICY IF EXISTS "Alunos podem inserir seus pesos" ON public.registros_peso;
CREATE POLICY "Alunos podem inserir seus pesos" 
ON public.registros_peso FOR INSERT 
WITH CHECK (auth.uid() = aluno_id);

-- Adicione políticas para Profissionais acessarem dados de seus alunos vinculados conforme necessário.

-- CAMADA B: Automação via Trigger no Banco de Dados
-- Este script garante que o perfil do usuário seja criado mesmo se o frontend falhar.

-- 1. Garantir que a coluna 'role' existe e tem as restrições corretas
ALTER TABLE public.users_profile 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'aluno';

-- Opcional: Adicionar restrição de check se ainda não existir
-- DO $$ BEGIN
--     ALTER TABLE public.users_profile ADD CONSTRAINT check_role CHECK (role IN ('aluno', 'profissional'));
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;

-- 2. Função para lidar com a criação automática do perfil
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users_profile (id, email, nome, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'nome', 'Usuário'),
    COALESCE(new.raw_user_meta_data->>'role', 'aluno')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger que dispara após a inserção em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

# Configuração do Backend - FitTrack Pro

Siga estes passos para resetar seu Supabase e integrar com o app.

## 1. Reset no Supabase
Execute os arquivos SQL na pasta `/supabase/` no **SQL Editor** do painel do Supabase, na seguinte ordem:
1. `00_schema.sql` (Estrutura de tabelas)
2. `01_trigger_profile.sql` (Automação de perfis)
3. `02_rls.sql` (Segurança)

## 2. Variáveis de Ambiente
Certifique-se de que seu arquivo `.env.local` contém as chaves do seu **NOVO** projeto Supabase:
```env
VITE_SUPABASE_URL=sua-url.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

## 3. Checklist de Testes
- [ ] **Cadastro Aluno**: Crie uma conta e selecione 'Aluno'. Verifique em `users_profile` se o registro apareceu.
- [ ] **Cadastro Profissional**: Crie uma conta e selecione 'Profissional'.
- [ ] **Vínculo**: Como Profissional, acesse "Meus Alunos" e vincule um aluno pelo e-mail.
- [ ] **Registros**: Como Aluno, registre peso no dashboard e carga nos treinos.
- [ ] **Evolution**: Verifique se os gráficos estão exibindo os dados cronologicamente.

---
**Engenharia Fullstack - FitTrack Pro**

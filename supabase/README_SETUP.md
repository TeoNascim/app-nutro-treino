# Configuração do Backend - FitTrack Pro (Fluxo Profissional/Aluno)

Siga estes passos para configurar seu Supabase e habilitar o fluxo completo entre profissionais e alunos.

## 1. Passo a Passo no Supabase

### A. Criar o Banco de Dados
No **SQL Editor** do Supabase, execute os scripts na pasta `/supabase/` na ordem abaixo:
1. `00_schema.sql`: Cria todas as tabelas (perfis, vínculos, treinos, dieta, pesos).
2. `01_trigger_profile.sql`: Garante que todo usuário novo ganhe um perfil automático.
3. `02_rls.sql`: Ativa a segurança (Profissionais gerenciam seus alunos; Alunos veem seu conteúdo).

### B. Configurar Variáveis
No seu arquivo `.env.local`, insira as chaves do seu projeto:
```env
VITE_SUPABASE_URL=seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

## 2. Como o App funciona agora

1. **Login de Profissional**: O profissional entra, vai em "Meus Alunos" e vincula o e-mail de um aluno já cadastrado.
2. **Gestão de Treino/Dieta**: O profissional seleciona o aluno e agora tem permissão total para criar planos de treino e refeições para ele.
3. **Visão do Aluno**: O aluno loga e vê apenas os treinos e dietas que o seu profissional designou.
4. **Registros do Aluno**: O aluno pode lançar seu peso no Dashboard e as cargas usadas em cada exercício no Training.

---
**FitTrack Pro - Engenharia de Performance**

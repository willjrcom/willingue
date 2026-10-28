# Willingue 🎓

Aplicativo de aprendizado de inglês com lições gamificadas. Primeira etapa implementada: **área do aluno**, SQLite, trilhas recursivas, quiz, XP/moedas, recompensas e notificações.

## Ambiente local

Requisitos: Node.js 22, npm.

```bash
cp .env.example .env
# Modifique AUTH_SECRET com uma chave forte de pelo menos 32 caracteres.
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Acesse `http://localhost:3000`. Conta demo (somente se você executar o seed):

- E-mail: `aluno@willingue.app`
- Senha: `Demo@12345`

O seed é **idempotente**: cria trilhas, lições, exercícios e itens da loja, mas não apaga progresso, conquistas ou resgates ao ser executado novamente. Não habilite o seed demonstrativo em produção para alunos reais.

## Variáveis de ambiente do Dokploy

| Nome | Exemplo / descrição |
|---|---|
| `DATABASE_URL` | `file:/app/data/willingue.db` |
| `AUTH_SECRET` | String aleatória com 32+ caracteres; obrigatória para login |
| `DEMO_SEED` | `true` só no ambiente de demonstração; `false` em produção |

No Dokploy, crie um serviço Docker Image:

- **Imagem:** `ghcr.io/willjrcom/willingue:latest`
- **Porta interna / Destination Port:** `3000`
- **Volume persistente:** montar um volume em `/app/data` (obrigatório para não perder SQLite durante redeploy)
- **Health check:** `/api/health` (HTTP 200 com `database: connected`)

O container aplica migrations com `prisma migrate deploy` antes de iniciar a aplicação. Com `DEMO_SEED=true`, também carrega os dados demo sem redefinir os dados do aluno.

**Importante:** configure um backup do volume SQLite antes de usar dados reais. O banco é de instância única; não execute múltiplas réplicas gravando no mesmo arquivo.

## CI/CD

A cada push na `main`, `.github/workflows/docker.yml` executa os testes de lógica, publica a imagem no GHCR e, somente após publicação, chama o webhook do Dokploy pelo secret `DOKPLOY_WEBHOOK_URL`.

É necessário que o Dokploy tenha acesso ao pacote GHCR (público ou credenciais de leitura).

## Módulo do aluno

- Login com e-mail/senha e cookie `HttpOnly` assinado (sessão de 7 dias).
- Trilhas públicas ou atribuídas, com hierarquia de subtrilhas e progresso recursivo.
- Seis modelos de exercício: múltipla escolha, verdadeiro/falso, tradução, completar frases, ordenar palavras e associação.
- Correção no backend; conclusão com 70% de acerto; recompensa em XP/moedas concedida uma única vez por lição.
- XP, evolução de nível, cartões de conquistas e histórico de tentativas.
- Loja de recompensas digitais: avatar de perfil, figurinha exportável em PNG, moldura aplicada a uma imagem local.
- Atividades com prazo, notificações internas e perfil.
- Telas mobile-first, instalação PWA com ícones/manifest.

## Ainda fora desta primeira entrega

Gestão administrativa, geração de conteúdo com IA, responsáveis, financeiro, controle de turmas, botão seguro para recriar demonstração, envio de push e instalação nativa de pacotes de figurinhas no WhatsApp. O módulo de aluno já possui os dados e relações básicos para avançar nessas etapas.

## Validação

```bash
npm run test:unit
npm run build
```

## Perfis de demonstração no login

Com `DEMO_SEED=true`, abaixo do card de login aparecem os botões **Gerar usuário**, **Gerar admin** e **Gerar responsável**. Cada um cria (ou reutiliza) sua conta fixa, mostra as credenciais e oferece **Entrar neste perfil**:

| Perfil | E-mail | Senha |
|---|---|---|
| Aluno | `aluno@willingue.app` | `Demo@12345` |
| Administrador | `admin@willingue.app` | `Demo@12345` |
| Responsável | `responsavel@willingue.app` | `Demo@12345` |

A criação é bloqueada quando `DEMO_SEED` não for `true`; o login e as sessões desses e-mails de demonstração também são recusados após desabilitar a variável. **Não utilize essa modalidade em um ambiente com dados reais:** qualquer visitante da demonstração pode gerar/usar o administrador fictício.

As telas de administrador e responsável são provisórias, apenas para demonstrar entrada por perfil. Cadastros, vínculos, financeiro e dashboards ainda não foram implementados.

## Diagnóstico de autenticação no Dokploy

O `DATABASE_URL` identifica o arquivo SQLite (em produção, `file:/app/data/willingue.db`). **Também é obrigatório configurar `AUTH_SECRET` com 32 ou mais caracteres**: a criação de uma conta demo pode funcionar sem ele, mas o login falhará ao tentar assinar o cookie de sessão. Corrigimos a API para retornar um erro JSON legível quando essa configuração falta, em vez de uma resposta vazia. Os formulários também tratam respostas vazias/HTML sem mostrar o erro técnico `Unexpected end of JSON input`.

Faça **redeploy** depois de configurar as variáveis e confirme o volume persistente em `/app/data`. O erro completo fica no log do serviço no Dokploy.

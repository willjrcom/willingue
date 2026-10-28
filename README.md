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

## Experiência do aluno adaptada à idade

- **Até 11 anos:** interface Kids, mais visual e lúdica.
- **De 12 a 17 anos:** interface Teen, com foco em desafios e linguagem jovem.
- **A partir dos 18 anos:** interface Adulto, mais compacta e objetiva.
- A data de nascimento é opcional. O app calcula o perfil automaticamente a partir dela, quando informada.
- Em **Meu perfil → Aparência do aplicativo**, o aluno pode usar o modo automático ou escolher manualmente um dos três estilos para demonstração e acessibilidade.
- Sem data de nascimento, o modo automático usa a experiência Kids para preservar os cadastros existentes.
- A adaptação altera **apenas a apresentação**: lições, XP, moedas, recompensas, permissões e histórico são os mesmos.
- O banco recebe uma migration incremental: `StudentProfile.birthDate` opcional e `StudentProfile.interfaceMode` padrão `AUTO`.

## Turmas e ranking de lições (MVP)

- Na quinta navegação do aluno, **Minha turma** mostra os colegas pertencentes à mesma turma (apenas apelido/primeiro nome e avatar; não mostra e-mail).
- Classificação por **lições únicas concluídas**, excluindo replays e tentativas; filtros `Esta semana` e `Geral`. Empates recebem a mesma posição.
- Um aluno pode pertencer a várias turmas, com seleção independente. A consulta confere a matrícula antes de exibir os colegas.
- No administrador, **Gerenciar turmas** permite cadastrar/editar/excluir turmas, criar alunos com senha individual e associar/desassociar alunos existentes.
- As operações administrativas exigem sessão com papel `ADMIN`, validação de entrada e verificações de origem.
- Migration incremental cria `Classroom` e `ClassroomMember` sem alterar progresso já registrado.
- Com `DEMO_SEED=true`, a conta Alex é vinculada à **Turma A1 · Exploradores** junto com quatro colegas fictícios que têm lições concluídas para ilustrar o ranking. O seed não altera as conclusões do Alex.

## Edição do perfil e preferências

- O card **Meu perfil** mostra um botão de editar sobre o canto superior direito do avatar, abrindo um modal (sem confirmação nativa).
- O aluno pode atualizar nome, apelido de exibição e escolher entre o avatar padrão e avatares já resgatados. O e-mail é exibido como somente leitura e é gerenciado pela escola.
- A API `POST /api/profile/details` valida o acesso do aluno, os campos, a origem da solicitação e a propriedade de avatares; salva nome e dados de apresentação em uma transação SQLite.
- O card **Preferências** abre `/preferencias`, página separada com os três estilos por idade e data de nascimento. As configurações existentes são mantidas, sem nova migration.
- O progresso, as moedas, as lições e os vínculos com turmas não são afetados.

## Responsáveis, progresso e financeiro

- Contas vinculadas: um aluno pode ter vários responsáveis; um responsável pode acompanhar vários alunos. O responsável financeiro é marcado no vínculo, e cada cobrança possui pagante independente (`GUARDIAN` ou `STUDENT`).
- O responsável autenticado acessa `/responsavel`, `/responsavel/alunos`, `/responsavel/alunos/[id]`, `/responsavel/financeiro`. Consultas de filhos são sempre filtradas pelo vínculo cadastrado, sem revelar dados de outros alunos.
- O progresso é calculado com as trilhas e conclusões reais do banco. Mostra total, percentual, histórico recente, atividades pendentes e movimento na última semana, sem estimar presença ou frequência não cadastrada.
- As cobranças ficam no SQLite, em centavos inteiros, com vencimento e status manual `PENDING`, `PAID`, `CANCELED`; o rótulo `OVERDUE` é calculado ao consultar cobranças vencidas e não pagas.
- O aluno vê suas cobranças em **Meu perfil → Minhas contas**; o responsável tem **Financeiro** como aba principal, podendo filtrar por estudante e situação.
- Administradores poderão cadastrar vínculos e cobranças, escolher pagante e registrar pagamentos manualmente; nenhuma integração bancária está ativa.
- `DEMO_SEED=true` vincula `responsavel@willingue.app` ao Alex e inclui três cobranças fictícias. O seed preserva edições em cobranças preexistentes.

## Operação administrativa de responsáveis e cobranças

- `/administrador/responsaveis`: cadastro de responsáveis com senha inicial (bcrypt), inclusão/remoção de vínculos, identificação de responsável financeiro em cada vínculo.
- `/administrador/financeiro`: criar cobrança manual por aluno, definir pagante (aluno ou responsável já vinculado), acompanhar situação, registrar como paga, reabrir ou cancelar. Alterações não processam transações reais.
- Cobranças e vínculos são modificáveis somente por administrador autenticado, com validação de entrada no servidor. As telas do aluno e do responsável são **somente leitura**.
- A inclusão de uma cobrança gera aviso no sino do aluno e dos responsáveis vinculados. Uma alteração de status também informa as pessoas vinculadas.

## Painel administrativo responsivo

- Navegação lateral no desktop; barra inferior com **Início, Alunos, Turmas, Financeiro e Mais** no celular. Menu **Mais** dá acesso aos demais módulos.
- Dashboard dinâmico com dados de alunos, responsáveis, turmas, lições realizadas, cobranças e últimos eventos.
- Listagem centralizada dos alunos em `/administrador/alunos` com busca, filtros, detalhes, histórico e atribuição de trilhas individuais.
- Rotas de administração protegidas pelo layout de servidor, com autorização validada novamente nas APIs de escrita.

## Catálogo de recompensas

- `/administrador/recompensas` permite cadastrar e editar avatares, figurinhas e molduras, com descrição, emoji/arte padrão, preço, ordem e disponibilidade.
- Exibe contagem real de resgates e permite buscar/filtrar os itens.
- Itens desativados não podem ser comprados novamente, mas permanecem na coleção de quem já os adquiriu. Preços alterados não modificam compras antigas.
- O catálogo atual utiliza o gerador local de PNG/avatares do MVP; upload de artes próprias ainda será uma expansão posterior.

## Editor de aprendizado

- Admin pode criar e editar trilhas e subtrilhas com profundidade livre, ícone/cor, ordem, modo público/atribuído e publicação.
- Pode criar lições, definir XP e moedas, alterar trilha, publicar após criar questões; novas lições são rascunhos por segurança.
- Criar e editar questões dos seis formatos já suportados pelo player. Respostas e opções são validadas no servidor e convertidas em JSON compatível com o sistema atual.
- Para a prevenção de ciclos, a atualização de trilhas valida toda a cadeia ancestral.

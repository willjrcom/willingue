# Willingue

Aplicação Next.js inicial com pipeline GitHub Actions → GHCR → Dokploy.

## Deploy no Dokploy

- Imagem: `ghcr.io/willjrcom/willingue:latest`
- Porta interna: `3000`
- Health check: `GET /api/health`
- Volume persistente reservado para SQLite: `/app/data` (o banco ainda não foi implementado).
- A publicação no GHCR não reinicia automaticamente o serviço: habilite atualização automática da imagem no Dokploy ou configure um webhook de redeploy.
- Caso o pacote GHCR seja privado, configure credenciais de leitura no Dokploy; para pulls anônimos, torne o pacote público no GitHub Packages.

## Desenvolvimento

```bash
npm install
npm run dev
```

**Estado:** infraestrutura e página inicial apenas. Autenticação, banco SQLite, trilhas e demais módulos do MVP serão implementados nas próximas etapas.

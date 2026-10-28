import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const legacySegments = new Set([
  "administrador","responsavel","aprender","atividades","contas","licoes","minha-turma",
  "notificacoes","perfil","preferencias","recompensas","trilhas","alunos","aprendizado",
  "comunicados","configuracoes","financeiro","relatorios","responsaveis","turmas",
  "novo","nova","vincular",
]);
const oldPathSegment = new RegExp("/("+[...legacySegments].join("|")+")(?=/|[\\s\\\"'\x60?#)\\]\\}]|$)","g");

function listSources(folder) {
  return readdirSync(folder).flatMap((name)=>{
    const path=join(folder,name);
    if(statSync(path).isDirectory())return listSources(path);
    return /\\.(?:ts|tsx|mjs)$/.test(path)?[path]:[];
  });
}
test("frontend URL segments and paths remain in English",()=>{
  const files=[...listSources("src"),"prisma/seed.mjs"];
  const violations=[];
  for(const file of files){
    if(file==="src/middleware.ts"||file==="src/lib/route-aliases.ts")continue; // legacy redirect definitions
    const routeDir=relative("src/app",file);
    if(!routeDir.startsWith("..")&&!routeDir.startsWith("api/")){
      const legacy=routeDir.split("/").filter(seg=>legacySegments.has(seg));
      if(legacy.length)violations.push(file+" (old route folder: "+legacy.join(",")+")");
    }
    const source=readFileSync(file,"utf8");
    const found=[...source.matchAll(oldPathSegment)].map(match=>match[0]);
    if(found.length)violations.push(file+" (old links: "+found.join(", ")+")");
  }
  assert.deepEqual(violations,[],"Update legacy hrefs and route folders, not just middleware redirects");
});

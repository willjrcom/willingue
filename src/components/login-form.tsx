"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
export function LoginForm({ demoEnabled }: { demoEnabled: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const result = await response.json();
      if (!response.ok) { setError(result.error || "Não foi possível entrar."); return; }
      router.replace(result.redirect ?? "/aprender"); router.refresh();
    } catch { setError("Não foi possível conectar. Tente novamente."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="login-form">
    <label htmlFor="email">Seu e-mail</label><div className="input-with-icon"><Mail size={19}/><input id="email" type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seuemail@exemplo.com" required/></div>
    <label htmlFor="password">Sua senha</label><div className="input-with-icon"><LockKeyhole size={19}/><input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Digite sua senha" required/><button type="button" className="show-password" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} onClick={()=>setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={19}/> : <Eye size={19}/>}</button></div>
    {error && <p role="alert" className="error-message">{error}</p>}
    <button className="primary-button login-submit" type="submit" disabled={busy}>{busy ? "Entrando..." : "Entrar no Willingue"}<ArrowRight size={19}/></button>
    {demoEnabled && <button type="button" className="demo-button" disabled={busy} onClick={()=>{setEmail("aluno@willingue.app");setPassword("Demo@12345");setError("");}}>✨ Preencher acesso demonstrativo</button>}
    <p className="form-footnote">O acesso dos alunos é criado pela escola.</p>
  </form>;
}

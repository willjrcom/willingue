import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";
import { DemoAccounts } from "@/components/demo-accounts";
import { homeForRole } from "@/lib/role-path";
import { Sparkles, Trophy, WandSparkles } from "lucide-react";

export default async function LoginPage() {
  const user = await currentUser();
  if (user && homeForRole(user) !== "/login") redirect(homeForRole(user));
  return <main className="login-page"><div className="login-deco deco-one"/><div className="login-deco deco-two"/>
    <div className="login-wrap">
      <div className="login-intro"><div className="login-logo"><Sparkles size={28}/> Willingue<span>.</span></div>
        <div className="hero-mascot" aria-hidden="true">🦊<span className="float-star first">✦</span><span className="float-star second">✧</span></div>
        <p className="eyebrow">LEARN • PLAY • GROW</p><h1>Seu inglês vai<br/><span>longe!</span></h1>
        <p>Aprenda no seu ritmo, ganhe moedas e descubra novos desafios todos os dias.</p>
        <div className="login-pills"><span><Trophy size={16}/> Ganhe conquistas</span><span><WandSparkles size={16}/> Evolua brincando</span></div>
      </div>
      <div className="login-actions-column">
        <div className="login-card"><div className="login-heading"><span className="welcome-wave">👋</span><h2>Que bom te ver!</h2><p>Entre para continuar sua aventura.</p></div><LoginForm/></div>
        {process.env.DEMO_SEED === "true" && <DemoAccounts/>}
      </div>
    </div>
  </main>;
}

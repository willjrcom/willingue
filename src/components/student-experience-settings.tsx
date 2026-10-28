"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, SlidersHorizontal } from "lucide-react";
import { readApiJson } from "@/lib/api-client";
import type { StudentExperience, InterfacePreference } from "@/lib/student-experience";

const options: Array<{ id: InterfacePreference; name: string; description: string; icon: string }> = [
  { id: "AUTO", name: "Automático", description: "Acompanha minha idade", icon: "✦" },
  { id: "KIDS", name: "Criança", description: "Mais visual e divertido", icon: "🦊" },
  { id: "TEEN", name: "Jovem", description: "Dinâmico e moderno", icon: "⚡" },
  { id: "ADULT", name: "Adulto", description: "Simples e objetivo", icon: "◉" },
];

const modeLabels: Record<StudentExperience, string> = {
  kids: "Criança",
  teen: "Jovem",
  adult: "Adulto",
};

export function StudentExperienceSettings({
  birthDate: initialBirthDate, preference: initialPreference, effective,
}: { birthDate: string | null; preference: string; effective: StudentExperience }) {
  const router = useRouter();
  const [preference, setPreference] = useState<InterfacePreference>(
    options.some(item => item.id === initialPreference) ? initialPreference as InterfacePreference : "AUTO"
  );
  const [birthDate, setBirthDate] = useState(initialBirthDate ?? "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function save() {
    if (saving) return;
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const response = await fetch("/api/profile/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preference, birthDate: birthDate || null }),
      });
      const data = await readApiJson<{ ok?: boolean; experience?: StudentExperience; error?: string }>(response);
      if (!response.ok) throw new Error(data.error || "Não foi possível salvar sua aparência.");
      setStatus("Aparência atualizada. Seu aprendizado e suas moedas continuam iguais.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  return <section className="experience-settings" aria-labelledby="experience-settings-title">
    <div className="experience-settings-header"><span className="experience-settings-icon"><SlidersHorizontal size={20}/></span>
      <div><h2 id="experience-settings-title">Aparência do aplicativo</h2><p>Seu conteúdo é o mesmo, só muda a forma de navegar.</p></div>
    </div>
    <p className="experience-current">Estilo atual: <strong>{modeLabels[effective]}</strong></p>
    <div className="experience-options" role="group" aria-label="Escolha a aparência">
      {options.map(option => <button type="button" key={option.id}
        className={`experience-option${preference === option.id ? " active" : ""}`}
        aria-pressed={preference === option.id} onClick={() => { setPreference(option.id); setStatus(""); }}>
        <span className="experience-option-icon" aria-hidden="true">{option.icon}</span>
        <strong>{option.name}</strong><small>{option.description}</small>
      </button>)}
    </div>
    <label className="experience-birthdate">Data de nascimento <span>(opcional, para ajuste automático)</span>
      <input type="date" value={birthDate} max={new Date().toISOString().slice(0,10)}
        onChange={e => { setBirthDate(e.target.value); setStatus(""); }}/>
    </label>
    <p className="experience-help">Até 11 anos: criança · 12 a 17: jovem · 18 ou mais: adulto. Você pode escolher outro estilo sem perder seu progresso.</p>
    {error && <p className="error-message" role="alert">{error}</p>}
    {status && <p className="experience-success" role="status"><CheckCircle2 size={17}/>{status}</p>}
    <button className="primary-button experience-save" type="button" onClick={save} disabled={saving}>
      {saving ? "Salvando..." : "Salvar aparência"}
    </button>
  </section>;
}

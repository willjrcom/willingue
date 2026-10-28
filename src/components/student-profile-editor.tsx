"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, X } from "lucide-react";
import { readApiJson } from "@/lib/api-client";

type AvatarOption = { id: string; name: string; icon: string };

export function StudentProfileEditor({ name, nickname, email, avatar, ownedAvatars }: {
  name: string;
  nickname: string;
  email: string;
  avatar: string;
  ownedAvatars: AvatarOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState(name);
  const [displayName, setDisplayName] = useState(nickname);
  const [selectedAvatar, setSelectedAvatar] = useState(avatar);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  const avatarOptions: AvatarOption[] = [
    { id: "default", name: "Raposa padrão", icon: "🦊" },
    ...ownedAvatars.filter(item => item.icon !== "🦊"),
  ];
  if (!avatarOptions.some(item => item.icon === avatar)) {
    avatarOptions.push({ id: "current", name: "Meu avatar atual", icon: avatar });
  }

  useEffect(() => {
    if (!open) return;
    nameRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) setOpen(false);
    };
    document.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onEscape);
    };
  }, [open, submitting]);

  function close() {
    if (submitting) return;
    setOpen(false);
    setError("");
    setFullName(name);
    setDisplayName(nickname);
    setSelectedAvatar(avatar);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/profile/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          nickname: displayName.trim(),
          avatar: selectedAvatar,
        }),
      });
      const data = await readApiJson<{ ok?: boolean; error?: string }>(response);
      if (!response.ok || !data.ok) throw new Error(data.error || "Não foi possível atualizar seu perfil.");
      setOpen(false);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível salvar.");
    } finally {
      setSubmitting(false);
    }
  }

  return <>
    <div className="profile-avatar-wrap">
      <div className="profile-avatar">{avatar}</div>
      <button type="button" className="profile-avatar-edit"
        onClick={() => { setFullName(name); setDisplayName(nickname); setSelectedAvatar(avatar); setError(""); setOpen(true); }}
        aria-label="Editar perfil" title="Editar perfil">
        <Pencil size={18} strokeWidth={2.6}/>
      </button>
    </div>
    {open && <div className="profile-edit-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
      <div className="profile-edit-dialog" role="dialog" aria-modal="true" aria-labelledby="profile-edit-title">
        <div className="profile-edit-header">
          <div><p className="eyebrow muted">MEUS DADOS</p><h2 id="profile-edit-title">Editar perfil</h2></div>
          <button type="button" className="profile-edit-close" onClick={close}
            disabled={submitting} aria-label="Fechar edição"><X size={21}/></button>
        </div>
        <form onSubmit={save} className="profile-edit-form">
          <label className="profile-edit-field">Nome
            <input ref={nameRef} value={fullName} maxLength={100} minLength={2} required
              autoComplete="name" onChange={event => setFullName(event.target.value)}
              placeholder="Seu nome completo"/>
          </label>
          <label className="profile-edit-field">Apelido <span>(exibido no app e na turma)</span>
            <input value={displayName} maxLength={32}
              onChange={event => setDisplayName(event.target.value)}
              placeholder="Como quer ser chamado"/>
          </label>
          <label className="profile-edit-field">E-mail <span>(gerenciado pela escola)</span>
            <input type="email" value={email} readOnly aria-readonly="true"/>
          </label>
          <fieldset className="profile-edit-avatars">
            <legend>Meu avatar</legend>
            <div className="profile-edit-avatar-grid">
              {avatarOptions.map(option => <button type="button" key={option.id}
                aria-label={`Usar avatar: ${option.name}`}
                aria-pressed={selectedAvatar === option.icon}
                className={`profile-edit-avatar${selectedAvatar === option.icon ? " selected" : ""}`}
                onClick={() => setSelectedAvatar(option.icon)}>
                <span>{option.icon}</span>
                <small>{option.name}</small>
                {selectedAvatar === option.icon && <Check size={15} className="profile-edit-avatar-check"/>}
              </button>)}
            </div>
            <p>Para desbloquear mais avatares, visite a loja de recompensas.</p>
          </fieldset>
          {error && <p role="alert" className="error-message">{error}</p>}
          <div className="profile-edit-actions">
            <button type="button" className="secondary-button" disabled={submitting} onClick={close}>Cancelar</button>
            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>}
  </>;
}

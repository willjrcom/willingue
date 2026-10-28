/**
 * UI appearance is independent of lesson access, XP, coins or school enrollment.
 * When no birth date is known, preserve the original kids experience.
 */
export type StudentExperience = "kids" | "teen" | "adult";
export type InterfacePreference = "AUTO" | "KIDS" | "TEEN" | "ADULT";

export function ageOn(birthDate: Date, on: Date = new Date()): number {
  let years = on.getUTCFullYear() - birthDate.getUTCFullYear();
  const birthdayPassed = on.getUTCMonth() > birthDate.getUTCMonth()
    || (on.getUTCMonth() === birthDate.getUTCMonth()
      && on.getUTCDate() >= birthDate.getUTCDate());
  if (!birthdayPassed) years--;
  return years;
}

export function resolveExperience(
  student: { birthDate?: Date | null; interfaceMode?: string | null },
  on: Date = new Date(),
): StudentExperience {
  const override = student.interfaceMode;
  if (override === "KIDS") return "kids";
  if (override === "TEEN") return "teen";
  if (override === "ADULT") return "adult";
  const age = student.birthDate ? ageOn(student.birthDate, on) : null;
  if (age === null || age < 0) return "kids";
  if (age < 12) return "kids";
  return age < 18 ? "teen" : "adult";
}

export const experienceCopy = {
  kids: {
    eyebrow: "SUA AVENTURA CONTINUA ✨",
    hello: "Olá",
    subtitle: "Um pouquinho de inglês por dia faz toda a diferença.",
    bannerTag: "QUE BOM TE VER!",
    bannerTitle: "Pronto para uma nova conquista?",
    bannerText: "Cada lição leva você mais longe.",
    bannerButton: "Continuar aprendendo",
    xpCaption: "Continue assim! ⭐",
    lessonsCaption: "Uma de cada vez 🚀",
    rhythmCaption: "Faça uma lição",
    trailEyebrow: "SEU CAMINHO",
    trailTitle: "Minhas trilhas",
    rewardTitle: "Suas moedas valem prêmios!",
    rewardText: "Desbloqueie avatares, figurinhas e molduras.",
    profileEyebrow: "SUAS CONQUISTAS",
    profileDescription: "Olha só o quanto você já evoluiu!",
    levelLabel: "Explorador nível",
  },
  teen: {
    eyebrow: "SEU PRÓXIMO NÍVEL",
    hello: "E aí",
    subtitle: "Seu progresso começa com mais um desafio.",
    bannerTag: "LEVEL UP",
    bannerTitle: "Evolua no seu ritmo.",
    bannerText: "Seu inglês, suas metas, suas conquistas.",
    bannerButton: "Continuar minha trilha",
    xpCaption: "XP acumulado",
    lessonsCaption: "Seu progresso",
    rhythmCaption: "Bora continuar?",
    trailEyebrow: "ONDE VOCÊ PAROU",
    trailTitle: "Suas trilhas",
    rewardTitle: "Personalize seu perfil",
    rewardText: "Explore itens e avatares desbloqueáveis.",
    profileEyebrow: "SEU DESEMPENHO",
    profileDescription: "Acompanhe sua evolução e personalize sua conta.",
    levelLabel: "Nível",
  },
  adult: {
    eyebrow: "PAINEL DE ESTUDOS",
    hello: "Olá",
    subtitle: "Acompanhe seu aprendizado e retome de onde parou.",
    bannerTag: "CONTINUE SEUS ESTUDOS",
    bannerTitle: "Continue seu aprendizado.",
    bannerText: "Avance nas trilhas no seu próprio ritmo.",
    bannerButton: "Retomar estudos",
    xpCaption: "Experiência acumulada",
    lessonsCaption: "Lições concluídas",
    rhythmCaption: "Pendente hoje",
    trailEyebrow: "PLANO DE APRENDIZADO",
    trailTitle: "Trilhas disponíveis",
    rewardTitle: "Recompensas",
    rewardText: "Personalize sua experiência.",
    profileEyebrow: "MINHA CONTA",
    profileDescription: "Consulte seu desempenho e as configurações da conta.",
    levelLabel: "Nível",
  },
} as const;

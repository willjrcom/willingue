/** Ranking from unique lesson completions; every member only appears once. */
export type RankingStudent = { id: string; name: string; avatar: string; completed: number };
export type RankedStudent = RankingStudent & { place: number };
export function rankClassmates(members: RankingStudent[]): RankedStudent[] {
  const sorted = [...members].sort((a, b) =>
    b.completed - a.completed || a.name.localeCompare(b.name, "pt-BR") || a.id.localeCompare(b.id)
  );
  let previous = -1;
  let place = 0;
  return sorted.map((member, index) => {
    if (member.completed !== previous) place = index + 1;
    previous = member.completed;
    return { ...member, place };
  });
}

/** Week begins on Monday, 00:00 in São Paulo (UTC-3, no DST currently). */
export function startOfSchoolWeek(now: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const get = (key: string) => Number(parts.find(part => part.type === key)?.value);
  const midnightUTC = new Date(Date.UTC(get("year"), get("month") - 1, get("day"), 3));
  const weekday = (midnightUTC.getUTCDay() + 6) % 7;
  midnightUTC.setUTCDate(midnightUTC.getUTCDate() - weekday);
  return midnightUTC;
}

/** Public leaderboard shows a short display name, never a full legal name/email. */
export function publicStudentName(nickname: string | null | undefined, legalName: string): string {
  const name = (nickname?.trim() || legalName.trim() || "Colega").split(/\s+/)[0];
  return name.slice(0, 24);
}

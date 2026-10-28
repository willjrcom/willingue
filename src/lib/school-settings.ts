import { db } from "@/lib/db";

/** Missing settings fall back to defaults without mutating the database on GET. */
export const defaultSchoolSettings = {
  schoolName: "Willingue",
  description: "",
  contactEmail: "",
  defaultLessonXp: 30,
  defaultLessonCoins: 15,
};
export async function getSchoolSettings() {
  const saved = await db.schoolSettings.findUnique({ where: { id: "school" } });
  return saved ?? { ...defaultSchoolSettings, id: "school", updatedAt: null };
}

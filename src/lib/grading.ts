export type QuestionForGrading = { id: string; kind: string; answer: string };

function normalized(value: unknown): string {
  return String(value ?? "").trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[.,!?;:]/g, "").replace(/\s+/g, " ");
}

export function gradeQuestion(question: QuestionForGrading, submitted: unknown): boolean {
  let correct: unknown;
  try { correct = JSON.parse(question.answer); } catch { return false; }
  if (question.kind === "MATCHING") {
    if (!Array.isArray(correct) || !Array.isArray(submitted) || correct.length !== submitted.length) return false;
    return correct.every((item, index) => normalized(item) === normalized(submitted[index]));
  }
  if (question.kind === "ORDER_WORDS") {
    if (!Array.isArray(correct) || !Array.isArray(submitted)) return false;
    return correct.map(normalized).join("|") === submitted.map(normalized).join("|");
  }
  const options = Array.isArray(correct) ? correct : [correct];
  return options.some(answer => normalized(answer) === normalized(submitted));
}

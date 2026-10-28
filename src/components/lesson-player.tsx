"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Coins, RotateCcw, Sparkles, Star, Trophy, Volume2 } from "lucide-react";

type QuestionView = {
  id: string; kind: string; prompt: string;
  options: string[] | { left: string; choices: string[] }[];
};
type Result = { score: number; correct: number; total: number; passed: boolean; earnedXp: number; earnedCoins: number; alreadyCompleted: boolean };

export function LessonPlayer({ lesson, backHref, completed }: {
  lesson: { id: string; title: string; description: string; icon: string; xpReward: number; coinReward: number; questions: QuestionView[] };
  backHref: string; completed: boolean;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [wordIndices, setWordIndices] = useState<Record<string, number[]>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const question = lesson.questions[index];
  const answer = question ? answers[question.id] : undefined;
  const options = question?.options ?? [];
  const stringOptions = options.filter((x): x is string => typeof x === "string");
  const pairs = options.filter((x): x is { left: string; choices: string[] } => typeof x === "object" && x !== null && "left" in x);
  const chosen = wordIndices[question?.id ?? ""] ?? [];
  const canNext = typeof answer === "string" ? answer.trim().length > 0 : Array.isArray(answer) && answer.length > 0 && answer.every(v => v.trim() !== "");
  function update(value: string | string[]) { setAnswers(a => ({ ...a, [question.id]: value })); setError(""); }
  function toggleWord(wordIndex: number) {
    const next = chosen.includes(wordIndex) ? chosen.filter(i => i !== wordIndex) : [...chosen, wordIndex];
    setWordIndices(p => ({ ...p, [question.id]: next }));
    update(next.map(i => stringOptions[i]));
  }
  async function next() {
    if (!canNext) { setError("Escolha ou escreva sua resposta para continuar."); return; }
    if (index < lesson.questions.length - 1) { setIndex(index + 1); setError(""); return; }
    setSubmitting(true); setError("");
    try {
      const response = await fetch(`/api/lessons/${lesson.id}/complete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers: Object.entries(answers).map(([questionId, value]) => ({ questionId, value })) }) });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Não foi possível salvar sua lição."); return; }
      setResult(data); router.refresh();
    } catch { setError("Falha de conexão. Tente novamente para salvar seu progresso."); }
    finally { setSubmitting(false); }
  }
  if (result) return <div className="lesson-result"><div className="result-glow"/><span className="result-icon">{result.passed ? "🏆" : "💪"}</span>
    <p className="eyebrow">{result.passed ? "MISSÃO CUMPRIDA" : "VOCÊ ESTÁ EVOLUINDO"}</p>
    <h1>{result.passed ? "Uau, mandou bem!" : "Quase lá!"}</h1>
    <p>{result.passed ? "Você concluiu mais um desafio!" : "Acerte pelo menos 70% e tente mais uma vez."}</p>
    <div className="result-score"><strong>{result.score}%</strong><span>{result.correct} de {result.total} respostas certas</span></div>
    {result.passed && <div className="result-rewards"><span><Star size={20}/> +{result.earnedXp} XP</span><span><Coins size={20}/> +{result.earnedCoins} moedas</span></div>}
    {result.passed && result.earnedXp === 0 && <small className="already-earned">Você já havia recebido as moedas e o XP desta lição.</small>}
    <div className="result-actions">{!result.passed && <button className="secondary-button" onClick={()=>{setIndex(0);setAnswers({});setWordIndices({});setResult(null);}}><RotateCcw size={18}/> Tentar novamente</button>}
      <Link href={backHref} className="primary-button" onClick={()=>router.refresh()}>{result.passed ? "Continuar jornada" : "Voltar à trilha"}<ArrowRight size={18}/></Link></div>
  </div>;
  if (!question) return <div className="empty-card">Esta lição ainda não possui questões.</div>;
  return <div className="quiz-shell">
    <div className="quiz-top"><Link className="quiz-close" href={backHref}><ArrowLeft size={20}/> Sair</Link><div className="quiz-progress"><span style={{ width: `${Math.round((index+1)/lesson.questions.length*100)}%` }}/></div><span className="quiz-count">{index+1}/{lesson.questions.length}</span></div>
    <div className="quiz-inner"><div className="quiz-intro"><span className="quiz-emoji">{lesson.icon}</span><div><p className="eyebrow muted">{lesson.title.toUpperCase()}</p><h1>{question.prompt}</h1></div></div>
      <div className="question-kind">{question.kind === "MULTIPLE_CHOICE" ? "Escolha a resposta correta" : question.kind === "TRUE_FALSE" ? "Verdadeiro ou falso?" : question.kind === "FILL_BLANK" ? "Complete a frase" : question.kind === "TRANSLATION" ? "Escreva em inglês" : question.kind === "ORDER_WORDS" ? "Monte a frase" : "Encontre as combinações"}</div>
      {(question.kind === "MULTIPLE_CHOICE" || question.kind === "TRUE_FALSE") && <div className="quiz-options">{stringOptions.map((option, i) => <button type="button" className={`option-button ${answer === option ? "selected" : ""}`} key={`${i}-${option}`} onClick={()=>update(option)}><span className="option-letter">{String.fromCharCode(65+i)}</span><span>{option}</span>{answer === option && <Check size={21}/>}</button>)}</div>}
      {(question.kind === "FILL_BLANK" || question.kind === "TRANSLATION") && <div className="quiz-write"><textarea autoFocus rows={3} value={typeof answer === "string" ? answer : ""} onChange={e=>update(e.target.value)} placeholder={question.kind === "TRANSLATION" ? "Digite a tradução aqui..." : "Sua resposta..."}/><small>Não se preocupe com maiúsculas e pontuação.</small></div>}
      {question.kind === "ORDER_WORDS" && <div className="ordering-area"><div className="ordered-answer">{chosen.length ? chosen.map((id, i) => <button type="button" key={`${i}-${id}`} onClick={()=>toggleWord(id)}>{stringOptions[id]} <span>×</span></button>) : <span>Toque nas palavras para montar a frase</span>}</div><div className="word-bank">{stringOptions.map((word, i) => <button type="button" key={`${word}-${i}`} className={chosen.includes(i) ? "taken" : ""} disabled={chosen.includes(i)} onClick={()=>toggleWord(i)}>{word}</button>)}</div></div>}
      {question.kind === "MATCHING" && <div className="matching-area">{pairs.map((pair, i) => {const current = Array.isArray(answer) ? answer : [];return <label key={`${pair.left}-${i}`}><span>{pair.left}</span><select value={current[i] || ""} onChange={e=>{const next = [...current];next[i]=e.target.value;update(next);}}><option value="">Selecione...</option>{pair.choices.map(choice=><option value={choice} key={choice}>{choice}</option>)}</select></label>})}</div>}
      {error && <p role="alert" className="error-message quiz-error">{error}</p>}
      <div className="quiz-footer" style={index === 0 ? { justifyContent: "flex-end" } : undefined}>{index > 0 && <button type="button" className="secondary-button" onClick={()=>setIndex(v=>Math.max(0,v-1))} disabled={submitting}>Voltar</button>}<button className="primary-button" disabled={submitting} onClick={next}>{submitting ? "Salvando..." : index === lesson.questions.length-1 ? "Concluir lição" : "Continuar"}<ArrowRight size={18}/></button></div>
      <div className="quiz-small-rewards"><span><Star size={16}/> {completed ? "Lição já premiada" : `+${lesson.xpReward} XP`}</span><span><Coins size={16}/> {completed ? "Replay" : `+${lesson.coinReward} moedas`}</span></div>
    </div>
  </div>;
}

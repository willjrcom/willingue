import { z } from "zod";

export const pathSchema = z.object({
  title:z.string().trim().min(2).max(100),
  description:z.string().trim().max(400),
  icon:z.string().trim().min(1).max(16),
  color:z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  parentId:z.string().min(1).max(130).nullable(),
  access:z.enum(["PUBLIC","ASSIGNED"]),
  published:z.boolean(),
  position:z.number().int().min(0).max(10000),
}).strict();
export const lessonSchema=z.object({
  pathId:z.string().min(1).max(130),
  title:z.string().trim().min(2).max(120),
  description:z.string().trim().max(300),
  icon:z.string().trim().min(1).max(16),
  position:z.number().int().min(0).max(10000),
  xpReward:z.number().int().min(0).max(10000),
  coinReward:z.number().int().min(0).max(10000),
  published:z.boolean(),
}).strict();
const str=z.string().trim().min(1).max(300);
const matchRow=z.object({left:str,choices:z.array(str).min(2).max(8)});
export const questionSchema=z.object({
  lessonId:z.string().min(1).max(130),
  kind:z.enum(["MULTIPLE_CHOICE","TRUE_FALSE","FILL_BLANK","TRANSLATION","ORDER_WORDS","MATCHING"]),
  prompt:z.string().trim().min(4).max(600),
  explanation:z.string().trim().max(500),
  position:z.number().int().min(0).max(10000),
  options:z.union([z.array(str).max(15),z.array(matchRow).max(10)]),
  answer:z.union([str,z.array(str).min(1).max(15)]),
}).strict();
export function validQuestion(q:z.infer<typeof questionSchema>):boolean {
  if(q.kind==="MULTIPLE_CHOICE")return q.options.length>=2&&q.options.every(v=>typeof v==="string")
    && typeof q.answer==="string"&&(q.options as string[]).includes(q.answer);
  if(q.kind==="TRUE_FALSE")return JSON.stringify(q.options)===JSON.stringify(["Verdadeiro","Falso"])
    && (q.answer==="Verdadeiro"||q.answer==="Falso");
  if(q.kind==="FILL_BLANK"||q.kind==="TRANSLATION")return Array.isArray(q.answer)&&
    q.answer.length>0&&q.options.length===0;
  if(q.kind==="ORDER_WORDS")return Array.isArray(q.answer)&&
    q.answer.length===q.options.length&&q.options.every(v=>typeof v==="string")&&
    JSON.stringify([...q.answer].sort())===JSON.stringify([...(q.options as string[])].sort());
  if(q.kind==="MATCHING")return Array.isArray(q.answer)&&q.answer.length===q.options.length&&
    q.options.every((o,i)=>typeof o==="object"&&o!==null&&"choices" in o&&
      (o as {choices:string[]}).choices.includes((q.answer as string[])[i]));
  return false;
}

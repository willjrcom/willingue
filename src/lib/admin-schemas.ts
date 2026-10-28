import { z } from "zod";

export const rewardSchema=z.object({
  name:z.string().trim().min(2).max(90),
  description:z.string().trim().min(3).max(250),
  icon:z.string().trim().min(1).max(16),
  category:z.enum(["AVATAR","STICKER","FRAME"]),
  price:z.number().int().min(0).max(1000000),
  position:z.number().int().min(0).max(10000),
  active:z.boolean(),
}).strict();

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "astro/zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const soundValidator = z.object({
  id: z.string().uuid(),
  name: z.string().nonempty(),
  fileUrl: z.string().url(),
  fileName: z.string(),
  fileKey: z.string(),
  boardId: z.string().uuid(),
});

export const boardValidator = z.object({
  id: z.string().uuid(),
  name: z.string().nonempty(),
  userId: z.string().uuid(),
});

export function filterDraftSounds(sounds: unknown[]) {
  return sounds.filter((s): s is z.infer<typeof soundValidator> => {
    return soundValidator.safeParse(s).success;
  });
}

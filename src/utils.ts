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

export async function resolveProps<TProps extends Record<string, any>>({
  props,
  request: baseRequest,
}: {
  props: TProps;
  request: Request;
}) {
  // TODO: robust check if this is a form request
  if (baseRequest.method !== "POST") return props;

  const request = baseRequest.clone();
  const formData = await request.formData();

  for (const [key, rawValue] of formData.entries()) {
    if (!key.startsWith("__partial")) continue;
    const [type, value] = encodedTypeSchema.parse(rawValue);

    let parsedValue: string | boolean | number | Date | undefined = undefined;

    if (type === "string") {
      const v = getStringField(value);
      if (v === null)
        throw new Error(`Failed to parse form data for key ${key}`);
      parsedValue = v;
    } else if (type === "date") {
      const v = getStringField(value);
      if (v === null)
        throw new Error(`Failed to parse form data for key ${key}`);
      parsedValue = new Date(v);
    } else if (typeof rawValue === "boolean") {
      parsedValue = getCheckboxField(value);
    } else if (typeof rawValue === "number") {
      const v = getNumberField(value);
      if (v === null)
        throw new Error(`Failed to parse form data for key ${key}`);
      parsedValue = v;
    }
    // @ts-ignore We can't guarantee your form values match your props interface.
    // We assume the user has the form input utility to encode these inputs appropriately.
    props[key.replace(/^__partial/, "")] = parsedValue;
  }

  return props;
}

type EncodedType =
  | `string:${string}`
  | `number:${number}`
  | `boolean:${boolean}`
  | `date:${string}`;

const typePrefixRegex = /^(string|number|boolean|date):/;

const encodedTypeSchema = z
  .string()
  .regex(typePrefixRegex, "Encoded type missing")
  .transform((encodedValue) => {
    const typeMatch = encodedValue.match(typePrefixRegex);
    if (!typeMatch) throw new Error("Encoded type missing");

    const type = typeMatch[1] as "string" | "number" | "boolean" | "date";
    const value = encodedValue.replace(typePrefixRegex, "");
    return [type, value];
  });

// TODO: encrypt / decrypt with crypto
// Just encoding value with base type for now
export function encodeTypeInValue(value: any): EncodedType {
  if (typeof value === "string") {
    return `string:${value}`;
  } else if (typeof value === "number") {
    return `number:${value}`;
  } else if (typeof value === "boolean") {
    return `boolean:${value}`;
  } else if (value instanceof Date) {
    return `date:${value.toISOString()}`;
  }
  throw new Error(`Unsupported type ${typeof value}`);
}

function getNumberField(value: unknown): number | null {
  const valueStr = getStringField(value);
  if (!valueStr) return null;
  const parsedValue = Number(valueStr);
  if (isNaN(parsedValue)) return null;
  return parsedValue;
}

function getStringField(value: unknown): string | null {
  if (value && typeof value === "string") {
    return value;
  }
  return null;
}

function getCheckboxField(value: unknown): boolean {
  const valueStr = getStringField(value);
  return valueStr === "on";
}

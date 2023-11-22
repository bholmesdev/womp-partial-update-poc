import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "astro/zod";
import { parse as devalueParse } from "devalue";

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

const partialPropsSchema = z.record(z.any());

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
  const stringifiedProps = formData.get("__partialProps");
  if (typeof stringifiedProps !== "string") return props;

  const parsedProps = partialPropsSchema.safeParse(
    devalueParse(stringifiedProps)
  );
  if (!parsedProps.success) {
    throw new Error(
      `[simple:partial] Props on request ${JSON.stringify(
        request.url
      )} are malformed. Did you modify the <simple-partial> root element?`
    );
  }

  for (const [key, value] of Object.entries(parsedProps.data)) {
    // @ts-expect-error We can't guarantee type safety of the decoded props.
    // We assume the user has not tampered with the <simple-partial> component if props are a valid object.
    props[key] = value;
  }
  return props;
}

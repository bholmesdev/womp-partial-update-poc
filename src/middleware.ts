import type { ValidRedirectStatus } from "astro";
import { defineMiddleware } from "astro:middleware";

export type SearchParams = Record<
  string,
  string | number | boolean | undefined
>;

export type PartialRedirectPayload = {
  status: ValidRedirectStatus;
  location: string;
};

export const onRequest = defineMiddleware(({ request, locals }, next) => {
  locals.partial = {
    formAction: `?_partial=${new URL(request.url).pathname}`,
    redirect: (path: string, status?: ValidRedirectStatus) => {
      // Return redirect payload as JSON to be handled by client
      const payload: PartialRedirectPayload = {
        status: status ?? 302,
        location: path,
      };
      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: {
          "X-Partial-Redirect": "true",
          "Content-Type": "application/json",
        },
      });
    },
    async getSearchParams<T extends SearchParams>() {
      const searchParams = new URLSearchParams(request.url.split("?")[1]);
      const data: SearchParams = {};

      for (const key of searchParams.keys()) {
        const [value, type] = searchParams.getAll(key);
        switch (type) {
          case "number":
            data[key] = Number(value);
            break;
          case "boolean":
            data[key] = value === "true";
            break;
          case "string":
          default:
            data[key] = value;
            break;
        }
      }

      // Type cast is the best we can do without runtime validation
      return data as T;
    },
  };

  next();
});

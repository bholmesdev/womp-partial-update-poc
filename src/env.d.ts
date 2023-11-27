/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    form: {
      getData<T extends import("astro/zod").ZodRawShape>(
        type: string | undefined,
        validator: T
      ): Promise<
        | import("astro/zod").SafeParseReturnType<
            import("astro/zod").input<import("astro/zod").ZodObject<T>>,
            import("astro/zod").output<import("astro/zod").ZodObject<T>>
          >
        | undefined
      >;
    };
    partial: {
      getSearchParams<
        T extends Record<string, string | boolean | number | undefined>
      >(): Promise<T>;
      formAction: string;
      redirect: (
        path: string,
        status?: ValidRedirectStatus | undefined
      ) => Response;
    };
  }
}

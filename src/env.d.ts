/// <reference types="astro/client" />
/// <reference types="simple-stack-form/types" />

declare namespace App {
  interface Locals {
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

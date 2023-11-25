/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    getFormData(type?: string): Promise<FormData | undefined>;
    partial: {
      getSearchParams<
        T extends Record<string, string | boolean | number | undefined>
      >(): Promise<T>;
      action: string;
    };
  }
}

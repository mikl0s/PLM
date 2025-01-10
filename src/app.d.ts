// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    interface Error {
      message: string;
      status?: number;
    }
    interface Locals {
      user?: {
        id: string;
        username: string;
        isAdmin: boolean;
      };
    }
    interface PageData {
      user?: {
        id: string;
        username: string;
        isAdmin: boolean;
      };
    }
    interface Platform {}
  }
}

export {};

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		interface PageState {
			selected?: { email: import('$lib/api').Email | null };
		}
		// interface Platform {}
	}
}

export {};

import environment from "./environment.js"
import App from './app/App.svelte';

const app = new App({
	target: document.body,
	props: {
		env : environment
	}
})

export default app;
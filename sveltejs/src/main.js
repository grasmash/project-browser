import App from './App.svelte';

const app = new App({
	// The #project-browser markup is returned by the project_browser.browse Drupal route.
	target: document.querySelector('#project-browser'),
	props: {
	}
});

export default app;

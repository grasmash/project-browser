<script>
	import RemoteTable from "./RemoteTable.svelte";
	import { onMount } from "svelte";
	import Modal from './Modal.svelte';
	import { modal } from './stores.js';
	let data = [];
	onMount(async () => {
		// todo Make this URL dynamic. It would work to simply change this to
		// "/drupal-org-proxy/project" for when the Svelete JS is loaded within a Drupal page,
		// but that would not work during development when viewing the Svelte app on http://localhost:5000/.
		const res = await fetch(`http://local.project-browser.com/drupal-org-proxy/project`);
		data = await res.json();
	});
</script>

<main>
	<div id="project-browser">
		<RemoteTable />
	</div>
	<Modal show={$modal}>
	</Modal>
</main>

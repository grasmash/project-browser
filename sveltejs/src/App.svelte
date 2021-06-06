<script>
	import LocalTable from "./LocalTable.svelte";
	import RemoteTable from "./RemoteTable.svelte";
	import { onMount } from "svelte";
	let data = [];
	onMount(async () => {
		const res = await fetch(`http://local.project-browser.com/drupal-org-proxy/project`);
		data = await res.json();
	});
</script>

<main>
	<h1>Project Browser</h1>
	<div id="project-browser">
		<RemoteTable />
	</div>
</main>

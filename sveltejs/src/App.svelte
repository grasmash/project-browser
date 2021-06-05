<script>
	import { onMount } from "svelte";
	import ProjectListing from './projectListing.svelte';
	let data = [];
	onMount(async () => {
		const res = await fetch(`http://local.project-browser.com/drupal-org-proxy/project`);
		data = await res.json();
		console.log(data);
	});
</script>

<main>
	<h1>Project Browser</h1>
	<div id="project-browser">
		{#each data.list || [] as project }
			<ProjectListing {...project} />
		{/each}
		// @todo Handle error state.
		// @todo Handle empty state.
	</div>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>

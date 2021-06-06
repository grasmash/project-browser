<script>
	import { onMount } from "svelte";
	import ProjectListing from './projectListing.svelte';
	let data = [];
	onMount(async () => {
		const res = await fetch(`/drupal-org-proxy/project`);
		data = await res.json();
		console.log(data);
	});
</script>

<main>
	<h1>Project Browser</h1>
	<div id="project-browser">
		<div id="filters">
			<form>
				<label>Title</label>
				<input type="text" name="title"/>
				<label for="maintenance_status">Maintenance status:</label>
				<select name="maintenance_status" id="maintenance_status">
					<option value="example">example</option>
				</select>

				<label for="development_status">Development status:</label>
				<select name="development_status" id="development_status">
					<option value="example">example</option>
				</select>

				<label for="categories">Categories:</label>
				<select name="categories" id="categories">
					<option value="example">example</option>
				</select>

				<label for="status">Status:</label>
				<select name="status" id="status">
					<option value="example">example</option>
				</select>

				<label for="stability">Stability:</label>
				<select name="stability" id="stability">
					<option value="example">example</option>
				</select>

				<label for="security">Security advisory coverage:</label>
				<select name="security" id="security">
					<option value="example">example</option>
				</select>

				<input type="submit" value="Search">
			</form>
		</div>
		<div id="projects">
			{#each data.list || [] as project }
				<ProjectListing {...project} />
			{/each}
			// @todo Handle error state.
			// @todo Handle empty state.
		</div>

		<div>
			// @todo Add a pager!
		</div>
	</div>
</main>

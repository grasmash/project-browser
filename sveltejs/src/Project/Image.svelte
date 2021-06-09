<script>
    import { fetchEntity } from "./project.js";
    export let field_project_images;
</script>
<style>
    img {
        width: 150px;
        border-radius: 5px;
    }
</style>
{#if typeof field_project_images !== "undefined" && field_project_images.length}
    {#await fetchEntity(field_project_images[0].file.uri)}
        <span>...waiting</span>
    {:then file}
        <img src="{file.url}" alt="{field_project_images[0].alt}"/>
    {:catch error}
        <span style="color: red">{error.message}</span>
    {/await}
{:else}
    <img src="/{drupalSettings.project_browser.module_path}/images/placeholder-image.png" alt="Placeholder image"/>
{/if}

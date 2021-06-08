<script>
    import { fetchEntity } from "./project.js";
    export let field_project_images;
</script>
{#if typeof field_project_images !== "undefined" && field_project_images.length}
    {#await fetchEntity(field_project_images[0].file.uri)}
        <span>...waiting</span>
    {:then file}
        <span><img src="{file.url}" alt="{field_project_images[0].alt}"/></span>
    {:catch error}
        <span style="color: red">{error.message}</span>
    {/await}
{:else}
    <span>no image</span>
{/if}

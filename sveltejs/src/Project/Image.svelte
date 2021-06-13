<script>
    import { fetchEntity } from "./project.js";
    export let field_project_images;
</script>
<style>
    img {
        display: none;
    }
    /* Small devices (portrait tablets and large phones, 600px and up) */
    @media only screen and (min-width: 600px) {
        img {
            display: block;
            width: 100px;
            border-radius: 5px;
        }
    }
</style>
{#if typeof field_project_images !== "undefined" && field_project_images.length}
    <!-- @todo make clickable and show all images in modal carousel or something -->
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

<script>
    import { fetchEntity } from "./project.js";
    export let taxonomy_term_reference;
    export let wrapper_class;
</script>
<style>
    span {
        cursor: pointer;
    }
</style>
{#if taxonomy_term_reference}
    <div class="{wrapper_class}">
        {#await fetchEntity(taxonomy_term_reference.uri)}
            <span>Loading...</span>
        {:then term}
            <span title="{term.description.replace(/(<([^>]+)>)/gi, '')}">{term.name}</span>
        {:catch error}
            <span style="color: red">{error.message}</span>
        {/await}
    </div>
{/if}


<script>
    import { fetchEntity } from "./project.js";
    export let taxonomy_vocabulary_3;
</script>
<style>
    .categories {
        clear: both;
        margin-top: 1em;
    }
    .categories ul {
        margin: 0;
        padding: 0;
    }
    .categories li {
        list-style: none;
        text-transform: lowercase;
        display: inline-block;
        margin-top: 5px;
        margin-bottom: 5px;
        margin-right: 5px;
        padding: 2px 5px;
        border: 1px solid #d5d5d5;
        border-radius: 3px;
        background-color: #f0f0f0;
    }
</style>
<div class="categories" data-label="Categories">
    {#if typeof taxonomy_vocabulary_3 !== "undefined" && taxonomy_vocabulary_3.length}
        <ul>
            {#each taxonomy_vocabulary_3 || [] as category}
                {#await fetchEntity(category.uri)}
                    <p>...waiting</p>
                {:then term}
                    <li class="category">{term.name}</li>
                {:catch error}
                    <p style="color: red">{error.message}</p>
                {/await}
            {/each}
        </ul>
    {/if}
</div>

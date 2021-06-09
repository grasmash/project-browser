<script>
    import { fetchEntity } from "./project.js";
    export let field_supporting_organizations;
</script>

<style>
    .supporting-organizations {
        font-style: italic;
    }
</style>
{#if typeof field_supporting_organizations !== "undefined" && field_supporting_organizations.length}
    <div class="supporting-organizations">
        <span>with support from</span>
        {#each field_supporting_organizations || [] as field_collection}
            {#await fetchEntity(field_collection.uri)}
            {:then item}
                {#await fetchEntity(item.field_supporting_organization.uri)}
                {:then organization}
                    <span class="organization"><a href="{organization.url}" target="_blank">{organization.title}</a>{#if field_supporting_organizations[field_supporting_organizations.length - 1].id !== field_collection.id},{/if}</span>
                {:catch error}
                    <span style="color: red">{error.message}</span>
                {/await}
            {:catch error}
                <span style="color: red">{error.message}</span>
            {/await}
        {/each}
    </div>
{/if}


<script>
    export let project_usage;
    let core_compatibility;
    if (typeof drupalSettings !== 'undefined') {
        core_compatibility = drupalSettings.project_browser.core_compatibility;
    }
</script>
<div class="usage" data-label="Usage">
    {#if project_usage}
        <ul>
            {#each Object.entries(project_usage) as [key, val] (key) }
                <li>{key}: {val} active installations</li>
            {/each}
        </ul>
    {:else}
        <span>No reported usage.</span>
    {/if}
</div>
<style>
    .usage {
        position: absolute;
        top: 10px;
        right: 10px;
    }
    ul {
        margin: 0;
        padding: 0;
    }
    li {
        list-style: none;
        text-transform: lowercase;
    }
</style>

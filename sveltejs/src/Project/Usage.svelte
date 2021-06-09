<script>
    export let project_usage;
    let core_compatibility;
    let project_is_compatible;

    if (typeof drupalSettings !== 'undefined') {
        core_compatibility = drupalSettings.project_browser.core_compatibility;
    }

    function isCompatible(module_version) {
        let version_is_compatible;
        version_is_compatible = String(module_version).substring(0, 3) === drupalSettings.project_browser.drupal_core_compatibility
        if (version_is_compatible) {
            project_is_compatible = true;
        }
        return version_is_compatible;
    }
</script>
<div class="usage" data-label="Usage">
    {#if project_usage}
        <div class="short">
            <ul>
                {#each Object.entries(project_usage) as [key, val] (key) }
                    {#if isCompatible(key)}
                        <li>
                            <span class="check">&#x2714;</span> {key}: {val} active installations
                        </li>
                    {/if}
                {/each}
            </ul>
        </div>
        <div class="full hidden">
            <ul>
                {#each Object.entries(project_usage) as [key, val] (key) }
                    <li>
                        {#if isCompatible(key)}<span class="check">&#x2714;</span> {/if}{key}: {val} active installations
                    </li>
                {/each}
            </ul>
        </div>
    {:else}
        <span>No reported usage.</span>
    {/if}
</div>
<div class="compatible">
    {#if project_is_compatible}
        &#x2714; This project has a release that is compatible with your Drupal installation
    {/if}
</div>
<style>
    .hidden {
        display: none;
    }
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
    .compatible {
        color: green;
        font-size: .8em;
        padding: .5em;
    }
    .check {
        color: green;
    }
</style>

<script>
    export let project_usage;
    export let project_usage_total;
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
        <div class="total"><span title="This total includes usage data from versions that are not compatible with your installation and therefore not displayed here">{project_usage_total} active installations [all branches]</span></div>
        <div class="project-usage">
            <ul>
                {#each Object.entries(project_usage) as [key, val] (key) }
                    {#if isCompatible(key)}
                        <li>
                            <span class="check">&#x2714;</span>{val} active installations [{key} branch]
                        </li>
                    {/if}
                {/each}
            </ul>
        </div>
    {:else}
        <span>No reported usage.</span>
    {/if}
</div>
<div class="compatibility">
    {#if project_is_compatible}
        <span class="compatible">&#x2714; Compatible with your Drupal installation</span>
    {:else}
        <span class="not-compatible">Not compatible with your Drupal installation.</span>
    {/if}
</div>
<style>
    .hidden {
        display: none;
    }
    .usage {
        float: right;
        clear: right;
        text-align: right;
    }
    ul {
        margin: 0;
        padding: 0;
    }
    li {
        list-style: none;
        text-transform: lowercase;
    }
    .compatibility {
        padding: .25em;
        float: right;
        clear: right;
    }
    .compatible {
        color: green;
    }
    .not-compatible {
        color: red;
    }
    .check {
        color: green;
    }
    .total span {
        cursor: pointer;
    }
</style>

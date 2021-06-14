<script>
    export let project;
    export let project_usage;
    export let project_usage_total;
</script>
<div class="usage" data-label="Usage">
    {#if project_usage}
        <div class="total">
            <a href="https://www.drupal.org/project/usage/{project.field_project_machine_name}" title="This total includes usage data from versions that are not compatible with your installation." target="_blank">{new Intl.NumberFormat('en-US').format(project_usage_total)} active installations (all branches)</a>
        </div>
        <div class="project-usage">
            <ul>
                {#each Object.entries(project_usage) as [key, val] (key) }
                    <li>
                        <span class="check">&#x2714;</span>{new Intl.NumberFormat('en-US').format(val)} active installations [{key} branch]
                    </li>
                {/each}
            </ul>
        </div>
    {:else}
        <span>No reported usage.</span>
    {/if}
</div>
<style>
    .project-usage {
        display: none;
    }
    ul {
        margin: 0;
        padding: 0;
    }
    li {
        list-style: none;
        text-transform: lowercase;
    }
    .check {
        color: green;
    }
    a {
        text-decoration: none;
    }
</style>

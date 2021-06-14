<script>
    export let project_name;
    let releases = [];
    let project_is_compatible = false;

    function getContent(xmlObj, tagName) {
        return xmlObj.getElementsByTagName(tagName)[0].textContent
    }

    async function fetchReleases(project_name) {
        let releases;
        const response = await fetch("/drupal-org-proxy/project/releases?project=" + project_name);
        if (response.ok) {
            releases = await response.json();
            releases.forEach(checkCompatibility);
            return releases;

        } else {
            return [];
        }
    }

    function checkCompatibility(release, index) {
        if (release.is_compatible) {
            project_is_compatible = true;
        }
    }
</script>
<style>
    .compatible {
        color: green;
    }
    .not-compatible {
        color: red;
    }
</style>
<div class="compatibility">
    {#if project_is_compatible}
        <span class="compatible"><span class="check">&#x2714;</span> Compatible with your Drupal installation</span>
    {:else}
        <span class="not-compatible">Not compatible with your Drupal installation.</span>
    {/if}
</div>
<div class="releases">
    {#await fetchReleases(project_name)}
        <span>Loading...</span>
    {:then releases}
        {#each releases || [] as release}
            {#if release.is_compatible}
                <span><a href="{release.release_link}" target="_blank">{release.version}</a>&nbsp;</span>
            {/if}
        {/each}
    {:catch error}
        <span style="color: red">{error.message}</span>
    {/await}
</div>

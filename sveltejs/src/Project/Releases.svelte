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
            releases = releases.filter(filterCompatibleReleases);
            console.log(releases);
            return releases;

        } else {
            return [];
        }
    }

    function filterCompatibleReleases(release) {
        if (release.is_compatible) {
            project_is_compatible = true;
            return true;
        }
        return false;
    }
</script>
<style>
    .compatible {
        color: green;
    }
    .not-compatible {
        color: red;
    }
    a {
        text-decoration: none;
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
            <span><a href="{release.release_link}" target="_blank">{release.version}</a>{#if releases[releases.length - 1].tag !== release.tag},{/if}&nbsp;</span>
        {/each}
    {:catch error}
        <span style="color: red">{error.message}</span>
    {/await}
</div>

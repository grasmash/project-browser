<script>
    export let project;
    import ActionButton from './ActionButton.svelte';
    import SupportingOrganization from './SupportingOrganization.svelte';
    import Image from './Image.svelte';
    import Categories from './Categories.svelte';
    import Usage from './Usage.svelte';
    import LastUpdated from './LastUpdated.svelte';
    import SecurityCoverage from './SecurityCoverage.svelte';
</script>
<style>
.project {
    width: 49%;
    border: 1px solid black;
    border-radius: 5px;
    background: #ccc;
    margin-bottom: 1em;
}
.main {
    display: flex;
    background: white;
    height: 250px;
    position: relative;
    padding: 1em;
}
.left {
    min-width: 150px;
    width: 150px;
    overflow: hidden;
    margin: 0 1em 0 0;
    text-align: center;
    display: flex;
    align-items: flex-start;
}
.right {
    padding: 1em .5em;
}
.body {
    margin: 0 0 1em 0;
}
.metadata {
    clear: both;
    padding: 1em;
    position: relative;
}
.stars {
    float: right;
    clear: right;
}
.more {
    margin: 1em 0 0 0;
}
</style>
<div class="project">
    <div class="main">
        <ActionButton project={project}/>
        <div class="left">
            <Image field_project_images={project.field_project_images}/>
        </div>
        <div class="right">
            <h2>
                <a href="{project.url}" target="_blank">{project.title}</a>
                <SecurityCoverage coverage={project.field_security_advisory_coverage}/>
            </h2>
            <div class="body">{@html project.body.summary}</div>
            <div class="author">By <a href="https://www.drupal.org/user/{project.author.id}" target="_blank">{project.author.name}</a></div>
            <SupportingOrganization field_supporting_organizations={project.field_supporting_organizations} />
            <div class="more"><a href="{project.url}" target="_blank">More details</a></div>
        </div>
    </div>
    <div class="metadata">
        <div class="stars">Starred by {project.flag_project_star_user_count} users</div>
        <Usage project_usage={project.project_usage}/>
        <div data-label="Maintenance status">
            {#if project.taxonomy_vocabulary_44}
                {project.maintenance_status}
            {:else}
                <span>Unknown</span>
            {/if}
        </div>
        <div data-label="Development status">
            {#if project.taxonomy_vocabulary_46}
                {project.development_status}
            {:else}
                <span>Unknown</span>
            {/if}
        </div>
        <LastUpdated changed={project.changed} />
        <Categories taxonomy_vocabulary_3={project.taxonomy_vocabulary_3}/>
    </div>
</div>

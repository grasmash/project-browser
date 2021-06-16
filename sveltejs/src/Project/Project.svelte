<script>
    export let project;
    import ActionButton from './ActionButton.svelte';
    import SupportingOrganization from './SupportingOrganization.svelte';
    import Image from './Image.svelte';
    import Categories from './Categories.svelte';
    import Usage from './Usage.svelte';
    import LastUpdated from './LastUpdated.svelte';
    import SecurityCoverage from './SecurityCoverage.svelte';
    import TaxonomyTerm from "./TaxonomyTerm.svelte";
    import Releases from "./Releases.svelte";
</script>
<style>
    .project {
        width: 100%;
    }

    /* Small devices (portrait tablets and large phones, 600px and up) */
    @media only screen and (min-width: 600px) {
        .left {
            min-width: 100px;
            width: 100px;
            overflow: hidden;
            margin: 0 1em 0 0;
            text-align: center;
            display: flex;
            align-items: flex-start;
        }
        .metadata .right {
            float: right;
            clear: right;
            text-align: right;
            width: 50%;
        }
    }

    /* Large devices (laptops/desktops, 992px and up) */
    @media only screen and (min-width: 992px) {
        .project {
            width: 49%;
        }
    }
.project {
    border: 1px solid black;
    margin-bottom: 1em;
    border: 1px solid rgba(212, 212, 218, 0.8);
    border-radius: 2px;
    background-color: #f0f5fd;
    box-shadow: 0 4px 10px rgb(0 0 0 / 10%);
}
h3 {
    margin-right: 5em;
    margin-top: .25em;
}
h3 a {
    text-decoration: none;
}
.main {
    display: flex;
    background: white;
    min-height: 275px;
    position: relative;
    padding: 1em;
}
.body {
    margin: 0 0 1em 0;
}
.metadata {
    clear: both;
    padding: 1em;
    position: relative;
    font-size: .9em;
}
.suffix {
    font-size: .9em;
}
.author a {
    text-decoration: none;
}
</style>
<div class="project">
    <div class="main">
        <ActionButton project={project}/>
        <div class="left">
            <Image field_project_images={project.field_project_images}/>
        </div>
        <div class="right">
            <h3>
                <a href="{project.url}" target="_blank">{project.title}</a>
                <SecurityCoverage coverage={project.field_security_advisory_coverage}/>
            </h3>
            <div class="body">{@html project.body.summary}</div>
            <div class="suffix">
                {#if project.author}
                    <div class="author">By <a href="https://www.drupal.org/user/{project.author.id}" target="_blank">{project.author.name}</a></div>
                {/if}
                <SupportingOrganization field_supporting_organizations={project.field_supporting_organizations} />
            </div>
        </div>
    </div>
    <div class="metadata">
        <div class="right">
            <Usage project_usage={project.project_usage} project_usage_total={project.project_usage_total} project={project} />
            <Releases project_name={project.field_project_machine_name} />
        </div>
        <TaxonomyTerm taxonomy_term_reference={project.taxonomy_vocabulary_44} wrapper_class="maintenance-status" />
        <TaxonomyTerm taxonomy_term_reference={project.taxonomy_vocabulary_46} wrapper_class="development-status" />
        <!--        <LastUpdated changed={project.changed_ago} />-->
        <div class="stars"><span title="Starred by {project.flag_project_star_user_count} users">&#11088;&nbsp;&nbsp;{project.flag_project_star_user_count}</span></div>
        <Categories taxonomy_vocabulary_3={project.taxonomy_vocabulary_3}/>
    </div>
</div>

<script>
    export let created;
    export let changed;
    export let sticky;
    export let promote;
    export let status;
    export let edit_url;
    export let language;
    export let type;
    export let is_new;
    export let vid;
    export let nid;
    export let flag_project_star_user;
    export let field_issue_summary_template;
    export let field_replaced_by;
    export let field_next_major_version_info;
    export let field_project_ecosystem;
    export let field_security_advisory_coverage;
    export let field_project_issue_version_opts;
    export let field_project_docs;
    export let field_supporting_organizations = [];
    export let field_project_images = [];
    export let field_project_license = {};
    export let field_project_screenshots = [];
    export let field_project_documentation = {};
    export let field_project_demo = {};
    export let upload = [];
    export let title;
    export let url;
    export let body = {summary: ''}
    export let field_project_components = [];
    export let project_usage = {};
    export let field_project_changelog;
    export let field_project_homepage;
    export let field_release_version_format;
    export let field_project_has_releases;
    export let field_project_issue_guidelines;
    export let field_project_default_component;
    export let field_project_has_issue_queue;
    export let field_project_machine_name;
    export let field_project_type;
    export let taxonomy_vocabulary_44;
    export let taxonomy_vocabulary_3;
    export let taxonomy_vocabulary_46;
    export let last_comment_timestamp;
    export let has_new_content;
    export let flag_tracker_follower_count;
    export let feed_nid;
    export let feeds_item_url;
    export let feeds_item_guid;
    export let comment_count_new;
    export let comment_count;
    export let comments;
    export let comment;
    export let book_ancestors;
    export let author = {};
    // @todo Add stability level.
    // @todo
    // @todo
    // @todo
</script>
<div class="project">
    <div class="title"><a href="{url}">{title}</a></div>
    <div class="summary">{@html body.summary}</div>
    <div class="created">
        <span class="label">Created</span> {created}</div>
    <div class="components">
        <span class="label">Components:</span>
        <ul>
            {#each field_project_components as component}
                <li class="component">{component}</li>
            {/each}
        </ul>
    </div>
    <div class="usage">
        <span class="label">Usage:</span>
        {#if project_usage}
            <ul>
                {#each Object.entries(project_usage) as [key, val] (key) }
                    <li>{key}: {val} installs</li>
                {/each}
            </ul>
        {:else}
            <span>No reported usage.</span>
        {/if}
    </div>
</div>

<style>
    main {
        text-align: center;
        padding: 1em;
        max-width: 240px;
        margin: 0 auto;
    }

    h1 {
        color: #ff3e00;
        text-transform: uppercase;
        font-size: 4em;
        font-weight: 100;
    }

    .project {
        border-top: 1px solid #cccccc;
        text-align: left;
        padding: 1em;
    }

    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }
</style>

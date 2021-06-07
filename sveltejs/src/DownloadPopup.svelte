<script>
    export let project;
</script>

<style>
    h2 {
        font-size: 1.25rem;
        margin-bottom: 2em;
    }
    pre {
        background-color: #282c34;
        border-radius: 6px;
        font-size: 1em;
        text-align: left;
        white-space: pre;
        word-spacing: normal;
        word-break: normal;
        word-wrap: normal;
        color: #ccc;
        font-family: Consolas,Monaco,Andale Mono,Ubuntu Mono,monospace;
        tab-size: 4;
        hyphens: none;
        line-height: 1.4;
        padding: 1.25rem 1.5rem;
        margin: .85rem 0;
        overflow: auto;
    }
</style>

<h2>Download {project.title}</h2>

<p>The recommended way to download any Drupal module is with Composer. If you already manage your Drupal application
    dependencies with Composer, simply open your CLI and run the following command from the Composer root directory
for your application:</p>
<pre>
    composer require drupal/{project.field_project_machine_name} --with-all-dependencies
</pre>

This will add the module to your codebase. You will then need to enable it via Drupal. You can either use `drush` from
the CLI, or you can visit the <a href="/admin/modules">modules page</a>.

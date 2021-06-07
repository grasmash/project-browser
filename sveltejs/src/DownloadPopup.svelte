<script>
    export let project;
</script>

<style>
    h2 {
        font-size: 1.25rem;
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

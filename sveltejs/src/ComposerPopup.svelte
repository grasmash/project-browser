<script>
    export let project;
</script>

<style>
    h1 {
        font-size: 2rem;
        text-align: center;
    }
    h2 {
        font-size: 1.25rem;
    }
</style>

<h2>Install {project.title}</h2>

<p>The recommended way to install any Drupal module is with Composer. If you already manage your Drupal application
    dependencies with Composer, simply open your CLI and run the following command from the Composer root directory
for your application:</p>
<pre>
    composer require {project.field_project_machine_name} --with-all-dependencies
</pre>

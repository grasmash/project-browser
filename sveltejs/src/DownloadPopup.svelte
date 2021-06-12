<script>
    // @todo Make content translatable through Drupal.
    export let project;
</script>

<style>
    h2 {
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

<h2>{project.title}</h2>

<h3>1. Download</h3>

<p>The <a href="https://www.drupal.org/docs/develop/using-composer/using-composer-to-install-drupal-and-manage-dependencies#managing-contributed" target="_blank">recommended way to download any Drupal module</a> is with <a href="https://getcomposer.org/" target="_blank">Composer</a>.</p>

<p>If you already manage your Drupal application dependencies with Composer, simply open your CLI and run the following command from the Composer root directory
for your application:</p>
<pre>
    composer require drupal/{project.field_project_machine_name} --with-all-dependencies
</pre>

<p>This will download the module to your codebase.</p>

<p>If you cannot use Composer, you may <a href="https://www.drupal.org/docs/user_guide/en/extend-module-install.html#s-using-the-administrative-interface" target="_blank">download the module manually through your browser.</a></p>

<h3>2. Install</h3>

<p>To use the module you must next install/enable it. Visit the <a href="/admin/modules#module-{project.field_project_machine_name}" target="_blank">modules page</a> to install the module using your web browser.</p>
<p>Alternatively, you can use <a href="https://www.drush.org/latest/" target="_blank">drush</a> to enable it via the CLI:</p>
<pre>
    drush pm-enable {project.field_project_machine_name}
</pre>

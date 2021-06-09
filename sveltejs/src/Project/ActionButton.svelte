<script>
    import { fly } from 'svelte/transition';
    import { bind } from '../Modal.svelte';
    import ComposerPopup from '../DownloadPopup.svelte';
    import { modal } from '../stores.js';

    let opening = false;
    let opened = false;
    let closing = false;
    let closed = false;
    export let project;

    const showPopup = () => {
        modal.set(ComposerPopup);
    };

    const showPopupWithProps = () => {
        modal.set(bind(ComposerPopup, { project: project }));
    };

    /**
     * Determine is a project is present in the local Drupal codebase.
     * @param project_name
     * @returns {boolean}
     */
    function projectIsDownloaded(project_name) {
        return typeof drupalSettings !== 'undefined' && project_name in drupalSettings.project_browser.modules;
    }

    /**
     * Determine if a project is enabled/installed in the local Drupal codebase.
     * @param project_name
     * @returns {boolean}
     */
    function projectIsEnabled(project_name) {
        return typeof drupalSettings !== 'undefined' && project_name in drupalSettings.project_browser.modules && drupalSettings.project_browser.modules === 1;
    }
</script>
<style>
    .action {
        position: absolute;
        top: 15px;
        right: 15px;
    }
</style>
<div class="action">
    {#if projectIsEnabled(project.field_project_machine_name)}
        <span>Installed</span>
    {:else if projectIsDownloaded(project.field_project_machine_name)}
        <span><a href="/admin/modules#module-{project.field_project_machine_name}" target="_blank"><button type="button">Install</button></a></span>
    {:else}
        <span><button on:click={showPopupWithProps}>Download</button></span>
    {/if}
</div>

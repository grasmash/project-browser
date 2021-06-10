<script>
    export let coverage;
</script>
<style>
    .security-covered {
        color: green;
    }
    a {
        text-decoration: none;
    }
    img {
        filter: opacity(0.5) drop-shadow(0 0 0 #7cbc48) brightness(2);
        height: 1.38462em;
        margin: -1em .25em -.3em .25em;
    }
</style>
{#if coverage === 'covered'}
    <a href="https://www.drupal.org/security-advisory-policy" target="_blank"><span class="security-covered" title="Covered by Drupal Security Team"><img src="/{drupalSettings.project_browser.module_path}/images/shield-icon-black.svg" /></span></a>
{/if}

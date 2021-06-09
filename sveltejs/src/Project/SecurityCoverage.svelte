<script>
    export let coverage;
</script>
<style>
    .security-covered {
        color: green;
    }
</style>
{#if coverage === 'covered'}
    <a href="https://www.drupal.org/security-advisory-policy" target="_blank"><span class="security-covered" title="Covered by Drupal Security Team">&#128737;</span></a>
{/if}

<script>
    import { onMount } from "svelte";
    import ProjectGrid, { Pagination, Search, Sort } from "./ProjectGrid.svelte";
    import { sortNumber, sortString } from "./sorting.js";
    import DownloadButton from './DownloadButton.svelte';

    let data;
    let rows = [];
    let page = 0; // first page
    let pageIndex = 0; // first row
    let pageSize = 12;

    let loading = true;
    // Total result set size.
    let rowsCount = 0;
    let text = '';
    let sorting = 'title';
    let sortKeys = 'title';
    let sortDirection = 'ASC';

    /**
     * Load remote data when the Svelte component is mounted.
     */
    onMount(async () => {
        await load(page);
    });

    /**
     * Load data from Drupal.org API.
     */
    async function load(_page) {
        loading = true;
        // Additional query parameters are hardcoded in DrupalOrgProxyController::getAll();
        let url = "http://local.project-browser.com/drupal-org-proxy/project?page=" + _page + "&limit=" + pageSize + "&sort=" + sortKeys + "&direction=" + sortDirection;
        if (text) {
            url = url + "&title=" + text;
        }
        const res = await fetch(url);
        data = await res.json();
        rows = data.list;
        console.log(data);
        rowsCount = getRowCount(data);
        loading = false;
    }

    async function getFileUrl(fid) {
        const response = await fetch("https://www.drupal.org/api-d7/file/" + fid + ".json");
        if (response.ok) {
            data = await response.json();
            return data.url;

        } else {
            throw new Error('Could not load image');
        }
    }

    /**
     * @todo Make this accurate. It's currently an approximation because it assumes even the last
     * page of results contains a full 25 rows. It's possible the last page contains fewer.
     * @param data
     * @returns {number}
     */
    function getRowCount(data) {
        var last_page_num = getParameterByName('page', data.last);
        return last_page_num * pageSize;
    }

    function getParameterByName(name, url = window.location.href) {
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    function onCellClick(row) {
        // alert(JSON.stringify(row));
    }

    function onPageChange(event) {
        load(event.detail.page);
        page = event.detail.page;
    }

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

    async function onSearch(event) {
        text = event.detail.text;
        await load(page);
        page = 0;
    }

    async function onSort(event) {
        sortKeys = event.detail.key;
        sortDirection = String(event.detail.dir).toUpperCase();
        await load(page);
    }
</script>
<style>
    .project {
        width: 49%;
        border: 1px solid black;
        background: #ccc;
        margin-bottom: 1em;
    }
    .main {
        display: flex;
        background: white;
        height: 200px;
        position: relative;
        padding: 1em;
    }
    .action {
        position: absolute;
        top: 15px;
        right: 15px;
    }
    .left {
        min-width: 150px;
        width: 150px;
        overflow: hidden;
        margin: 0 1em 0 0;
    }
    .left img {
        width: 150px;
    }
    .right {
        padding: 1em .5em;
    }
    .metadata {
        clear: both;
        padding: 1em;
    }
</style>
<ProjectGrid {loading} {rows} {pageIndex} {pageSize} let:rows={rows2}>
    <div slot="top">
        <Search on:search={onSearch} />
        <Pagination {page} {pageSize} count={rowsCount} serverSide={true} on:pageChange={onPageChange} />
    </div>
    {#each rows2 as row, index (row)}
        <div class="project">
            <div class="main">
                <div class="action">
                    {#if projectIsEnabled(row.field_project_machine_name)}
                        Installed
                    {:else if projectIsDownloaded(row.field_project_machine_name)}
                        <a href="/admin/modules#module-{row.field_project_machine_name}" target="_blank"><button type="button">Install</button></a>
                    {:else}
                        <DownloadButton project={row} />
                    {/if}
                </div>
                <div class="left">
                    {#if typeof row.field_project_images !== "undefined" && row.field_project_images.length}
                        {#await getFileUrl(row.field_project_images[0].file.id)}}
                            <p>...waiting</p>
                        {:then url}
                            <img src="{url}" alt="{row.field_project_images[0].alt}"/>
                        {:catch error}
                            <p style="color: red">{error.message}</p>
                        {/await}
                    {/if}
                </div>
                <div class="right">
                    <h3>
                        <a href="{row.url}" target="_blank">{row.title}</a>
                        {#if row.field_security_advisory_coverage === 'covered'}
                            <span class="security-covered" title="Covered by Drupal Security Team">&#128737;</span>
                        {/if}
                    </h3>
                    <div>{@html String(row.body.value).substring(0, 200) + '...'}</div>
                </div>
            </div>
            <div class="metadata">
                <div data-label="Maintenance status">
                    {#if row.taxonomy_vocabulary_44}
                        {row.maintenance_status}
                    {:else}
                        <span>Unknown</span>
                    {/if}
                </div>
                <div data-label="Development status">
                    {#if row.taxonomy_vocabulary_46}
                        {row.development_status}
                    {:else}
                        <span>Unknown</span>
                    {/if}
                </div>
                <div data-label="Categories">
                    <ul>
                        {#each row.taxonomy_vocabulary_3 || [] as category}
                            <li class="category">{category.uri}</li>
                        {/each}
                    </ul>
                </div>
                <div data-label="Usage">
                    {#if row.project_usage}
                        <ul>
                            {#each Object.entries(row.project_usage) as [key, val] (key) }
                                <li>{key}: {val} installs</li>
                            {/each}
                        </ul>
                    {:else}
                        <span>No reported usage.</span>
                    {/if}
                </div>
            </div>
        </div>
    {/each}
    <div slot="bottom">
        <Pagination {page} {pageSize} count={rowsCount} serverSide={true} on:pageChange={onPageChange} />
    </div>
</ProjectGrid>

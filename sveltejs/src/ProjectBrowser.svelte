<script>
    import { onMount } from "svelte";
    import ProjectGrid, { Pagination, Search, Sort } from "./ProjectGrid.svelte";
    import { sortNumber, sortString } from "./sorting.js";
    import { fetchEntity } from "./Project/project.js";
    import DownloadButton from './DownloadButton.svelte';
    import SupportingOrganization from './Project/SupportingOrganization.svelte';
    import Image from './Project/Image.svelte';

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
        background: lightgrey;
        text-align: center;
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
    .categories ul {
        margin: 0;
        padding: 0;
    }
    .categories li {
        list-style: none;
        text-transform: lowercase;
        display: inline-block;
        margin-top: 5px;
        margin-bottom: 5px;
        margin-right: 5px;
        padding: 2px 5px;
        border: 1px solid #d5d5d5;
        border-radius: 3px;
        background-color: #f0f0f0;
    }
    .more {
        margin: 1em 0 0 0;
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
                        <span>Installed</span>
                    {:else if projectIsDownloaded(row.field_project_machine_name)}
                        <span><a href="/admin/modules#module-{row.field_project_machine_name}" target="_blank"><button type="button">Install</button></a></span>
                    {:else}
                       <span><DownloadButton project={row} /></span>
                    {/if}
                </div>
                <div class="left">
                    <Image field_project_images={row.field_project_images}/>
                </div>
                <div class="right">
                    <h2>
                        <a href="{row.url}" target="_blank">{row.title}</a>
                        {#if row.field_security_advisory_coverage === 'covered'}
                            <span class="security-covered" title="Covered by Drupal Security Team">&#128737;</span>
                        {/if}
                    </h2>
                    <div class="body">{@html String(row.body.value).substring(0, 200) + '...'}</div>
                    <div class="author">By <a href="https://www.drupal.org/user/{row.author.id}" target="_blank">{row.author.name}</a></div>
                    <SupportingOrganization field_supporting_organizations={row.field_supporting_organizations} />
                    <div class="more"><a href="{row.url}" target="_blank">More details</a></div>
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
                <div class="categories" data-label="Categories">
                    {#if typeof row.taxonomy_vocabulary_3 !== "undefined" && row.taxonomy_vocabulary_3.length}
                        <ul>
                            {#each row.taxonomy_vocabulary_3 || [] as category}
                                {#await fetchEntity(category.uri)}
                                    <p>...waiting</p>
                                {:then term}
                                    <li class="category">{term.name}</li>
                                {:catch error}
                                    <p style="color: red">{error.message}</p>
                                {/await}
                            {/each}
                        </ul>
                    {/if}
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
                <div class="latest-release">@todo add last updated or latest release</div>
            </div>
        </div>
    {/each}
    <div slot="bottom">
        <Pagination {page} {pageSize} count={rowsCount} serverSide={true} on:pageChange={onPageChange} />
    </div>
</ProjectGrid>

<script>
    import { onMount } from "svelte";
    import Table, { Pagination, Row, Search, Sort } from "./Table.svelte";
    import { sortNumber, sortString } from "./sorting.js";

    let data;
    let rows = [];
    let page = 0; // first page
    let pageIndex = 0; // first row
    let pageSize = 5;

    let loading = true;
    // Total result set size.
    let rowsCount = 0;
    let text;
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
        // @todo Add {text} property to URL for search string. E.g., add "&title={text}*".
        // Additional query parameters are hardcoded in DrupalOrgProxyController::getAll();
        let url = "http://local.project-browser.com/drupal-org-proxy/project?page=" + _page + "&limit=" + pageSize + "&sort=" + sortKeys + "&direction=" + sortDirection;
        console.log(url);
        const res = await fetch(url);
        console.log(res);
        data = await res.json();
        console.log(data);
        rows = data.list;
        rowsCount = getRowCount(data);
        loading = false;
        console.log(rowsCount);
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

<Table {loading} {rows} {pageIndex} {pageSize} let:rows={rows2}>
    <div slot="top">
        <Search on:search={onSearch} />
    </div>
    <thead slot="head">
    <tr>
        <th>
            Title
            <Sort key="title" on:sort={onSort} />
        </th>
        <th>
            Maintenance status
            <Sort key="taxonomy_vocabulary_44" on:sort={onSort} />
        </th>
        <th>
            Development status
            <Sort key="taxonomy_vocabulary_46" on:sort={onSort} />
        </th>
        <th>
            Components
            <Sort key="taxonomy_vocabulary_46" on:sort={onSort} />
        </th>
        <th>
            Usage
            <Sort key="project_usage" on:sort={onSort} />
        </th>
        <th>
            Security
            <Sort key="field_security_advisory_coverage;" on:sort={onSort} />
        </th>
    </tr>
    </thead>
    <tbody>
    {#each rows2 as row, index (row)}
        <Row {index} on:click={() => onCellClick(row)}>
            <td data-label="Title">
                <div><a href="{row.url}" target="_blank">{row.title}</a></div>
                <div>{@html String(row.body.summary).substring(0, 200) + '...'}</div>
                <div class="status">Status:
                    {#if projectIsEnabled(row.project_machine_name)}
                        Installed
                    {:else if projectIsDownloaded(row.project_machine_name)}
                        Downloaded, not installed.
                    {:else}
                        Not downloaded
                    {/if}
                </div>
                <div class="images">Images:
                    <ul>
                    {#each row.field_project_images || [] as image}
                        <li><img alt="{image.alt}" />{image.file.uri}</li>
                    {/each}
                    </ul>
                </div>
            </td>
            <td data-label="Maintenance status">
                {#if row.taxonomy_vocabulary_44}
                    {row.maintenance_status}
                {:else}
                    <span>Unknown</span>
                {/if}
            </td>
            <td data-label="Development status">
                {#if row.taxonomy_vocabulary_46}
                    {row.development_status}
                {:else}
                    <span>Unknown</span>
                {/if}
            </td>
            <td data-label="Components">
                <ul>
                    {#each row.field_project_components || [] as component}
                        <li class="component">{component}</li>
                    {/each}
                </ul>
            </td>
            <td data-label="Usage">
                {#if row.project_usage}
                    <ul>
                        {#each Object.entries(row.project_usage) as [key, val] (key) }
                            <li>{key}: {val} installs</li>
                        {/each}
                    </ul>
                {:else}
                    <span>No reported usage.</span>
                {/if}
            </td>
            <td data-label="Security">
                {row.field_security_advisory_coverage}
            </td>
        </Row>
    {/each}
    </tbody>
    <div slot="bottom">
        <Pagination {page} {pageSize} count={rowsCount} serverSide={true} on:pageChange={onPageChange} />
    </div>
</Table>

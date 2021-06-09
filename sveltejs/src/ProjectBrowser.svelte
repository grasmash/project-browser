<script>
    import { onMount } from "svelte";
    import ProjectGrid, { Pagination, Search } from "./ProjectGrid.svelte";
    import Project from "./Project/Project.svelte";

    let data;
    let rows = [];
    let page = 0; // first page
    let pageIndex = 0; // first row
    let pageSize = 12;

    let loading = true;
    // Total result set size.
    let rowsCount = 0;
    let text = '';
    //let sorting = 'title';
    //let sortKeys = 'title';
    //let sortDirection = 'ASC';
    let tab = 'recommended';

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
        let url = "http://local.project-browser.com/drupal-org-proxy/project?page=" + _page + "&limit=" + pageSize + "&tab=" + tab;
        // "&sort=" + sortKeys + "&direction=" + sortDirection +
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

    async function showRecommended() {
        tab = 'recommended';
        await load(0);
    }

    async function showAll() {
        tab = 'all';
        await load(0);
    }
</script>
<style>
    .selected {
        background: lightblue;
    }
</style>
<ProjectGrid {loading} {rows} {pageIndex} {pageSize} let:rows={rows2}>
    <div slot="top">
        <div class="smart-filters">
            <button class:selected="{tab === 'recommended'}" on:click={showRecommended}>Recommended projects</button>
            <button class:selected="{tab === 'all'}" on:click={showAll} title="All published projects">All projects</button>
            <Search on:search={onSearch} />
            <p>Recommended projects must be covered by Drupal's security team, have at least one release, be actively maintained, be a full (not sandbox) project, and have an issue queue available.</p>
        </div>
        <Pagination {page} {pageSize} count={rowsCount} serverSide={true} on:pageChange={onPageChange} />
    </div>
    {#each rows2 as row, index (row)}
        <Project project={row}/>
    {/each}
    <div slot="bottom">
        <Pagination {page} {pageSize} count={rowsCount} serverSide={true} on:pageChange={onPageChange} />
    </div>
</ProjectGrid>

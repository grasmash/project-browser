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
    let category;
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
        rowsCount = 0;
        // Additional query parameters are hardcoded in DrupalOrgProxyController::getAll();
        let url = "/drupal-org-proxy/project?page=" + _page + "&limit=" + pageSize + "&tab=" + tab;
        // "&sort=" + sortKeys + "&direction=" + sortDirection +
        if (text) {
            url = url + "&title=" + text;
        }
        if (category) {
            url = url + "&taxonomy_vocabulary_3=" + category;
        }
        console.log(url);
        const res = await fetch(url);
        if (res.ok) {
            data = await res.json();
            rows = data.list;
            console.log(data);
            rowsCount = getRowCount(data);
        }
        else {
            rows = [];
            rowsCount = 0;
        }

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

    async function onSelectCategory(event) {
        category = event.detail.category;
        await load(page);
        page = 0;
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
    .js-tab:hover {
        cursor: pointer;
    }
</style>
<ProjectGrid {loading} {rows} {pageIndex} {pageSize} let:rows={rows2}>
    <div slot="top">
        <div class="smart-filters tabs-wrapper is-horizontal is-collapsible position-container is-horizontal-enabled">
            <ul class="tabs tabs--secondary clearfix" >
                <!-- @todo Derive these filters from drupalSettings.project_browser.smart_filters. -->
                <li class:js-active-tab="{tab === 'recommended'}" class="tabs__tab js-tab is-active">
                    <a class:is-active="{tab === 'recommended'}" on:click={showRecommended} class="tabs__link js-tabs-link">Recommended projects</a>
                </li>
                <li class:js-active-tab="{tab === 'all'}" class="tabs__tab js-tab">
                    <a class:is-active="{tab === 'all'}" on:click={showAll} title="All published projects" class="tabs__link js-tabs-link">All projects</a>
                </li>
            </ul>
        </div>
        <div class="smart-filter-description"><p>Recommended projects must be covered by Drupal's security team, have at least one release, be actively maintained, be a full (not sandbox) project, and have an issue queue available.</p></div>
        <Search on:search={onSearch} on:selectCategory={onSelectCategory} />
        <Pagination {page} {pageSize} count={rowsCount} serverSide={true} on:pageChange={onPageChange} />
    </div>
    {#each rows2 as row, index (row)}
        <Project project={row}/>
    {/each}
    <div slot="bottom">
        <Pagination {page} {pageSize} count={rowsCount} serverSide={true} on:pageChange={onPageChange} />
    </div>
</ProjectGrid>

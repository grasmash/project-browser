<script>
    // Row component is optional and only serves to render odd/even row, you can use <tr> instead.
    // Sort component is optional
    import { onMount } from "svelte";
    import Table, { Pagination, Row, Search, Sort } from "./Table.svelte";
    import { sortNumber, sortString } from "./sorting.js";

    let data = [];
    let rows = [];
    let page = 0; //first page
    let pageSize = 25; //optional, 10 by default


    onMount(async () => {
        const res = await fetch(`http://local.project-browser.com/drupal-org-proxy/project`);
        data = await res.json();
        rows = data.list;
    });

    function onCellClick(row) {
        alert(JSON.stringify(row));
    }

    function onSortString(event) {
        event.detail.rows = sortString(
            event.detail.rows,
            event.detail.dir,
            event.detail.key
        );
    }

    function onSortNumber(event) {
        event.detail.rows = sortString(
            event.detail.rows,
            event.detail.dir,
            event.detail.key
        );
    }
</script>

<Table {page} {pageSize} {rows} let:rows={rows2}>
    <thead slot="head">
    <tr>
        <th>
            Title
            <Sort key="title" on:sort={onSortString} />
        </th>
        <th>
            Maintenance status
            <Sort key="taxonomy_vocabulary_44" on:sort={onSortString} />
        </th>
        <th>
            Development status
            <Sort key="taxonomy_vocabulary_46" on:sort={onSortNumber} />
        </th>
        <th>
            Components
            <Sort key="taxonomy_vocabulary_46" on:sort={onSortNumber} />
        </th>
        <th>
            Usage
            <Sort key="project_usage" on:sort={onSortNumber} />
        </th>
    </tr>
    </thead>
    <tbody>
    {#each rows2 as row, index (row)}
        <Row {index} on:click={() => onCellClick(row)}>
            <td data-label="Title">
                <a href="{row.url}">{row.title}</a>
            </td>
            <td data-label="Maintenance status">
                {#if row.taxonomy_vocabulary_44}
                    {row.taxonomy_vocabulary_44.id}
                {:else}
                    <span>Unknown</span>
                {/if}
            </td>
            <td data-label="Development status">
                {#if row.taxonomy_vocabulary_46}
                    {row.taxonomy_vocabulary_46.id}
                {:else}
                    <span>Unknown</span>
                {/if}
            </td>
            <td data-label="Components">
                <ul>
                    {#each row.field_project_components as component}
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
        </Row>
    {/each}
    </tbody>
</Table>

<script context="module">
    let globalLabels;

    export function setLabels(labels) {
        globalLabels = labels;
    }
</script>

<script>
    import { createEventDispatcher, getContext } from "svelte";
    const dispatch = createEventDispatcher();
    const stateContext = getContext("state");

    export let buttons = [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8];
    export let count;
    export let page = 0;
    export let pageSize;
    export let serverSide = false;

    export let labels = {
        first: "First",
        last: "Last",
        next: "Next",
        previous: "Previous",
        ...globalLabels
    };

    $: pageCount = Math.floor(count / pageSize);

    function onChange(event, page) {
        const state = stateContext.getState();
        const detail = {
            originalEvent: event,
            page,
            pageIndex: serverSide ? 0 : page * state.pageSize,
            pageSize: state.pageSize
        };
        dispatch("pageChange", detail);

        if (detail.preventDefault !== true) {
            stateContext.setPage(detail.page, detail.pageIndex);
        }
    }
</script>

<style>
</style>
<nav class="pagination pager">
    <ul class="pager__items js-pager__items">
        <li class="pager__item pager__item--number">
            <a class="pager__link" disabled={page === 0} on:click={e => onChange(e, 0)}>
                {labels.first}
            </a>
        </li>
        <li class="pager__item pager__item--number">
        <a class="pager__link" disabled={page === 0} on:click={e => onChange(e, page - 1)}>
            {labels.previous}
        </a>
        </li>
        {#each buttons as button}
            {#if page + button >= 0 && page + button <= pageCount}
                <li class="pager__item pager__item--number"
                    class:pager__item--active={page === page + button}
                >
                    <a class="pager__link"
                            class:is-active={page === page + button}
                            on:click={e => onChange(e, page + button)}>
                        {page + button + 1}
                    </a>
                </li>
            {/if}
        {/each}
        <li>
            <a      class="pager__link"
                    disabled={page > pageCount - 1}
                    on:click={e => onChange(e, page + 1)}>
                {labels.next}
            </a>
        </li>
        <li class="pager__item pager__item--number">
            <a      class="pager__link"
                    disabled={page >= pageCount} on:click={e => onChange(e, pageCount)}>
                {labels.last}
            </a>
        </li>
    </ul>
<div>
    {#if count}
        {count} projects
    {/if}
</div>
</nav>

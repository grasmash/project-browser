<script context="module">
    import { fetchEntity } from "./Project/project.js";
    let globalLabels;

    export function setLabels(labels) {
        globalLabels = labels;
    }

</script>

<script>
    import { createEventDispatcher, getContext } from "svelte";
    const dispatch = createEventDispatcher();
    const stateContext = getContext("state");

    export let filter = (row, text, index) => {
        text = text.toLowerCase();
        for (let i in row) {
            if (row[i] &&
                row[i]
                    .toString()
                    .toLowerCase()
                    .indexOf(text) > -1
            ) {
                return true;
            }
        }
        return false;
    };
    export let index = -1;
    export let text = "";
    export let category;

    export let labels = {
        placeholder: "Search exact title",
        ...globalLabels
    };

    async function onSearch(event) {
        const state = stateContext.getState();
        const detail = {
            originalEvent: event,
            filter,
            index,
            text,
            page: state.page,
            pageIndex: state.pageIndex,
            pageSize: state.pageSize,
            rows: state.filteredRows
        };
        dispatch("search", detail);

        if (detail.preventDefault !== true) {
            if (detail.text.length === 0) {
                stateContext.setRows(state.rows);
            } else {
                stateContext.setRows(
                    detail.rows.filter(r => detail.filter(r, detail.text, index))
                );
            }
            stateContext.setPage(0, 0);
        } else {
            stateContext.setRows(detail.rows);
        }
    }

    async function onSelectCategory(event) {
        const state = stateContext.getState();
        const detail = {
            originalEvent: event,
            category: category,
            page: state.page,
            pageIndex: state.pageIndex,
            pageSize: state.pageSize,
            rows: state.filteredRows
        };
        dispatch("selectCategory", detail);
        stateContext.setPage(0, 0);
        stateContext.setRows(detail.rows);
    }
</script>

<style>
    .views-exposed-form__item.views-exposed-form__item {
        max-width: 100%;
        margin: 0.75rem 0.5rem 0 0;
    }
    .views-exposed-form.views-exposed-form {
        display: flex;
        flex-wrap: wrap;
        margin-top: 1.5rem;
        margin-bottom: 1.5rem;
        padding: 0.5rem 1.5rem 1.5rem 1.5rem;
        border: 1px solid #dedfe4;
        border-radius: 2px;
        background-color: #fff;
        box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
    }
    .views-exposed-form .form-item--no-label, .views-exposed-form__item.views-exposed-form__item.views-exposed-form__item--actions {
        margin-top: 2.375rem;
    }
    .views-exposed-form__item--actions.views-exposed-form__item--actions .button:last-child {
        margin-right: 0;
    }
    .views-exposed-form__item--actions.views-exposed-form__item--actions .button {
        margin-top: 0;
        margin-bottom: 0;
    }
</style>

<form class="views-exposed-form">
    <div class="views-exposed-form__item js-form-item form-item js-form-type-textfield form-type--textfield ">
        <label class="form-item__label">Title</label>
        <input
                class="search form-text form-element form-element--type-text form-element--api-textfield"
                type="search"
                title={labels.placeholder}
                placeholder={labels.placeholder}
                bind:value={text}
                on:keyup={onSearch} />
    </div>
    <div class="views-exposed-form__item js-form-item form-item js-form-type-select form-type--select js-form-item-type form-item--type">
        <label class="form-item__label">Category</label>
        <select name="category" bind:value={category} on:change={onSelectCategory} class="form-select form-element form-element--type-select">
            {#await fetchEntity("https://www.drupal.org/api-d7/taxonomy_term.json?vocabulary=3")}
                <option value="">Loading...</option>
            {:then data}
                <option value="">- Any -</option>
                {#each data.list || [] as term}
                    <option value="{term.tid}">{term.name}</option>
                {/each}
            {:catch error}
                <option>Error</option>
            {/await}
        </select>
    </div>
    <div class="form-actions views-exposed-form__item views-exposed-form__item--actions js-form-wrapper form-wrapper" id="edit-actions">
        <input type="submit" value="Filter" class="button js-form-submit form-submit">
    </div>
</form>

<script>
    import { fly } from 'svelte/transition';
    import { bind } from './Modal.svelte';
    import ComposerPopup from './ComposerPopup.svelte';
    import { modal } from './stores.js';

    let opening = false;
    let opened = false;
    let closing = false;
    let closed = false;
    export let project;

    const showPopup = () => {
        modal.set(ComposerPopup);
    };

    const showPopupWithProps = () => {
        modal.set(bind(ComposerPopup, { project: project }));
    };
</script>

<button on:click={showPopupWithProps}>Install</button>

<style>
</style>


(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    function hasContext(key) {
        return get_current_component().$$.context.has(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }
    /**
     * Base class to create strongly typed Svelte components.
     * This only exists for typing purposes and should be used in `.d.ts` files.
     *
     * ### Example:
     *
     * You have component library on npm called `component-library`, from which
     * you export a component called `MyComponent`. For Svelte+TypeScript users,
     * you want to provide typings. Therefore you create a `index.d.ts`:
     * ```ts
     * import { SvelteComponentTyped } from "svelte";
     * export class MyComponent extends SvelteComponentTyped<{foo: string}> {}
     * ```
     * Typing this makes it possible for IDEs like VS Code with the Svelte extension
     * to provide intellisense and to use the component like this in a Svelte file
     * with TypeScript:
     * ```svelte
     * <script lang="ts">
     * 	import { MyComponent } from "component-library";
     * </script>
     * <MyComponent foo={'bar'} />
     * ```
     *
     * #### Why not make this part of `SvelteComponent(Dev)`?
     * Because
     * ```ts
     * class ASubclassOfSvelteComponent extends SvelteComponent<{foo: string}> {}
     * const component: typeof SvelteComponent = ASubclassOfSvelteComponent;
     * ```
     * will throw a type error, so we need to seperate the more strictly typed class.
     */
    class SvelteComponentTyped extends SvelteComponentDev {
        constructor(options) {
            super(options);
        }
    }

    var svelte = /*#__PURE__*/Object.freeze({
        __proto__: null,
        SvelteComponent: SvelteComponentDev,
        SvelteComponentTyped: SvelteComponentTyped,
        afterUpdate: afterUpdate,
        beforeUpdate: beforeUpdate,
        createEventDispatcher: createEventDispatcher,
        getContext: getContext,
        hasContext: hasContext,
        onDestroy: onDestroy,
        onMount: onMount,
        setContext: setContext,
        tick: tick
    });

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src/Modal.svelte generated by Svelte v3.38.2 */

    const { Object: Object_1$1, window: window_1 } = globals;
    const file$h = "src/Modal.svelte";

    // (323:0) {#if Component}
    function create_if_block$b(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let t;
    	let div0;
    	let switch_instance;
    	let div1_transition;
    	let div3_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*state*/ ctx[0].closeButton && create_if_block_1$5(ctx);
    	var switch_value = /*Component*/ ctx[1];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			div0 = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div0, "class", "content svelte-hz6fyb");
    			attr_dev(div0, "style", /*cssContent*/ ctx[8]);
    			add_location(div0, file$h, 351, 16, 9722);
    			attr_dev(div1, "class", "window svelte-hz6fyb");
    			attr_dev(div1, "role", "dialog");
    			attr_dev(div1, "aria-modal", "true");
    			attr_dev(div1, "style", /*cssWindow*/ ctx[7]);
    			add_location(div1, file$h, 332, 12, 8893);
    			attr_dev(div2, "class", "window-wrap svelte-hz6fyb");
    			attr_dev(div2, "style", /*cssWindowWrap*/ ctx[6]);
    			add_location(div2, file$h, 331, 8, 8816);
    			attr_dev(div3, "class", "bg svelte-hz6fyb");
    			attr_dev(div3, "style", /*cssBg*/ ctx[5]);
    			add_location(div3, file$h, 323, 4, 8552);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			if (switch_instance) {
    				mount_component(switch_instance, div0, null);
    			}

    			/*div1_binding*/ ctx[38](div1);
    			/*div2_binding*/ ctx[39](div2);
    			/*div3_binding*/ ctx[40](div3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						div1,
    						"introstart",
    						function () {
    							if (is_function(/*onOpen*/ ctx[12])) /*onOpen*/ ctx[12].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div1,
    						"outrostart",
    						function () {
    							if (is_function(/*onClose*/ ctx[13])) /*onClose*/ ctx[13].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div1,
    						"introend",
    						function () {
    							if (is_function(/*onOpened*/ ctx[14])) /*onOpened*/ ctx[14].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div1,
    						"outroend",
    						function () {
    							if (is_function(/*onClosed*/ ctx[15])) /*onClosed*/ ctx[15].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(div3, "mousedown", /*handleOuterMousedown*/ ctx[19], false, false, false),
    					listen_dev(div3, "mouseup", /*handleOuterMouseup*/ ctx[20], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*state*/ ctx[0].closeButton) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*state*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (switch_value !== (switch_value = /*Component*/ ctx[1])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div0, null);
    				} else {
    					switch_instance = null;
    				}
    			}

    			if (!current || dirty[0] & /*cssContent*/ 256) {
    				attr_dev(div0, "style", /*cssContent*/ ctx[8]);
    			}

    			if (!current || dirty[0] & /*cssWindow*/ 128) {
    				attr_dev(div1, "style", /*cssWindow*/ ctx[7]);
    			}

    			if (!current || dirty[0] & /*cssWindowWrap*/ 64) {
    				attr_dev(div2, "style", /*cssWindowWrap*/ ctx[6]);
    			}

    			if (!current || dirty[0] & /*cssBg*/ 32) {
    				attr_dev(div3, "style", /*cssBg*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*currentTransitionWindow*/ ctx[11], /*state*/ ctx[0].transitionWindowProps, true);
    				div1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, /*currentTransitionBg*/ ctx[10], /*state*/ ctx[0].transitionBgProps, true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*currentTransitionWindow*/ ctx[11], /*state*/ ctx[0].transitionWindowProps, false);
    			div1_transition.run(0);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, /*currentTransitionBg*/ ctx[10], /*state*/ ctx[0].transitionBgProps, false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block) if_block.d();
    			if (switch_instance) destroy_component(switch_instance);
    			/*div1_binding*/ ctx[38](null);
    			if (detaching && div1_transition) div1_transition.end();
    			/*div2_binding*/ ctx[39](null);
    			/*div3_binding*/ ctx[40](null);
    			if (detaching && div3_transition) div3_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(323:0) {#if Component}",
    		ctx
    	});

    	return block;
    }

    // (345:16) {#if state.closeButton}
    function create_if_block_1$5(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2$1, create_else_block$5];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty[0] & /*state*/ 1) show_if = !!/*isFunction*/ ctx[16](/*state*/ ctx[0].closeButton);
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx, [-1]);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(345:16) {#if state.closeButton}",
    		ctx
    	});

    	return block;
    }

    // (348:20) {:else}
    function create_else_block$5(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", "close svelte-hz6fyb");
    			attr_dev(button, "style", /*cssCloseButton*/ ctx[9]);
    			add_location(button, file$h, 348, 24, 9593);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*close*/ ctx[17], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cssCloseButton*/ 512) {
    				attr_dev(button, "style", /*cssCloseButton*/ ctx[9]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(348:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (346:20) {#if isFunction(state.closeButton)}
    function create_if_block_2$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*state*/ ctx[0].closeButton;

    	function switch_props(ctx) {
    		return {
    			props: { onClose: /*close*/ ctx[17] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*state*/ ctx[0].closeButton)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(346:20) {#if isFunction(state.closeButton)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*Component*/ ctx[1] && create_if_block$b(ctx);
    	const default_slot_template = /*#slots*/ ctx[37].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[36], null);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window_1, "keydown", /*handleKeydown*/ ctx[18], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*Component*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*Component*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$b(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 32)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[36], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function bind(Component, props = {}) {
    	return function ModalComponent(options) {
    		return new Component({
    				...options,
    				props: { ...props, ...options.props }
    			});
    	};
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Modal", slots, ['default']);
    	const dispatch = createEventDispatcher();
    	const baseSetContext = setContext;
    	let { show = null } = $$props;
    	let { key = "simple-modal" } = $$props;
    	let { closeButton = true } = $$props;
    	let { closeOnEsc = true } = $$props;
    	let { closeOnOuterClick = true } = $$props;
    	let { styleBg = {} } = $$props;
    	let { styleWindowWrap = {} } = $$props;
    	let { styleWindow = {} } = $$props;
    	let { styleContent = {} } = $$props;
    	let { styleCloseButton = {} } = $$props;
    	let { setContext: setContext$1 = baseSetContext } = $$props;
    	let { transitionBg = fade } = $$props;
    	let { transitionBgProps = { duration: 250 } } = $$props;
    	let { transitionWindow = transitionBg } = $$props;
    	let { transitionWindowProps = transitionBgProps } = $$props;

    	const defaultState = {
    		closeButton,
    		closeOnEsc,
    		closeOnOuterClick,
    		styleBg,
    		styleWindowWrap,
    		styleWindow,
    		styleContent,
    		styleCloseButton,
    		transitionBg,
    		transitionBgProps,
    		transitionWindow,
    		transitionWindowProps
    	};

    	let state = { ...defaultState };
    	let Component = null;
    	let background;
    	let wrap;
    	let modalWindow;
    	let scrollY;
    	let cssBg;
    	let cssWindowWrap;
    	let cssWindow;
    	let cssContent;
    	let cssCloseButton;
    	let currentTransitionBg;
    	let currentTransitionWindow;
    	let prevBodyPosition;
    	let prevBodyOverflow;
    	let outerClickTarget;
    	const camelCaseToDash = str => str.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase();
    	const toCssString = props => Object.keys(props).reduce((str, key) => `${str}; ${camelCaseToDash(key)}: ${props[key]}`, "");
    	const isFunction = f => !!(f && f.constructor && f.call && f.apply);

    	const updateStyleTransition = () => {
    		$$invalidate(5, cssBg = toCssString(state.styleBg));
    		$$invalidate(6, cssWindowWrap = toCssString(state.styleWindowWrap));
    		$$invalidate(7, cssWindow = toCssString(state.styleWindow));
    		$$invalidate(8, cssContent = toCssString(state.styleContent));
    		$$invalidate(9, cssCloseButton = toCssString(state.styleCloseButton));
    		$$invalidate(10, currentTransitionBg = state.transitionBg);
    		$$invalidate(11, currentTransitionWindow = state.transitionWindow);
    	};

    	const toVoid = () => {
    		
    	};

    	let onOpen = toVoid;
    	let onClose = toVoid;
    	let onOpened = toVoid;
    	let onClosed = toVoid;

    	const open = (NewComponent, newProps = {}, options = {}, callback = {}) => {
    		$$invalidate(1, Component = bind(NewComponent, newProps));
    		$$invalidate(0, state = { ...defaultState, ...options });
    		updateStyleTransition();
    		disableScroll();

    		($$invalidate(12, onOpen = event => {
    			if (callback.onOpen) callback.onOpen(event);
    			dispatch("open");
    			dispatch("opening"); // Deprecated. Do not use!
    		}), $$invalidate(13, onClose = event => {
    			if (callback.onClose) callback.onClose(event);
    			dispatch("close");
    			dispatch("closing"); // Deprecated. Do not use!
    		}), $$invalidate(14, onOpened = event => {
    			if (callback.onOpened) callback.onOpened(event);
    			dispatch("opened");
    		}));

    		$$invalidate(15, onClosed = event => {
    			if (callback.onClosed) callback.onClosed(event);
    			dispatch("closed");
    		});
    	};

    	const close = (callback = {}) => {
    		$$invalidate(13, onClose = callback.onClose || onClose);
    		$$invalidate(15, onClosed = callback.onClosed || onClosed);
    		$$invalidate(1, Component = null);
    		enableScroll();
    	};

    	const handleKeydown = event => {
    		if (state.closeOnEsc && Component && event.key === "Escape") {
    			event.preventDefault();
    			close();
    		}

    		if (Component && event.key === "Tab") {
    			// trap focus
    			const nodes = modalWindow.querySelectorAll("*");

    			const tabbable = Array.from(nodes).filter(node => node.tabIndex >= 0);
    			let index = tabbable.indexOf(document.activeElement);
    			if (index === -1 && event.shiftKey) index = 0;
    			index += tabbable.length + (event.shiftKey ? -1 : 1);
    			index %= tabbable.length;
    			tabbable[index].focus();
    			event.preventDefault();
    		}
    	};

    	const handleOuterMousedown = event => {
    		if (state.closeOnOuterClick && (event.target === background || event.target === wrap)) outerClickTarget = event.target;
    	};

    	const handleOuterMouseup = event => {
    		if (state.closeOnOuterClick && event.target === outerClickTarget) {
    			event.preventDefault();
    			close();
    		}
    	};

    	const disableScroll = () => {
    		scrollY = window.scrollY;
    		prevBodyPosition = document.body.style.position;
    		prevBodyOverflow = document.body.style.overflow;
    		document.body.style.position = "fixed";
    		document.body.style.top = `-${scrollY}px`;
    		document.body.style.overflow = "hidden";
    	};

    	const enableScroll = () => {
    		document.body.style.position = prevBodyPosition || "";
    		document.body.style.top = "";
    		document.body.style.overflow = prevBodyOverflow || "";
    		window.scrollTo(0, scrollY);
    	};

    	setContext$1(key, { open, close });

    	onDestroy(() => {
    		close();
    	});

    	const writable_props = [
    		"show",
    		"key",
    		"closeButton",
    		"closeOnEsc",
    		"closeOnOuterClick",
    		"styleBg",
    		"styleWindowWrap",
    		"styleWindow",
    		"styleContent",
    		"styleCloseButton",
    		"setContext",
    		"transitionBg",
    		"transitionBgProps",
    		"transitionWindow",
    		"transitionWindowProps"
    	];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			modalWindow = $$value;
    			$$invalidate(4, modalWindow);
    		});
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			wrap = $$value;
    			$$invalidate(3, wrap);
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			background = $$value;
    			$$invalidate(2, background);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("show" in $$props) $$invalidate(21, show = $$props.show);
    		if ("key" in $$props) $$invalidate(22, key = $$props.key);
    		if ("closeButton" in $$props) $$invalidate(23, closeButton = $$props.closeButton);
    		if ("closeOnEsc" in $$props) $$invalidate(24, closeOnEsc = $$props.closeOnEsc);
    		if ("closeOnOuterClick" in $$props) $$invalidate(25, closeOnOuterClick = $$props.closeOnOuterClick);
    		if ("styleBg" in $$props) $$invalidate(26, styleBg = $$props.styleBg);
    		if ("styleWindowWrap" in $$props) $$invalidate(27, styleWindowWrap = $$props.styleWindowWrap);
    		if ("styleWindow" in $$props) $$invalidate(28, styleWindow = $$props.styleWindow);
    		if ("styleContent" in $$props) $$invalidate(29, styleContent = $$props.styleContent);
    		if ("styleCloseButton" in $$props) $$invalidate(30, styleCloseButton = $$props.styleCloseButton);
    		if ("setContext" in $$props) $$invalidate(31, setContext$1 = $$props.setContext);
    		if ("transitionBg" in $$props) $$invalidate(32, transitionBg = $$props.transitionBg);
    		if ("transitionBgProps" in $$props) $$invalidate(33, transitionBgProps = $$props.transitionBgProps);
    		if ("transitionWindow" in $$props) $$invalidate(34, transitionWindow = $$props.transitionWindow);
    		if ("transitionWindowProps" in $$props) $$invalidate(35, transitionWindowProps = $$props.transitionWindowProps);
    		if ("$$scope" in $$props) $$invalidate(36, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		bind,
    		svelte,
    		fade,
    		createEventDispatcher,
    		dispatch,
    		baseSetContext,
    		show,
    		key,
    		closeButton,
    		closeOnEsc,
    		closeOnOuterClick,
    		styleBg,
    		styleWindowWrap,
    		styleWindow,
    		styleContent,
    		styleCloseButton,
    		setContext: setContext$1,
    		transitionBg,
    		transitionBgProps,
    		transitionWindow,
    		transitionWindowProps,
    		defaultState,
    		state,
    		Component,
    		background,
    		wrap,
    		modalWindow,
    		scrollY,
    		cssBg,
    		cssWindowWrap,
    		cssWindow,
    		cssContent,
    		cssCloseButton,
    		currentTransitionBg,
    		currentTransitionWindow,
    		prevBodyPosition,
    		prevBodyOverflow,
    		outerClickTarget,
    		camelCaseToDash,
    		toCssString,
    		isFunction,
    		updateStyleTransition,
    		toVoid,
    		onOpen,
    		onClose,
    		onOpened,
    		onClosed,
    		open,
    		close,
    		handleKeydown,
    		handleOuterMousedown,
    		handleOuterMouseup,
    		disableScroll,
    		enableScroll
    	});

    	$$self.$inject_state = $$props => {
    		if ("show" in $$props) $$invalidate(21, show = $$props.show);
    		if ("key" in $$props) $$invalidate(22, key = $$props.key);
    		if ("closeButton" in $$props) $$invalidate(23, closeButton = $$props.closeButton);
    		if ("closeOnEsc" in $$props) $$invalidate(24, closeOnEsc = $$props.closeOnEsc);
    		if ("closeOnOuterClick" in $$props) $$invalidate(25, closeOnOuterClick = $$props.closeOnOuterClick);
    		if ("styleBg" in $$props) $$invalidate(26, styleBg = $$props.styleBg);
    		if ("styleWindowWrap" in $$props) $$invalidate(27, styleWindowWrap = $$props.styleWindowWrap);
    		if ("styleWindow" in $$props) $$invalidate(28, styleWindow = $$props.styleWindow);
    		if ("styleContent" in $$props) $$invalidate(29, styleContent = $$props.styleContent);
    		if ("styleCloseButton" in $$props) $$invalidate(30, styleCloseButton = $$props.styleCloseButton);
    		if ("setContext" in $$props) $$invalidate(31, setContext$1 = $$props.setContext);
    		if ("transitionBg" in $$props) $$invalidate(32, transitionBg = $$props.transitionBg);
    		if ("transitionBgProps" in $$props) $$invalidate(33, transitionBgProps = $$props.transitionBgProps);
    		if ("transitionWindow" in $$props) $$invalidate(34, transitionWindow = $$props.transitionWindow);
    		if ("transitionWindowProps" in $$props) $$invalidate(35, transitionWindowProps = $$props.transitionWindowProps);
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    		if ("Component" in $$props) $$invalidate(1, Component = $$props.Component);
    		if ("background" in $$props) $$invalidate(2, background = $$props.background);
    		if ("wrap" in $$props) $$invalidate(3, wrap = $$props.wrap);
    		if ("modalWindow" in $$props) $$invalidate(4, modalWindow = $$props.modalWindow);
    		if ("scrollY" in $$props) scrollY = $$props.scrollY;
    		if ("cssBg" in $$props) $$invalidate(5, cssBg = $$props.cssBg);
    		if ("cssWindowWrap" in $$props) $$invalidate(6, cssWindowWrap = $$props.cssWindowWrap);
    		if ("cssWindow" in $$props) $$invalidate(7, cssWindow = $$props.cssWindow);
    		if ("cssContent" in $$props) $$invalidate(8, cssContent = $$props.cssContent);
    		if ("cssCloseButton" in $$props) $$invalidate(9, cssCloseButton = $$props.cssCloseButton);
    		if ("currentTransitionBg" in $$props) $$invalidate(10, currentTransitionBg = $$props.currentTransitionBg);
    		if ("currentTransitionWindow" in $$props) $$invalidate(11, currentTransitionWindow = $$props.currentTransitionWindow);
    		if ("prevBodyPosition" in $$props) prevBodyPosition = $$props.prevBodyPosition;
    		if ("prevBodyOverflow" in $$props) prevBodyOverflow = $$props.prevBodyOverflow;
    		if ("outerClickTarget" in $$props) outerClickTarget = $$props.outerClickTarget;
    		if ("onOpen" in $$props) $$invalidate(12, onOpen = $$props.onOpen);
    		if ("onClose" in $$props) $$invalidate(13, onClose = $$props.onClose);
    		if ("onOpened" in $$props) $$invalidate(14, onOpened = $$props.onOpened);
    		if ("onClosed" in $$props) $$invalidate(15, onClosed = $$props.onClosed);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*show*/ 2097152) {
    			{
    				if (isFunction(show)) {
    					open(show);
    				} else {
    					close();
    				}
    			}
    		}
    	};

    	return [
    		state,
    		Component,
    		background,
    		wrap,
    		modalWindow,
    		cssBg,
    		cssWindowWrap,
    		cssWindow,
    		cssContent,
    		cssCloseButton,
    		currentTransitionBg,
    		currentTransitionWindow,
    		onOpen,
    		onClose,
    		onOpened,
    		onClosed,
    		isFunction,
    		close,
    		handleKeydown,
    		handleOuterMousedown,
    		handleOuterMouseup,
    		show,
    		key,
    		closeButton,
    		closeOnEsc,
    		closeOnOuterClick,
    		styleBg,
    		styleWindowWrap,
    		styleWindow,
    		styleContent,
    		styleCloseButton,
    		setContext$1,
    		transitionBg,
    		transitionBgProps,
    		transitionWindow,
    		transitionWindowProps,
    		$$scope,
    		slots,
    		div1_binding,
    		div2_binding,
    		div3_binding
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$h,
    			create_fragment$h,
    			safe_not_equal,
    			{
    				show: 21,
    				key: 22,
    				closeButton: 23,
    				closeOnEsc: 24,
    				closeOnOuterClick: 25,
    				styleBg: 26,
    				styleWindowWrap: 27,
    				styleWindow: 28,
    				styleContent: 29,
    				styleCloseButton: 30,
    				setContext: 31,
    				transitionBg: 32,
    				transitionBgProps: 33,
    				transitionWindow: 34,
    				transitionWindowProps: 35
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get show() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set show(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get key() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeButton() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeButton(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnEsc() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnEsc(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnOuterClick() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnOuterClick(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleBg() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleBg(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleWindowWrap() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleWindowWrap(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleWindow() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleWindow(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleContent() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleContent(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleCloseButton() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleCloseButton(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setContext() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set setContext(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionBg() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionBg(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionBgProps() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionBgProps(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionWindow() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionWindow(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionWindowProps() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionWindowProps(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const modal = writable(null);

    /* src/Loading.svelte generated by Svelte v3.38.2 */

    const file$g = "src/Loading.svelte";

    function create_fragment$g(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Loading...";
    			attr_dev(div, "class", "loader svelte-19wky4c");
    			add_location(div, file$g, 69, 0, 1788);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Loading", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Loading> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Loading extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loading",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/Sort.svelte generated by Svelte v3.38.2 */
    const file$f = "src/Sort.svelte";

    // (60:2) {:else}
    function create_else_block$4(ctx) {
    	let span;
    	let raw_value = /*labels*/ ctx[1].unsorted.html + "";
    	let span_title_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "title", span_title_value = /*labels*/ ctx[1].unsorted.title);
    			add_location(span, file$f, 60, 4, 1399);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*labels*/ 2 && raw_value !== (raw_value = /*labels*/ ctx[1].unsorted.html + "")) span.innerHTML = raw_value;
    			if (dirty & /*labels*/ 2 && span_title_value !== (span_title_value = /*labels*/ ctx[1].unsorted.title)) {
    				attr_dev(span, "title", span_title_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(60:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (56:27) 
    function create_if_block_1$4(ctx) {
    	let span;
    	let raw_value = /*labels*/ ctx[1].desc.html + "";
    	let span_title_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "title", span_title_value = /*labels*/ ctx[1].desc.title);
    			add_location(span, file$f, 56, 4, 1309);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*labels*/ 2 && raw_value !== (raw_value = /*labels*/ ctx[1].desc.html + "")) span.innerHTML = raw_value;
    			if (dirty & /*labels*/ 2 && span_title_value !== (span_title_value = /*labels*/ ctx[1].desc.title)) {
    				attr_dev(span, "title", span_title_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(56:27) ",
    		ctx
    	});

    	return block;
    }

    // (52:2) {#if dir === 'asc'}
    function create_if_block$a(ctx) {
    	let span;
    	let raw_value = /*labels*/ ctx[1].asc.html + "";
    	let span_title_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "title", span_title_value = /*labels*/ ctx[1].asc.title);
    			add_location(span, file$f, 52, 4, 1203);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*labels*/ 2 && raw_value !== (raw_value = /*labels*/ ctx[1].asc.html + "")) span.innerHTML = raw_value;
    			if (dirty & /*labels*/ 2 && span_title_value !== (span_title_value = /*labels*/ ctx[1].asc.title)) {
    				attr_dev(span, "title", span_title_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(52:2) {#if dir === 'asc'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let span;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*dir*/ ctx[0] === "asc") return create_if_block$a;
    		if (/*dir*/ ctx[0] === "desc") return create_if_block_1$4;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if_block.c();
    			attr_dev(span, "class", "sort svelte-13q1u02");
    			add_location(span, file$f, 50, 0, 1138);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			if_block.m(span, null);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*onClick*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let globalLabels$3;

    function setLabels$2(labels) {
    	globalLabels$3 = labels;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Sort", slots, []);
    	const dispatch = createEventDispatcher();
    	const stateContext = getContext("state");
    	let { dir = "none" } = $$props;
    	let { key } = $$props;

    	let { labels = {
    		asc: { title: "Ascending", html: "&#8593;" },
    		desc: { title: "Desceding", html: "&#8595;" },
    		unsorted: { title: "Unsorted", html: "&#8645;" },
    		...globalLabels$3
    	} } = $$props;

    	function onClick(event) {
    		const state = stateContext.getState();

    		const detail = {
    			originalEvent: event,
    			key,
    			dir: dir !== "desc" ? "desc" : "asc",
    			rows: state.filteredRows
    		};

    		dispatch("sort", detail);

    		if (detail.preventDefault !== true) {
    			$$invalidate(0, dir = detail.dir);
    		}

    		stateContext.setRows(detail.rows);
    	}

    	const writable_props = ["dir", "key", "labels"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Sort> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("dir" in $$props) $$invalidate(0, dir = $$props.dir);
    		if ("key" in $$props) $$invalidate(3, key = $$props.key);
    		if ("labels" in $$props) $$invalidate(1, labels = $$props.labels);
    	};

    	$$self.$capture_state = () => ({
    		globalLabels: globalLabels$3,
    		setLabels: setLabels$2,
    		createEventDispatcher,
    		getContext,
    		dispatch,
    		stateContext,
    		dir,
    		key,
    		labels,
    		onClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("dir" in $$props) $$invalidate(0, dir = $$props.dir);
    		if ("key" in $$props) $$invalidate(3, key = $$props.key);
    		if ("labels" in $$props) $$invalidate(1, labels = $$props.labels);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [dir, labels, onClick, key];
    }

    class Sort extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { dir: 0, key: 3, labels: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sort",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[3] === undefined && !("key" in props)) {
    			console.warn("<Sort> was created without expected prop 'key'");
    		}
    	}

    	get dir() {
    		throw new Error("<Sort>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dir(value) {
    		throw new Error("<Sort>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get key() {
    		throw new Error("<Sort>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Sort>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labels() {
    		throw new Error("<Sort>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labels(value) {
    		throw new Error("<Sort>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    async function fetchEntity(uri) {
        let data;
        const response = await fetch(uri + ".json");
        if (response.ok) {
            data = await response.json();
            return data;

        } else {
            throw new Error('Could not load entity');
        }
    }

    /* src/Search.svelte generated by Svelte v3.38.2 */
    const file$e = "src/Search.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (134:12) {:catch error}
    function create_catch_block$4(ctx) {
    	let option;

    	const block = {
    		c: function create() {
    			option = element("option");
    			option.textContent = "Error";
    			option.__value = "Error";
    			option.value = option.__value;
    			add_location(option, file$e, 134, 16, 4446);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$4.name,
    		type: "catch",
    		source: "(134:12) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (129:12) {:then data}
    function create_then_block$4(ctx) {
    	let option;
    	let each_1_anchor;
    	let each_value = /*data*/ ctx[11].list || [];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			option = element("option");
    			option.textContent = "- Any -";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			option.__value = "";
    			option.value = option.__value;
    			add_location(option, file$e, 129, 16, 4229);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fetchEntity*/ 0) {
    				each_value = /*data*/ ctx[11].list || [];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$4.name,
    		type: "then",
    		source: "(129:12) {:then data}",
    		ctx
    	});

    	return block;
    }

    // (131:16) {#each data.list || [] as term}
    function create_each_block$5(ctx) {
    	let option;
    	let t_value = /*term*/ ctx[12].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*term*/ ctx[12].tid;
    			option.value = option.__value;
    			add_location(option, file$e, 131, 20, 4331);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(131:16) {#each data.list || [] as term}",
    		ctx
    	});

    	return block;
    }

    // (127:97)                  <option value="">Loading...</option>             {:then data}
    function create_pending_block$4(ctx) {
    	let option;

    	const block = {
    		c: function create() {
    			option = element("option");
    			option.textContent = "Loading...";
    			option.__value = "";
    			option.value = option.__value;
    			add_location(option, file$e, 127, 16, 4151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$4.name,
    		type: "pending",
    		source: "(127:97)                  <option value=\\\"\\\">Loading...</option>             {:then data}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let form;
    	let div0;
    	let label0;
    	let t1;
    	let input0;
    	let input0_title_value;
    	let input0_placeholder_value;
    	let t2;
    	let div1;
    	let label1;
    	let t4;
    	let select;
    	let t5;
    	let div2;
    	let input1;
    	let mounted;
    	let dispose;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block$4,
    		then: create_then_block$4,
    		catch: create_catch_block$4,
    		value: 11,
    		error: 15
    	};

    	handle_promise(fetchEntity("https://www.drupal.org/api-d7/taxonomy_term.json?vocabulary=3"), info);

    	const block = {
    		c: function create() {
    			form = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Title";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Category";
    			t4 = space();
    			select = element("select");
    			info.block.c();
    			t5 = space();
    			div2 = element("div");
    			input1 = element("input");
    			attr_dev(label0, "class", "form-item__label");
    			add_location(label0, file$e, 114, 8, 3326);
    			attr_dev(input0, "class", "search form-text form-element form-element--type-text form-element--api-textfield");
    			attr_dev(input0, "type", "search");
    			attr_dev(input0, "title", input0_title_value = /*labels*/ ctx[2].placeholder);
    			attr_dev(input0, "placeholder", input0_placeholder_value = /*labels*/ ctx[2].placeholder);
    			add_location(input0, file$e, 115, 8, 3380);
    			attr_dev(div0, "class", "views-exposed-form__item js-form-item form-item js-form-type-textfield form-type--textfield  svelte-18p8gyo");
    			add_location(div0, file$e, 113, 4, 3211);
    			attr_dev(label1, "class", "form-item__label");
    			add_location(label1, file$e, 124, 8, 3845);
    			attr_dev(select, "name", "category");
    			attr_dev(select, "class", "form-select form-element form-element--type-select");
    			if (/*category*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[8].call(select));
    			add_location(select, file$e, 125, 8, 3902);
    			attr_dev(div1, "class", "views-exposed-form__item js-form-item form-item js-form-type-select form-type--select js-form-item-type form-item--type svelte-18p8gyo");
    			add_location(div1, file$e, 123, 4, 3703);
    			attr_dev(input1, "type", "submit");
    			input1.value = "Filter";
    			attr_dev(input1, "class", "button js-form-submit form-submit svelte-18p8gyo");
    			add_location(input1, file$e, 139, 8, 4664);
    			attr_dev(div2, "class", "form-actions views-exposed-form__item views-exposed-form__item--actions js-form-wrapper form-wrapper svelte-18p8gyo");
    			attr_dev(div2, "id", "edit-actions");
    			add_location(div2, file$e, 138, 4, 4523);
    			attr_dev(form, "class", "views-exposed-form svelte-18p8gyo");
    			add_location(form, file$e, 112, 0, 3173);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t1);
    			append_dev(div0, input0);
    			set_input_value(input0, /*text*/ ctx[0]);
    			append_dev(form, t2);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t4);
    			append_dev(div1, select);
    			info.block.m(select, info.anchor = null);
    			info.mount = () => select;
    			info.anchor = null;
    			select_option(select, /*category*/ ctx[1]);
    			append_dev(form, t5);
    			append_dev(form, div2);
    			append_dev(div2, input1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[7]),
    					listen_dev(input0, "keyup", /*onSearch*/ ctx[3], false, false, false),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[8]),
    					listen_dev(select, "change", /*onSelectCategory*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*labels*/ 4 && input0_title_value !== (input0_title_value = /*labels*/ ctx[2].placeholder)) {
    				attr_dev(input0, "title", input0_title_value);
    			}

    			if (dirty & /*labels*/ 4 && input0_placeholder_value !== (input0_placeholder_value = /*labels*/ ctx[2].placeholder)) {
    				attr_dev(input0, "placeholder", input0_placeholder_value);
    			}

    			if (dirty & /*text*/ 1) {
    				set_input_value(input0, /*text*/ ctx[0]);
    			}

    			update_await_block_branch(info, ctx, dirty);

    			if (dirty & /*category, fetchEntity*/ 2) {
    				select_option(select, /*category*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			info.block.d();
    			info.token = null;
    			info = null;
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let globalLabels$2;

    function setLabels$1(labels) {
    	globalLabels$2 = labels;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Search", slots, []);
    	const dispatch = createEventDispatcher();
    	const stateContext = getContext("state");

    	let { filter = (row, text, index) => {
    		text = text.toLowerCase();

    		for (let i in row) {
    			if (row[i] && row[i].toString().toLowerCase().indexOf(text) > -1) {
    				return true;
    			}
    		}

    		return false;
    	} } = $$props;

    	let { index = -1 } = $$props;
    	let { text = "" } = $$props;
    	let { category } = $$props;

    	let { labels = {
    		placeholder: "Search exact title",
    		...globalLabels$2
    	} } = $$props;

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
    				stateContext.setRows(detail.rows.filter(r => detail.filter(r, detail.text, index)));
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
    			filter,
    			index,
    			category,
    			page: state.page,
    			pageIndex: state.pageIndex,
    			pageSize: state.pageSize,
    			rows: state.filteredRows
    		};

    		dispatch("selectCategory", detail);
    		stateContext.setPage(0, 0);
    		stateContext.setRows(detail.rows);
    	}

    	const writable_props = ["filter", "index", "text", "category", "labels"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Search> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		text = this.value;
    		$$invalidate(0, text);
    	}

    	function select_change_handler() {
    		category = select_value(this);
    		$$invalidate(1, category);
    	}

    	$$self.$$set = $$props => {
    		if ("filter" in $$props) $$invalidate(5, filter = $$props.filter);
    		if ("index" in $$props) $$invalidate(6, index = $$props.index);
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("category" in $$props) $$invalidate(1, category = $$props.category);
    		if ("labels" in $$props) $$invalidate(2, labels = $$props.labels);
    	};

    	$$self.$capture_state = () => ({
    		fetchEntity,
    		globalLabels: globalLabels$2,
    		setLabels: setLabels$1,
    		createEventDispatcher,
    		getContext,
    		dispatch,
    		stateContext,
    		filter,
    		index,
    		text,
    		category,
    		labels,
    		onSearch,
    		onSelectCategory
    	});

    	$$self.$inject_state = $$props => {
    		if ("filter" in $$props) $$invalidate(5, filter = $$props.filter);
    		if ("index" in $$props) $$invalidate(6, index = $$props.index);
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("category" in $$props) $$invalidate(1, category = $$props.category);
    		if ("labels" in $$props) $$invalidate(2, labels = $$props.labels);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		text,
    		category,
    		labels,
    		onSearch,
    		onSelectCategory,
    		filter,
    		index,
    		input0_input_handler,
    		select_change_handler
    	];
    }

    class Search extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			filter: 5,
    			index: 6,
    			text: 0,
    			category: 1,
    			labels: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Search",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*category*/ ctx[1] === undefined && !("category" in props)) {
    			console.warn("<Search> was created without expected prop 'category'");
    		}
    	}

    	get filter() {
    		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filter(value) {
    		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get category() {
    		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set category(value) {
    		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labels() {
    		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labels(value) {
    		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Pagination.svelte generated by Svelte v3.38.2 */
    const file$d = "src/Pagination.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (88:8) {#if page + button >= 0 && page + button <= pageCount}
    function create_if_block$9(ctx) {
    	let li;
    	let button;
    	let t_value = /*page*/ ctx[2] + /*button*/ ctx[15] + 1 + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[10](/*button*/ ctx[15], ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "class", "svelte-7cltih");
    			toggle_class(button, "active", /*page*/ ctx[2] === /*page*/ ctx[2] + /*button*/ ctx[15]);
    			add_location(button, file$d, 89, 16, 2044);
    			attr_dev(li, "class", "svelte-7cltih");
    			add_location(li, file$d, 88, 12, 2023);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_2, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*page, buttons*/ 5 && t_value !== (t_value = /*page*/ ctx[2] + /*button*/ ctx[15] + 1 + "")) set_data_dev(t, t_value);

    			if (dirty & /*page, buttons*/ 5) {
    				toggle_class(button, "active", /*page*/ ctx[2] === /*page*/ ctx[2] + /*button*/ ctx[15]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(88:8) {#if page + button >= 0 && page + button <= pageCount}",
    		ctx
    	});

    	return block;
    }

    // (87:4) {#each buttons as button}
    function create_each_block$4(ctx) {
    	let if_block_anchor;
    	let if_block = /*page*/ ctx[2] + /*button*/ ctx[15] >= 0 && /*page*/ ctx[2] + /*button*/ ctx[15] <= /*pageCount*/ ctx[4] && create_if_block$9(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*page*/ ctx[2] + /*button*/ ctx[15] >= 0 && /*page*/ ctx[2] + /*button*/ ctx[15] <= /*pageCount*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(87:4) {#each buttons as button}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div1;
    	let ul;
    	let li0;
    	let button0;
    	let t0_value = /*labels*/ ctx[3].first + "";
    	let t0;
    	let button0_disabled_value;
    	let t1;
    	let li1;
    	let button1;
    	let t2_value = /*labels*/ ctx[3].previous + "";
    	let t2;
    	let button1_disabled_value;
    	let t3;
    	let t4;
    	let li2;
    	let button2;
    	let t5_value = /*labels*/ ctx[3].next + "";
    	let t5;
    	let button2_disabled_value;
    	let t6;
    	let li3;
    	let button3;
    	let t7_value = /*labels*/ ctx[3].last + "";
    	let t7;
    	let button3_disabled_value;
    	let t8;
    	let div0;
    	let t9;
    	let t10;
    	let mounted;
    	let dispose;
    	let each_value = /*buttons*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			button0 = element("button");
    			t0 = text(t0_value);
    			t1 = space();
    			li1 = element("li");
    			button1 = element("button");
    			t2 = text(t2_value);
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			li2 = element("li");
    			button2 = element("button");
    			t5 = text(t5_value);
    			t6 = space();
    			li3 = element("li");
    			button3 = element("button");
    			t7 = text(t7_value);
    			t8 = space();
    			div0 = element("div");
    			t9 = text(/*count*/ ctx[1]);
    			t10 = text(" projects");
    			button0.disabled = button0_disabled_value = /*page*/ ctx[2] === 0;
    			attr_dev(button0, "class", "svelte-7cltih");
    			add_location(button0, file$d, 77, 8, 1657);
    			attr_dev(li0, "class", "svelte-7cltih");
    			add_location(li0, file$d, 76, 4, 1644);
    			button1.disabled = button1_disabled_value = /*page*/ ctx[2] === 0;
    			attr_dev(button1, "class", "svelte-7cltih");
    			add_location(button1, file$d, 82, 8, 1791);
    			attr_dev(li1, "class", "svelte-7cltih");
    			add_location(li1, file$d, 81, 4, 1778);
    			button2.disabled = button2_disabled_value = /*page*/ ctx[2] > /*pageCount*/ ctx[4] - 1;
    			attr_dev(button2, "class", "svelte-7cltih");
    			add_location(button2, file$d, 98, 8, 2309);
    			attr_dev(li2, "class", "svelte-7cltih");
    			add_location(li2, file$d, 97, 4, 2296);
    			button3.disabled = button3_disabled_value = /*page*/ ctx[2] >= /*pageCount*/ ctx[4];
    			attr_dev(button3, "class", "svelte-7cltih");
    			add_location(button3, file$d, 105, 8, 2491);
    			attr_dev(li3, "class", "svelte-7cltih");
    			add_location(li3, file$d, 104, 4, 2478);
    			attr_dev(ul, "class", "svelte-7cltih");
    			add_location(ul, file$d, 75, 0, 1635);
    			add_location(div0, file$d, 110, 0, 2628);
    			attr_dev(div1, "class", "pagination svelte-7cltih");
    			add_location(div1, file$d, 74, 0, 1610);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(li0, button0);
    			append_dev(button0, t0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, button1);
    			append_dev(button1, t2);
    			append_dev(ul, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(ul, t4);
    			append_dev(ul, li2);
    			append_dev(li2, button2);
    			append_dev(button2, t5);
    			append_dev(ul, t6);
    			append_dev(ul, li3);
    			append_dev(li3, button3);
    			append_dev(button3, t7);
    			append_dev(div1, t8);
    			append_dev(div1, div0);
    			append_dev(div0, t9);
    			append_dev(div0, t10);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[8], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[9], false, false, false),
    					listen_dev(button2, "click", /*click_handler_3*/ ctx[11], false, false, false),
    					listen_dev(button3, "click", /*click_handler_4*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*labels*/ 8 && t0_value !== (t0_value = /*labels*/ ctx[3].first + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*page*/ 4 && button0_disabled_value !== (button0_disabled_value = /*page*/ ctx[2] === 0)) {
    				prop_dev(button0, "disabled", button0_disabled_value);
    			}

    			if (dirty & /*labels*/ 8 && t2_value !== (t2_value = /*labels*/ ctx[3].previous + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*page*/ 4 && button1_disabled_value !== (button1_disabled_value = /*page*/ ctx[2] === 0)) {
    				prop_dev(button1, "disabled", button1_disabled_value);
    			}

    			if (dirty & /*page, buttons, onChange, pageCount*/ 53) {
    				each_value = /*buttons*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, t4);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*labels*/ 8 && t5_value !== (t5_value = /*labels*/ ctx[3].next + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*page, pageCount*/ 20 && button2_disabled_value !== (button2_disabled_value = /*page*/ ctx[2] > /*pageCount*/ ctx[4] - 1)) {
    				prop_dev(button2, "disabled", button2_disabled_value);
    			}

    			if (dirty & /*labels*/ 8 && t7_value !== (t7_value = /*labels*/ ctx[3].last + "")) set_data_dev(t7, t7_value);

    			if (dirty & /*page, pageCount*/ 20 && button3_disabled_value !== (button3_disabled_value = /*page*/ ctx[2] >= /*pageCount*/ ctx[4])) {
    				prop_dev(button3, "disabled", button3_disabled_value);
    			}

    			if (dirty & /*count*/ 2) set_data_dev(t9, /*count*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let globalLabels$1;

    function setLabels(labels) {
    	globalLabels$1 = labels;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let pageCount;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Pagination", slots, []);
    	const dispatch = createEventDispatcher();
    	const stateContext = getContext("state");
    	let { buttons = [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8] } = $$props;
    	let { count } = $$props;
    	let { page = 0 } = $$props;
    	let { pageSize } = $$props;
    	let { serverSide = false } = $$props;

    	let { labels = {
    		first: "First",
    		last: "Last",
    		next: "Next",
    		previous: "Previous",
    		...globalLabels$1
    	} } = $$props;

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

    	const writable_props = ["buttons", "count", "page", "pageSize", "serverSide", "labels"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Pagination> was created with unknown prop '${key}'`);
    	});

    	const click_handler = e => onChange(e, 0);
    	const click_handler_1 = e => onChange(e, page - 1);
    	const click_handler_2 = (button, e) => onChange(e, page + button);
    	const click_handler_3 = e => onChange(e, page + 1);
    	const click_handler_4 = e => onChange(e, pageCount);

    	$$self.$$set = $$props => {
    		if ("buttons" in $$props) $$invalidate(0, buttons = $$props.buttons);
    		if ("count" in $$props) $$invalidate(1, count = $$props.count);
    		if ("page" in $$props) $$invalidate(2, page = $$props.page);
    		if ("pageSize" in $$props) $$invalidate(6, pageSize = $$props.pageSize);
    		if ("serverSide" in $$props) $$invalidate(7, serverSide = $$props.serverSide);
    		if ("labels" in $$props) $$invalidate(3, labels = $$props.labels);
    	};

    	$$self.$capture_state = () => ({
    		globalLabels: globalLabels$1,
    		setLabels,
    		createEventDispatcher,
    		getContext,
    		dispatch,
    		stateContext,
    		buttons,
    		count,
    		page,
    		pageSize,
    		serverSide,
    		labels,
    		onChange,
    		pageCount
    	});

    	$$self.$inject_state = $$props => {
    		if ("buttons" in $$props) $$invalidate(0, buttons = $$props.buttons);
    		if ("count" in $$props) $$invalidate(1, count = $$props.count);
    		if ("page" in $$props) $$invalidate(2, page = $$props.page);
    		if ("pageSize" in $$props) $$invalidate(6, pageSize = $$props.pageSize);
    		if ("serverSide" in $$props) $$invalidate(7, serverSide = $$props.serverSide);
    		if ("labels" in $$props) $$invalidate(3, labels = $$props.labels);
    		if ("pageCount" in $$props) $$invalidate(4, pageCount = $$props.pageCount);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*count, pageSize*/ 66) {
    			$$invalidate(4, pageCount = Math.floor(count / pageSize));
    		}
    	};

    	return [
    		buttons,
    		count,
    		page,
    		labels,
    		pageCount,
    		onChange,
    		pageSize,
    		serverSide,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4
    	];
    }

    class Pagination extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			buttons: 0,
    			count: 1,
    			page: 2,
    			pageSize: 6,
    			serverSide: 7,
    			labels: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pagination",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*count*/ ctx[1] === undefined && !("count" in props)) {
    			console.warn("<Pagination> was created without expected prop 'count'");
    		}

    		if (/*pageSize*/ ctx[6] === undefined && !("pageSize" in props)) {
    			console.warn("<Pagination> was created without expected prop 'pageSize'");
    		}
    	}

    	get buttons() {
    		throw new Error("<Pagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set buttons(value) {
    		throw new Error("<Pagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get count() {
    		throw new Error("<Pagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set count(value) {
    		throw new Error("<Pagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get page() {
    		throw new Error("<Pagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set page(value) {
    		throw new Error("<Pagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pageSize() {
    		throw new Error("<Pagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pageSize(value) {
    		throw new Error("<Pagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get serverSide() {
    		throw new Error("<Pagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set serverSide(value) {
    		throw new Error("<Pagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labels() {
    		throw new Error("<Pagination>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labels(value) {
    		throw new Error("<Pagination>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ProjectGrid.svelte generated by Svelte v3.38.2 */
    const file$c = "src/ProjectGrid.svelte";
    const get_bottom_slot_changes = dirty => ({ rows: dirty & /*visibleRows*/ 128 });
    const get_bottom_slot_context = ctx => ({ rows: /*visibleRows*/ ctx[7] });
    const get_foot_slot_changes = dirty => ({ rows: dirty & /*visibleRows*/ 128 });
    const get_foot_slot_context = ctx => ({ rows: /*visibleRows*/ ctx[7] });
    const get_default_slot_changes = dirty => ({ rows: dirty & /*visibleRows*/ 128 });
    const get_default_slot_context = ctx => ({ rows: /*visibleRows*/ ctx[7] });
    const get_head_slot_changes = dirty => ({ rows: dirty & /*visibleRows*/ 128 });
    const get_head_slot_context = ctx => ({ rows: /*visibleRows*/ ctx[7] });
    const get_top_slot_changes = dirty => ({ rows: dirty & /*visibleRows*/ 128 });
    const get_top_slot_context = ctx => ({ rows: /*visibleRows*/ ctx[7] });

    // (101:17)      
    function fallback_block_1(ctx) {
    	let div;
    	let switch_instance;
    	let current;
    	var switch_value = Search;

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("search", /*onSearch*/ ctx[9]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div, "class", "slot-top svelte-1xdlrej");
    			add_location(div, file$c, 101, 4, 2376);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = Search)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("search", /*onSearch*/ ctx[9]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(101:17)      ",
    		ctx
    	});

    	return block;
    }

    // (113:4) {:else}
    function create_else_block$3(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, visibleRows*/ 8320)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(113:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (111:39) 
    function create_if_block_1$3(ctx) {
    	let div;
    	let raw_value = /*labels*/ ctx[5].empty + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			add_location(div, file$c, 111, 8, 2649);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*labels*/ 32 && raw_value !== (raw_value = /*labels*/ ctx[5].empty + "")) div.innerHTML = raw_value;		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(111:39) ",
    		ctx
    	});

    	return block;
    }

    // (109:4) {#if loading}
    function create_if_block$8(ctx) {
    	let loading_1;
    	let current;
    	loading_1 = new Loading({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(loading_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loading_1, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loading_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loading_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loading_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(109:4) {#if loading}",
    		ctx
    	});

    	return block;
    }

    // (119:20)      
    function fallback_block(ctx) {
    	let div;
    	let switch_instance;
    	let current;
    	var switch_value = Pagination;

    	function switch_props(ctx) {
    		return {
    			props: {
    				page: /*page*/ ctx[0],
    				pageSize: /*pageSize*/ ctx[2],
    				serverSide: /*serverSide*/ ctx[4],
    				count: /*filteredRows*/ ctx[6].length - 1
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		switch_instance.$on("pageChange", /*onPageChange*/ ctx[8]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div, "class", "slot-bottom svelte-1xdlrej");
    			add_location(div, file$c, 119, 4, 2797);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*page*/ 1) switch_instance_changes.page = /*page*/ ctx[0];
    			if (dirty & /*pageSize*/ 4) switch_instance_changes.pageSize = /*pageSize*/ ctx[2];
    			if (dirty & /*serverSide*/ 16) switch_instance_changes.serverSide = /*serverSide*/ ctx[4];
    			if (dirty & /*filteredRows*/ 64) switch_instance_changes.count = /*filteredRows*/ ctx[6].length - 1;

    			if (switch_value !== (switch_value = Pagination)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					switch_instance.$on("pageChange", /*onPageChange*/ ctx[8]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(119:20)      ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let t0;
    	let div;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let t2;
    	let div_class_value;
    	let t3;
    	let current;
    	const top_slot_template = /*#slots*/ ctx[14].top;
    	const top_slot = create_slot(top_slot_template, ctx, /*$$scope*/ ctx[13], get_top_slot_context);
    	const top_slot_or_fallback = top_slot || fallback_block_1(ctx);
    	const head_slot_template = /*#slots*/ ctx[14].head;
    	const head_slot = create_slot(head_slot_template, ctx, /*$$scope*/ ctx[13], get_head_slot_context);
    	const if_block_creators = [create_if_block$8, create_if_block_1$3, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*loading*/ ctx[1]) return 0;
    		if (/*visibleRows*/ ctx[7].length === 0) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	const foot_slot_template = /*#slots*/ ctx[14].foot;
    	const foot_slot = create_slot(foot_slot_template, ctx, /*$$scope*/ ctx[13], get_foot_slot_context);
    	const bottom_slot_template = /*#slots*/ ctx[14].bottom;
    	const bottom_slot = create_slot(bottom_slot_template, ctx, /*$$scope*/ ctx[13], get_bottom_slot_context);
    	const bottom_slot_or_fallback = bottom_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			if (top_slot_or_fallback) top_slot_or_fallback.c();
    			t0 = space();
    			div = element("div");
    			if (head_slot) head_slot.c();
    			t1 = space();
    			if_block.c();
    			t2 = space();
    			if (foot_slot) foot_slot.c();
    			t3 = space();
    			if (bottom_slot_or_fallback) bottom_slot_or_fallback.c();
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty("grid " + /*$$props*/ ctx[10].class) + " svelte-1xdlrej"));
    			toggle_class(div, "responsive", /*responsive*/ ctx[3]);
    			add_location(div, file$c, 106, 0, 2483);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (top_slot_or_fallback) {
    				top_slot_or_fallback.m(target, anchor);
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);

    			if (head_slot) {
    				head_slot.m(div, null);
    			}

    			append_dev(div, t1);
    			if_blocks[current_block_type_index].m(div, null);
    			append_dev(div, t2);

    			if (foot_slot) {
    				foot_slot.m(div, null);
    			}

    			insert_dev(target, t3, anchor);

    			if (bottom_slot_or_fallback) {
    				bottom_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (top_slot) {
    				if (top_slot.p && (!current || dirty & /*$$scope, visibleRows*/ 8320)) {
    					update_slot(top_slot, top_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_top_slot_changes, get_top_slot_context);
    				}
    			}

    			if (head_slot) {
    				if (head_slot.p && (!current || dirty & /*$$scope, visibleRows*/ 8320)) {
    					update_slot(head_slot, head_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_head_slot_changes, get_head_slot_context);
    				}
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, t2);
    			}

    			if (foot_slot) {
    				if (foot_slot.p && (!current || dirty & /*$$scope, visibleRows*/ 8320)) {
    					update_slot(foot_slot, foot_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_foot_slot_changes, get_foot_slot_context);
    				}
    			}

    			if (!current || dirty & /*$$props*/ 1024 && div_class_value !== (div_class_value = "" + (null_to_empty("grid " + /*$$props*/ ctx[10].class) + " svelte-1xdlrej"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*$$props, responsive*/ 1032) {
    				toggle_class(div, "responsive", /*responsive*/ ctx[3]);
    			}

    			if (bottom_slot) {
    				if (bottom_slot.p && (!current || dirty & /*$$scope, visibleRows*/ 8320)) {
    					update_slot(bottom_slot, bottom_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_bottom_slot_changes, get_bottom_slot_context);
    				}
    			} else {
    				if (bottom_slot_or_fallback && bottom_slot_or_fallback.p && dirty & /*page, pageSize, serverSide, filteredRows*/ 85) {
    					bottom_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(top_slot_or_fallback, local);
    			transition_in(head_slot, local);
    			transition_in(if_block);
    			transition_in(foot_slot, local);
    			transition_in(bottom_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(top_slot_or_fallback, local);
    			transition_out(head_slot, local);
    			transition_out(if_block);
    			transition_out(foot_slot, local);
    			transition_out(bottom_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (top_slot_or_fallback) top_slot_or_fallback.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			if (head_slot) head_slot.d(detaching);
    			if_blocks[current_block_type_index].d();
    			if (foot_slot) foot_slot.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (bottom_slot_or_fallback) bottom_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let globalLabels;

    function setTableLabels(labels) {
    	globalLabels = labels;
    }

    const setPaginationLabels = setLabels;
    const setSearchLabels = setLabels$1;
    const setSortLabels = setLabels$2;

    function instance$c($$self, $$props, $$invalidate) {
    	let filteredRows;
    	let visibleRows;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProjectGrid", slots, ['top','head','default','foot','bottom']);
    	const dispatch = createEventDispatcher();
    	let { loading = false } = $$props;
    	let { page = 0 } = $$props;
    	let { pageIndex = 0 } = $$props;
    	let { pageSize = 12 } = $$props;
    	let { responsive = true } = $$props;
    	let { rows } = $$props;
    	let { serverSide = false } = $$props;

    	let { labels = {
    		empty: "No records available",
    		loading: "Loading data",
    		...globalLabels
    	} } = $$props;

    	let buttons = [-2, -1, 0, 1, 2];
    	let pageCount = 0;

    	setContext("state", {
    		getState: () => ({
    			page,
    			pageIndex,
    			pageSize,
    			rows,
    			filteredRows
    		}),
    		setPage: (_page, _pageIndex) => {
    			$$invalidate(0, page = _page);
    			$$invalidate(11, pageIndex = _pageIndex);
    		},
    		setRows: _rows => $$invalidate(6, filteredRows = _rows)
    	});

    	function onPageChange(event) {
    		dispatch("pageChange", event.detail);
    	}

    	function onSearch(event) {
    		dispatch("search", event.detail);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(10, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("loading" in $$new_props) $$invalidate(1, loading = $$new_props.loading);
    		if ("page" in $$new_props) $$invalidate(0, page = $$new_props.page);
    		if ("pageIndex" in $$new_props) $$invalidate(11, pageIndex = $$new_props.pageIndex);
    		if ("pageSize" in $$new_props) $$invalidate(2, pageSize = $$new_props.pageSize);
    		if ("responsive" in $$new_props) $$invalidate(3, responsive = $$new_props.responsive);
    		if ("rows" in $$new_props) $$invalidate(12, rows = $$new_props.rows);
    		if ("serverSide" in $$new_props) $$invalidate(4, serverSide = $$new_props.serverSide);
    		if ("labels" in $$new_props) $$invalidate(5, labels = $$new_props.labels);
    		if ("$$scope" in $$new_props) $$invalidate(13, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Pagination,
    		_setPaginationLabels: setLabels,
    		Search,
    		_setSearchLabels: setLabels$1,
    		Sort,
    		_setSortLabels: setLabels$2,
    		Loading,
    		globalLabels,
    		setTableLabels,
    		setPaginationLabels,
    		setSearchLabels,
    		setSortLabels,
    		createEventDispatcher,
    		setContext,
    		dispatch,
    		loading,
    		page,
    		pageIndex,
    		pageSize,
    		responsive,
    		rows,
    		serverSide,
    		labels,
    		buttons,
    		pageCount,
    		onPageChange,
    		onSearch,
    		filteredRows,
    		visibleRows
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(10, $$props = assign(assign({}, $$props), $$new_props));
    		if ("loading" in $$props) $$invalidate(1, loading = $$new_props.loading);
    		if ("page" in $$props) $$invalidate(0, page = $$new_props.page);
    		if ("pageIndex" in $$props) $$invalidate(11, pageIndex = $$new_props.pageIndex);
    		if ("pageSize" in $$props) $$invalidate(2, pageSize = $$new_props.pageSize);
    		if ("responsive" in $$props) $$invalidate(3, responsive = $$new_props.responsive);
    		if ("rows" in $$props) $$invalidate(12, rows = $$new_props.rows);
    		if ("serverSide" in $$props) $$invalidate(4, serverSide = $$new_props.serverSide);
    		if ("labels" in $$props) $$invalidate(5, labels = $$new_props.labels);
    		if ("buttons" in $$props) buttons = $$new_props.buttons;
    		if ("pageCount" in $$props) pageCount = $$new_props.pageCount;
    		if ("filteredRows" in $$props) $$invalidate(6, filteredRows = $$new_props.filteredRows);
    		if ("visibleRows" in $$props) $$invalidate(7, visibleRows = $$new_props.visibleRows);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*rows*/ 4096) {
    			$$invalidate(6, filteredRows = rows);
    		}

    		if ($$self.$$.dirty & /*filteredRows, pageIndex, pageSize*/ 2116) {
    			$$invalidate(7, visibleRows = filteredRows.slice(pageIndex, pageIndex + pageSize));
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		page,
    		loading,
    		pageSize,
    		responsive,
    		serverSide,
    		labels,
    		filteredRows,
    		visibleRows,
    		onPageChange,
    		onSearch,
    		$$props,
    		pageIndex,
    		rows,
    		$$scope,
    		slots
    	];
    }

    class ProjectGrid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			loading: 1,
    			page: 0,
    			pageIndex: 11,
    			pageSize: 2,
    			responsive: 3,
    			rows: 12,
    			serverSide: 4,
    			labels: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProjectGrid",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*rows*/ ctx[12] === undefined && !("rows" in props)) {
    			console.warn("<ProjectGrid> was created without expected prop 'rows'");
    		}
    	}

    	get loading() {
    		throw new Error("<ProjectGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loading(value) {
    		throw new Error("<ProjectGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get page() {
    		throw new Error("<ProjectGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set page(value) {
    		throw new Error("<ProjectGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pageIndex() {
    		throw new Error("<ProjectGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pageIndex(value) {
    		throw new Error("<ProjectGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pageSize() {
    		throw new Error("<ProjectGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pageSize(value) {
    		throw new Error("<ProjectGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get responsive() {
    		throw new Error("<ProjectGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set responsive(value) {
    		throw new Error("<ProjectGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rows() {
    		throw new Error("<ProjectGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rows(value) {
    		throw new Error("<ProjectGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get serverSide() {
    		throw new Error("<ProjectGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set serverSide(value) {
    		throw new Error("<ProjectGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labels() {
    		throw new Error("<ProjectGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labels(value) {
    		throw new Error("<ProjectGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/DownloadPopup.svelte generated by Svelte v3.38.2 */

    const file$b = "src/DownloadPopup.svelte";

    function create_fragment$b(ctx) {
    	let h2;
    	let t0_value = /*project*/ ctx[0].title + "";
    	let t0;
    	let t1;
    	let h30;
    	let t3;
    	let p0;
    	let t4;
    	let a0;
    	let t6;
    	let a1;
    	let t8;
    	let t9;
    	let p1;
    	let t11;
    	let pre0;
    	let t12;
    	let t13_value = /*project*/ ctx[0].field_project_machine_name + "";
    	let t13;
    	let t14;
    	let t15;
    	let p2;
    	let t17;
    	let p3;
    	let t18;
    	let a2;
    	let t20;
    	let h31;
    	let t22;
    	let p4;
    	let t23;
    	let a3;
    	let t24;
    	let a3_href_value;
    	let t25;
    	let t26;
    	let p5;
    	let t27;
    	let a4;
    	let t29;
    	let t30;
    	let pre1;
    	let t31;
    	let t32_value = /*project*/ ctx[0].field_project_machine_name + "";
    	let t32;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			h30 = element("h3");
    			h30.textContent = "1. Download";
    			t3 = space();
    			p0 = element("p");
    			t4 = text("The ");
    			a0 = element("a");
    			a0.textContent = "recommended way to download any Drupal module";
    			t6 = text(" is with ");
    			a1 = element("a");
    			a1.textContent = "Composer";
    			t8 = text(".");
    			t9 = space();
    			p1 = element("p");
    			p1.textContent = "If you already manage your Drupal application dependencies with Composer, simply open your CLI and run the following command from the Composer root directory\nfor your application:";
    			t11 = space();
    			pre0 = element("pre");
    			t12 = text("composer require drupal/");
    			t13 = text(t13_value);
    			t14 = text(" --with-all-dependencies");
    			t15 = space();
    			p2 = element("p");
    			p2.textContent = "This will download the module to your codebase.";
    			t17 = space();
    			p3 = element("p");
    			t18 = text("If you cannot use Composer, you may ");
    			a2 = element("a");
    			a2.textContent = "download the module manually through your browser.";
    			t20 = space();
    			h31 = element("h3");
    			h31.textContent = "2. Install";
    			t22 = space();
    			p4 = element("p");
    			t23 = text("To use the module you must next install/enable it. Visit the ");
    			a3 = element("a");
    			t24 = text("modules page");
    			t25 = text(" to install the module using your web browser.");
    			t26 = space();
    			p5 = element("p");
    			t27 = text("Alternatively, you can use ");
    			a4 = element("a");
    			a4.textContent = "drush";
    			t29 = text(" to enable it via the CLI:");
    			t30 = space();
    			pre1 = element("pre");
    			t31 = text("drush pm-enable ");
    			t32 = text(t32_value);
    			attr_dev(h2, "class", "svelte-1y5u94f");
    			add_location(h2, file$b, 29, 0, 646);
    			add_location(h30, file$b, 31, 0, 672);
    			attr_dev(a0, "href", "https://www.drupal.org/docs/develop/using-composer/using-composer-to-install-drupal-and-manage-dependencies#managing-contributed");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$b, 33, 7, 701);
    			attr_dev(a1, "href", "https://getcomposer.org/");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$b, 33, 220, 914);
    			add_location(p0, file$b, 33, 0, 694);
    			add_location(p1, file$b, 35, 0, 984);
    			attr_dev(pre0, "class", "svelte-1y5u94f");
    			add_location(pre0, file$b, 37, 0, 1171);
    			add_location(p2, file$b, 41, 0, 1274);
    			attr_dev(a2, "href", "https://www.drupal.org/docs/user_guide/en/extend-module-install.html#s-using-the-administrative-interface");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$b, 43, 39, 1369);
    			add_location(p3, file$b, 43, 0, 1330);
    			add_location(h31, file$b, 45, 0, 1561);
    			attr_dev(a3, "href", a3_href_value = "/admin/modules#module-" + /*project*/ ctx[0].field_project_machine_name);
    			attr_dev(a3, "target", "_blank");
    			add_location(a3, file$b, 47, 64, 1646);
    			add_location(p4, file$b, 47, 0, 1582);
    			attr_dev(a4, "href", "https://www.drush.org/latest/");
    			attr_dev(a4, "target", "_blank");
    			add_location(a4, file$b, 48, 30, 1828);
    			add_location(p5, file$b, 48, 0, 1798);
    			attr_dev(pre1, "class", "svelte-1y5u94f");
    			add_location(pre1, file$b, 49, 0, 1924);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h30, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t4);
    			append_dev(p0, a0);
    			append_dev(p0, t6);
    			append_dev(p0, a1);
    			append_dev(p0, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, pre0, anchor);
    			append_dev(pre0, t12);
    			append_dev(pre0, t13);
    			append_dev(pre0, t14);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, p3, anchor);
    			append_dev(p3, t18);
    			append_dev(p3, a2);
    			insert_dev(target, t20, anchor);
    			insert_dev(target, h31, anchor);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, p4, anchor);
    			append_dev(p4, t23);
    			append_dev(p4, a3);
    			append_dev(a3, t24);
    			append_dev(p4, t25);
    			insert_dev(target, t26, anchor);
    			insert_dev(target, p5, anchor);
    			append_dev(p5, t27);
    			append_dev(p5, a4);
    			append_dev(p5, t29);
    			insert_dev(target, t30, anchor);
    			insert_dev(target, pre1, anchor);
    			append_dev(pre1, t31);
    			append_dev(pre1, t32);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*project*/ 1 && t0_value !== (t0_value = /*project*/ ctx[0].title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*project*/ 1 && t13_value !== (t13_value = /*project*/ ctx[0].field_project_machine_name + "")) set_data_dev(t13, t13_value);

    			if (dirty & /*project*/ 1 && a3_href_value !== (a3_href_value = "/admin/modules#module-" + /*project*/ ctx[0].field_project_machine_name)) {
    				attr_dev(a3, "href", a3_href_value);
    			}

    			if (dirty & /*project*/ 1 && t32_value !== (t32_value = /*project*/ ctx[0].field_project_machine_name + "")) set_data_dev(t32, t32_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h30);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(pre0);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t20);
    			if (detaching) detach_dev(h31);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t30);
    			if (detaching) detach_dev(pre1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DownloadPopup", slots, []);
    	let { project } = $$props;
    	const writable_props = ["project"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DownloadPopup> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("project" in $$props) $$invalidate(0, project = $$props.project);
    	};

    	$$self.$capture_state = () => ({ project });

    	$$self.$inject_state = $$props => {
    		if ("project" in $$props) $$invalidate(0, project = $$props.project);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [project];
    }

    class DownloadPopup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { project: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DownloadPopup",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*project*/ ctx[0] === undefined && !("project" in props)) {
    			console.warn("<DownloadPopup> was created without expected prop 'project'");
    		}
    	}

    	get project() {
    		throw new Error("<DownloadPopup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set project(value) {
    		throw new Error("<DownloadPopup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Project/ActionButton.svelte generated by Svelte v3.38.2 */
    const file$a = "src/Project/ActionButton.svelte";

    // (51:4) {:else}
    function create_else_block$2(ctx) {
    	let span;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			button = element("button");
    			button.textContent = "Download";
    			attr_dev(button, "class", "button button--action button--primary");
    			add_location(button, file$a, 51, 14, 1847);
    			add_location(span, file$a, 51, 8, 1841);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*showPopupWithProps*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(51:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (49:70) 
    function create_if_block_1$2(ctx) {
    	let span;
    	let a;
    	let button;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			a = element("a");
    			button = element("button");
    			button.textContent = "Install";
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "button button--action button--secondary");
    			add_location(button, file$a, 49, 99, 1723);
    			attr_dev(a, "href", a_href_value = "/admin/modules#module-" + /*project*/ ctx[0].field_project_machine_name);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$a, 49, 14, 1638);
    			add_location(span, file$a, 49, 8, 1632);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, a);
    			append_dev(a, button);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*project*/ 1 && a_href_value !== (a_href_value = "/admin/modules#module-" + /*project*/ ctx[0].field_project_machine_name)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(49:70) ",
    		ctx
    	});

    	return block;
    }

    // (47:4) {#if projectIsEnabled(project.field_project_machine_name)}
    function create_if_block$7(ctx) {
    	let span;
    	let a;
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			a = element("a");
    			t = text("Installed");
    			attr_dev(a, "href", a_href_value = "/admin/modules#module-" + /*project*/ ctx[0].field_project_machine_name);
    			attr_dev(a, "class", "action-link action-link--icon-checkmark");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$a, 47, 14, 1399);
    			add_location(span, file$a, 47, 8, 1393);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, a);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*project*/ 1 && a_href_value !== (a_href_value = "/admin/modules#module-" + /*project*/ ctx[0].field_project_machine_name)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(47:4) {#if projectIsEnabled(project.field_project_machine_name)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div;
    	let show_if;
    	let show_if_1;

    	function select_block_type(ctx, dirty) {
    		if (show_if == null || dirty & /*project*/ 1) show_if = !!projectIsEnabled(/*project*/ ctx[0].field_project_machine_name);
    		if (show_if) return create_if_block$7;
    		if (show_if_1 == null || dirty & /*project*/ 1) show_if_1 = !!projectIsDownloaded(/*project*/ ctx[0].field_project_machine_name);
    		if (show_if_1) return create_if_block_1$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx, -1);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "action svelte-16bz03j");
    			add_location(div, file$a, 45, 0, 1301);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function projectIsDownloaded(project_name) {
    	return typeof drupalSettings !== "undefined" && project_name in drupalSettings.project_browser.modules;
    }

    /**
     * Determine if a project is enabled/installed in the local Drupal codebase.
     * @param project_name
     * @returns {boolean}
     */
    function projectIsEnabled(project_name) {
    	return typeof drupalSettings !== "undefined" && project_name in drupalSettings.project_browser.modules && drupalSettings.project_browser.modules[project_name] === 1;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ActionButton", slots, []);
    	let opening = false;
    	let opened = false;
    	let closing = false;
    	let closed = false;
    	let { project } = $$props;

    	const showPopup = () => {
    		modal.set(DownloadPopup);
    	};

    	const showPopupWithProps = () => {
    		modal.set(bind(DownloadPopup, { project }));
    	};

    	const writable_props = ["project"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ActionButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("project" in $$props) $$invalidate(0, project = $$props.project);
    	};

    	$$self.$capture_state = () => ({
    		fly,
    		bind,
    		ComposerPopup: DownloadPopup,
    		modal,
    		opening,
    		opened,
    		closing,
    		closed,
    		project,
    		showPopup,
    		showPopupWithProps,
    		projectIsDownloaded,
    		projectIsEnabled
    	});

    	$$self.$inject_state = $$props => {
    		if ("opening" in $$props) opening = $$props.opening;
    		if ("opened" in $$props) opened = $$props.opened;
    		if ("closing" in $$props) closing = $$props.closing;
    		if ("closed" in $$props) closed = $$props.closed;
    		if ("project" in $$props) $$invalidate(0, project = $$props.project);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [project, showPopupWithProps];
    }

    class ActionButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { project: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ActionButton",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*project*/ ctx[0] === undefined && !("project" in props)) {
    			console.warn("<ActionButton> was created without expected prop 'project'");
    		}
    	}

    	get project() {
    		throw new Error("<ActionButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set project(value) {
    		throw new Error("<ActionButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Project/SupportingOrganization.svelte generated by Svelte v3.38.2 */
    const file$9 = "src/Project/SupportingOrganization.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (14:0) {#if typeof field_supporting_organizations !== "undefined" && field_supporting_organizations.length}
    function create_if_block$6(ctx) {
    	let div;
    	let span;
    	let t1;
    	let each_value = /*field_supporting_organizations*/ ctx[0] || [];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "with support from";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(span, file$9, 15, 8, 409);
    			attr_dev(div, "class", "supporting-organizations svelte-1ao7mne");
    			add_location(div, file$9, 14, 4, 362);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fetchEntity, field_supporting_organizations*/ 1) {
    				each_value = /*field_supporting_organizations*/ ctx[0] || [];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(14:0) {#if typeof field_supporting_organizations !== \\\"undefined\\\" && field_supporting_organizations.length}",
    		ctx
    	});

    	return block;
    }

    // (26:12) {:catch error}
    function create_catch_block_1(ctx) {
    	let span;
    	let t0_value = /*error*/ ctx[6].message + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			set_style(span, "color", "red");
    			add_location(span, file$9, 26, 16, 1110);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*field_supporting_organizations*/ 1 && t0_value !== (t0_value = /*error*/ ctx[6].message + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_1.name,
    		type: "catch",
    		source: "(26:12) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (19:12) {:then item}
    function create_then_block$3(ctx) {
    	let promise;
    	let t;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block_1,
    		then: create_then_block_1,
    		catch: create_catch_block$3,
    		value: 5,
    		error: 6
    	};

    	handle_promise(promise = fetchEntity(/*item*/ ctx[4].field_supporting_organization.uri), info);

    	const block = {
    		c: function create() {
    			info.block.c();
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => t.parentNode;
    			info.anchor = t;
    			insert_dev(target, t, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*field_supporting_organizations*/ 1 && promise !== (promise = fetchEntity(/*item*/ ctx[4].field_supporting_organization.uri)) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		d: function destroy(detaching) {
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$3.name,
    		type: "then",
    		source: "(19:12) {:then item}",
    		ctx
    	});

    	return block;
    }

    // (23:16) {:catch error}
    function create_catch_block$3(ctx) {
    	let span;
    	let t_value = /*error*/ ctx[6].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			set_style(span, "color", "red");
    			add_location(span, file$9, 23, 20, 994);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*field_supporting_organizations*/ 1 && t_value !== (t_value = /*error*/ ctx[6].message + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$3.name,
    		type: "catch",
    		source: "(23:16) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (21:16) {:then organization}
    function create_then_block_1(ctx) {
    	let span;
    	let a;
    	let t_value = /*organization*/ ctx[5].title + "";
    	let t;
    	let a_href_value;
    	let if_block = /*field_supporting_organizations*/ ctx[0][/*field_supporting_organizations*/ ctx[0].length - 1].id !== /*field_collection*/ ctx[1].id && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			a = element("a");
    			t = text(t_value);
    			if (if_block) if_block.c();
    			attr_dev(a, "href", a_href_value = /*organization*/ ctx[5].url);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "svelte-1ao7mne");
    			add_location(a, file$9, 21, 47, 754);
    			attr_dev(span, "class", "organization svelte-1ao7mne");
    			add_location(span, file$9, 21, 20, 727);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, a);
    			append_dev(a, t);
    			if (if_block) if_block.m(span, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*field_supporting_organizations*/ 1 && t_value !== (t_value = /*organization*/ ctx[5].title + "")) set_data_dev(t, t_value);

    			if (dirty & /*field_supporting_organizations*/ 1 && a_href_value !== (a_href_value = /*organization*/ ctx[5].url)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (/*field_supporting_organizations*/ ctx[0][/*field_supporting_organizations*/ ctx[0].length - 1].id !== /*field_collection*/ ctx[1].id) {
    				if (if_block) ; else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(span, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_1.name,
    		type: "then",
    		source: "(21:16) {:then organization}",
    		ctx
    	});

    	return block;
    }

    // (22:116) {#if field_supporting_organizations[field_supporting_organizations.length - 1].id !== field_collection.id}
    function create_if_block_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(",");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(22:116) {#if field_supporting_organizations[field_supporting_organizations.length - 1].id !== field_collection.id}",
    		ctx
    	});

    	return block;
    }

    // (20:76)                  {:then organization}
    function create_pending_block_1(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_1.name,
    		type: "pending",
    		source: "(20:76)                  {:then organization}",
    		ctx
    	});

    	return block;
    }

    // (18:54)              {:then item}
    function create_pending_block$3(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$3.name,
    		type: "pending",
    		source: "(18:54)              {:then item}",
    		ctx
    	});

    	return block;
    }

    // (17:8) {#each field_supporting_organizations || [] as field_collection}
    function create_each_block$3(ctx) {
    	let await_block_anchor;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block$3,
    		then: create_then_block$3,
    		catch: create_catch_block_1,
    		value: 4,
    		error: 6
    	};

    	handle_promise(promise = fetchEntity(/*field_collection*/ ctx[1].uri), info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*field_supporting_organizations*/ 1 && promise !== (promise = fetchEntity(/*field_collection*/ ctx[1].uri)) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(17:8) {#each field_supporting_organizations || [] as field_collection}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let if_block_anchor;
    	let if_block = typeof /*field_supporting_organizations*/ ctx[0] !== "undefined" && /*field_supporting_organizations*/ ctx[0].length && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (typeof /*field_supporting_organizations*/ ctx[0] !== "undefined" && /*field_supporting_organizations*/ ctx[0].length) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SupportingOrganization", slots, []);
    	let { field_supporting_organizations } = $$props;
    	const writable_props = ["field_supporting_organizations"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SupportingOrganization> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("field_supporting_organizations" in $$props) $$invalidate(0, field_supporting_organizations = $$props.field_supporting_organizations);
    	};

    	$$self.$capture_state = () => ({
    		fetchEntity,
    		field_supporting_organizations
    	});

    	$$self.$inject_state = $$props => {
    		if ("field_supporting_organizations" in $$props) $$invalidate(0, field_supporting_organizations = $$props.field_supporting_organizations);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [field_supporting_organizations];
    }

    class SupportingOrganization extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { field_supporting_organizations: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SupportingOrganization",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*field_supporting_organizations*/ ctx[0] === undefined && !("field_supporting_organizations" in props)) {
    			console.warn("<SupportingOrganization> was created without expected prop 'field_supporting_organizations'");
    		}
    	}

    	get field_supporting_organizations() {
    		throw new Error("<SupportingOrganization>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set field_supporting_organizations(value) {
    		throw new Error("<SupportingOrganization>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Project/Image.svelte generated by Svelte v3.38.2 */
    const file$8 = "src/Project/Image.svelte";

    // (20:0) {:else}
    function create_else_block$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "/" + drupalSettings.project_browser.module_path + "/images/placeholder-image.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Placeholder image");
    			attr_dev(img, "class", "svelte-6y8ufr");
    			add_location(img, file$8, 20, 4, 629);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(20:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (11:0) {#if typeof field_project_images !== "undefined" && field_project_images.length}
    function create_if_block$5(ctx) {
    	let await_block_anchor;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block$2,
    		then: create_then_block$2,
    		catch: create_catch_block$2,
    		value: 1,
    		error: 2
    	};

    	handle_promise(promise = fetchEntity(/*field_project_images*/ ctx[0][0].file.uri), info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*field_project_images*/ 1 && promise !== (promise = fetchEntity(/*field_project_images*/ ctx[0][0].file.uri)) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(11:0) {#if typeof field_project_images !== \\\"undefined\\\" && field_project_images.length}",
    		ctx
    	});

    	return block;
    }

    // (17:4) {:catch error}
    function create_catch_block$2(ctx) {
    	let span;
    	let t_value = /*error*/ ctx[2].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			set_style(span, "color", "red");
    			add_location(span, file$8, 17, 8, 556);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*field_project_images*/ 1 && t_value !== (t_value = /*error*/ ctx[2].message + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$2.name,
    		type: "catch",
    		source: "(17:4) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (15:4) {:then file}
    function create_then_block$2(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*file*/ ctx[1].url)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*field_project_images*/ ctx[0][0].alt);
    			attr_dev(img, "class", "svelte-6y8ufr");
    			add_location(img, file$8, 15, 8, 469);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*field_project_images*/ 1 && img.src !== (img_src_value = /*file*/ ctx[1].url)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*field_project_images*/ 1 && img_alt_value !== (img_alt_value = /*field_project_images*/ ctx[0][0].alt)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$2.name,
    		type: "then",
    		source: "(15:4) {:then file}",
    		ctx
    	});

    	return block;
    }

    // (13:58)          <span>...waiting</span>     {:then file}
    function create_pending_block$2(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "...waiting";
    			add_location(span, file$8, 13, 8, 420);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$2.name,
    		type: "pending",
    		source: "(13:58)          <span>...waiting</span>     {:then file}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (typeof /*field_project_images*/ ctx[0] !== "undefined" && /*field_project_images*/ ctx[0].length) return create_if_block$5;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Image", slots, []);
    	let { field_project_images } = $$props;
    	const writable_props = ["field_project_images"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Image> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("field_project_images" in $$props) $$invalidate(0, field_project_images = $$props.field_project_images);
    	};

    	$$self.$capture_state = () => ({ fetchEntity, field_project_images });

    	$$self.$inject_state = $$props => {
    		if ("field_project_images" in $$props) $$invalidate(0, field_project_images = $$props.field_project_images);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [field_project_images];
    }

    class Image extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { field_project_images: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Image",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*field_project_images*/ ctx[0] === undefined && !("field_project_images" in props)) {
    			console.warn("<Image> was created without expected prop 'field_project_images'");
    		}
    	}

    	get field_project_images() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set field_project_images(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Project/Categories.svelte generated by Svelte v3.38.2 */
    const file$7 = "src/Project/Categories.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (29:4) {#if typeof taxonomy_vocabulary_3 !== "undefined" && taxonomy_vocabulary_3.length}
    function create_if_block$4(ctx) {
    	let ul;
    	let each_value = /*taxonomy_vocabulary_3*/ ctx[0] || [];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-1cuxrv7");
    			add_location(ul, file$7, 29, 8, 750);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fetchEntity, taxonomy_vocabulary_3*/ 1) {
    				each_value = /*taxonomy_vocabulary_3*/ ctx[0] || [];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(29:4) {#if typeof taxonomy_vocabulary_3 !== \\\"undefined\\\" && taxonomy_vocabulary_3.length}",
    		ctx
    	});

    	return block;
    }

    // (36:16) {:catch error}
    function create_catch_block$1(ctx) {
    	let p;
    	let t0_value = /*error*/ ctx[5].message + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			set_style(p, "color", "red");
    			add_location(p, file$7, 36, 20, 1042);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*taxonomy_vocabulary_3*/ 1 && t0_value !== (t0_value = /*error*/ ctx[5].message + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(36:16) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (34:16) {:then term}
    function create_then_block$1(ctx) {
    	let li;
    	let t0_value = /*term*/ ctx[4].name + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(li, "class", "category svelte-1cuxrv7");
    			add_location(li, file$7, 34, 20, 953);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*taxonomy_vocabulary_3*/ 1 && t0_value !== (t0_value = /*term*/ ctx[4].name + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(34:16) {:then term}",
    		ctx
    	});

    	return block;
    }

    // (32:50)                      <p>...waiting</p>                 {:then term}
    function create_pending_block$1(ctx) {
    	let p;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "...waiting";
    			t1 = space();
    			add_location(p, file$7, 32, 20, 886);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(32:50)                      <p>...waiting</p>                 {:then term}",
    		ctx
    	});

    	return block;
    }

    // (31:12) {#each taxonomy_vocabulary_3 || [] as category}
    function create_each_block$2(ctx) {
    	let await_block_anchor;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block$1,
    		value: 4,
    		error: 5
    	};

    	handle_promise(promise = fetchEntity(/*category*/ ctx[1].uri), info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*taxonomy_vocabulary_3*/ 1 && promise !== (promise = fetchEntity(/*category*/ ctx[1].uri)) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(31:12) {#each taxonomy_vocabulary_3 || [] as category}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let if_block = typeof /*taxonomy_vocabulary_3*/ ctx[0] !== "undefined" && /*taxonomy_vocabulary_3*/ ctx[0].length && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "categories svelte-1cuxrv7");
    			attr_dev(div, "data-label", "Categories");
    			add_location(div, file$7, 27, 0, 606);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (typeof /*taxonomy_vocabulary_3*/ ctx[0] !== "undefined" && /*taxonomy_vocabulary_3*/ ctx[0].length) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Categories", slots, []);
    	let { taxonomy_vocabulary_3 } = $$props;
    	const writable_props = ["taxonomy_vocabulary_3"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Categories> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("taxonomy_vocabulary_3" in $$props) $$invalidate(0, taxonomy_vocabulary_3 = $$props.taxonomy_vocabulary_3);
    	};

    	$$self.$capture_state = () => ({ fetchEntity, taxonomy_vocabulary_3 });

    	$$self.$inject_state = $$props => {
    		if ("taxonomy_vocabulary_3" in $$props) $$invalidate(0, taxonomy_vocabulary_3 = $$props.taxonomy_vocabulary_3);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [taxonomy_vocabulary_3];
    }

    class Categories extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { taxonomy_vocabulary_3: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Categories",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*taxonomy_vocabulary_3*/ ctx[0] === undefined && !("taxonomy_vocabulary_3" in props)) {
    			console.warn("<Categories> was created without expected prop 'taxonomy_vocabulary_3'");
    		}
    	}

    	get taxonomy_vocabulary_3() {
    		throw new Error("<Categories>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set taxonomy_vocabulary_3(value) {
    		throw new Error("<Categories>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Project/Usage.svelte generated by Svelte v3.38.2 */

    const { Object: Object_1 } = globals;
    const file$6 = "src/Project/Usage.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i][0];
    	child_ctx[6] = list[i][1];
    	return child_ctx;
    }

    // (34:4) {:else}
    function create_else_block_1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "No reported usage.";
    			add_location(span, file$6, 34, 8, 1364);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(34:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (21:4) {#if project_usage}
    function create_if_block_1(ctx) {
    	let div0;
    	let span;
    	let t0;
    	let t1;
    	let t2;
    	let div1;
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = Object.entries(/*project_usage*/ ctx[0]);
    	validate_each_argument(each_value);
    	const get_key = ctx => /*key*/ ctx[5];
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			span = element("span");
    			t0 = text(/*project_usage_total*/ ctx[1]);
    			t1 = text(" active installations [all branches]");
    			t2 = space();
    			div1 = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span, "title", "This total includes usage data from versions that are not compatible with your installation and therefore not displayed here");
    			attr_dev(span, "class", "svelte-fv0p7z");
    			add_location(span, file$6, 21, 27, 715);
    			attr_dev(div0, "class", "total svelte-fv0p7z");
    			add_location(div0, file$6, 21, 8, 696);
    			attr_dev(ul, "class", "svelte-fv0p7z");
    			add_location(ul, file$6, 23, 12, 973);
    			attr_dev(div1, "class", "project-usage");
    			add_location(div1, file$6, 22, 8, 933);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, span);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*project_usage_total*/ 2) set_data_dev(t0, /*project_usage_total*/ ctx[1]);

    			if (dirty & /*Object, project_usage, isCompatible*/ 9) {
    				each_value = Object.entries(/*project_usage*/ ctx[0]);
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, destroy_block, create_each_block$1, null, get_each_context$1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(21:4) {#if project_usage}",
    		ctx
    	});

    	return block;
    }

    // (26:20) {#if isCompatible(key)}
    function create_if_block_2(ctx) {
    	let li;
    	let span;
    	let t1_value = /*val*/ ctx[6] + "";
    	let t1;
    	let t2;
    	let t3_value = /*key*/ ctx[5] + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			li = element("li");
    			span = element("span");
    			span.textContent = "✔";
    			t1 = text(t1_value);
    			t2 = text(" active installations [");
    			t3 = text(t3_value);
    			t4 = text(" branch]\n                        ");
    			attr_dev(span, "class", "check svelte-fv0p7z");
    			add_location(span, file$6, 27, 28, 1154);
    			attr_dev(li, "class", "svelte-fv0p7z");
    			add_location(li, file$6, 26, 24, 1121);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, span);
    			append_dev(li, t1);
    			append_dev(li, t2);
    			append_dev(li, t3);
    			append_dev(li, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*project_usage*/ 1 && t1_value !== (t1_value = /*val*/ ctx[6] + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*project_usage*/ 1 && t3_value !== (t3_value = /*key*/ ctx[5] + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(26:20) {#if isCompatible(key)}",
    		ctx
    	});

    	return block;
    }

    // (25:16) {#each Object.entries(project_usage) as [key, val] (key) }
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let show_if = /*isCompatible*/ ctx[3](/*key*/ ctx[5]);
    	let if_block_anchor;
    	let if_block = show_if && create_if_block_2(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*project_usage*/ 1) show_if = /*isCompatible*/ ctx[3](/*key*/ ctx[5]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(25:16) {#each Object.entries(project_usage) as [key, val] (key) }",
    		ctx
    	});

    	return block;
    }

    // (41:4) {:else}
    function create_else_block(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Not compatible with your Drupal installation.";
    			attr_dev(span, "class", "not-compatible svelte-fv0p7z");
    			add_location(span, file$6, 41, 8, 1583);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(41:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (39:4) {#if project_is_compatible}
    function create_if_block$3(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "✔ Compatible with your Drupal installation";
    			attr_dev(span, "class", "compatible svelte-fv0p7z");
    			add_location(span, file$6, 39, 8, 1481);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(39:4) {#if project_is_compatible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div0;
    	let t;
    	let div1;

    	function select_block_type(ctx, dirty) {
    		if (/*project_usage*/ ctx[0]) return create_if_block_1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*project_is_compatible*/ ctx[2]) return create_if_block$3;
    		return create_else_block;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			if_block0.c();
    			t = space();
    			div1 = element("div");
    			if_block1.c();
    			attr_dev(div0, "class", "usage svelte-fv0p7z");
    			attr_dev(div0, "data-label", "Usage");
    			add_location(div0, file$6, 19, 0, 625);
    			attr_dev(div1, "class", "compatibility svelte-fv0p7z");
    			add_location(div1, file$6, 37, 0, 1413);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			if_block0.m(div0, null);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			if_block1.m(div1, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			}

    			if (current_block_type_1 !== (current_block_type_1 = select_block_type_1(ctx))) {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if_block0.d();
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Usage", slots, []);
    	let { project_usage } = $$props;
    	let { project_usage_total } = $$props;
    	let core_compatibility;
    	let project_is_compatible;

    	if (typeof drupalSettings !== "undefined") {
    		core_compatibility = drupalSettings.project_browser.core_compatibility;
    	}

    	function isCompatible(module_version) {
    		let version_is_compatible;
    		version_is_compatible = String(module_version).substring(0, 3) === drupalSettings.project_browser.drupal_core_compatibility;

    		if (version_is_compatible) {
    			$$invalidate(2, project_is_compatible = true);
    		}

    		return version_is_compatible;
    	}

    	const writable_props = ["project_usage", "project_usage_total"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Usage> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("project_usage" in $$props) $$invalidate(0, project_usage = $$props.project_usage);
    		if ("project_usage_total" in $$props) $$invalidate(1, project_usage_total = $$props.project_usage_total);
    	};

    	$$self.$capture_state = () => ({
    		project_usage,
    		project_usage_total,
    		core_compatibility,
    		project_is_compatible,
    		isCompatible
    	});

    	$$self.$inject_state = $$props => {
    		if ("project_usage" in $$props) $$invalidate(0, project_usage = $$props.project_usage);
    		if ("project_usage_total" in $$props) $$invalidate(1, project_usage_total = $$props.project_usage_total);
    		if ("core_compatibility" in $$props) core_compatibility = $$props.core_compatibility;
    		if ("project_is_compatible" in $$props) $$invalidate(2, project_is_compatible = $$props.project_is_compatible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [project_usage, project_usage_total, project_is_compatible, isCompatible];
    }

    class Usage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { project_usage: 0, project_usage_total: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Usage",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*project_usage*/ ctx[0] === undefined && !("project_usage" in props)) {
    			console.warn("<Usage> was created without expected prop 'project_usage'");
    		}

    		if (/*project_usage_total*/ ctx[1] === undefined && !("project_usage_total" in props)) {
    			console.warn("<Usage> was created without expected prop 'project_usage_total'");
    		}
    	}

    	get project_usage() {
    		throw new Error("<Usage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set project_usage(value) {
    		throw new Error("<Usage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get project_usage_total() {
    		throw new Error("<Usage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set project_usage_total(value) {
    		throw new Error("<Usage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Project/LastUpdated.svelte generated by Svelte v3.38.2 */

    const file$5 = "src/Project/LastUpdated.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let t0;
    	let t1_value = timeDifference(new Date().getTime() / 1000, parseInt(/*changed*/ ctx[0])) + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Updated ");
    			t1 = text(t1_value);
    			attr_dev(div, "class", "latest-release");
    			add_location(div, file$5, 37, 0, 1069);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*changed*/ 1 && t1_value !== (t1_value = timeDifference(new Date().getTime() / 1000, parseInt(/*changed*/ ctx[0])) + "")) set_data_dev(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function timeDifference(current, previous) {
    	var msPerMinute = 60 * 1000;
    	var msPerHour = msPerMinute * 60;
    	var msPerDay = msPerHour * 24;
    	var msPerMonth = msPerDay * 30;
    	var msPerYear = msPerDay * 365;
    	var elapsed = current - previous;

    	if (elapsed < msPerMinute) {
    		return Math.round(elapsed / 1000) + " seconds ago";
    	} else if (elapsed < msPerHour) {
    		return Math.round(elapsed / msPerMinute) + " minutes ago";
    	} else if (elapsed < msPerDay) {
    		return Math.round(elapsed / msPerHour) + " hours ago";
    	} else if (elapsed < msPerMonth) {
    		return "approximately " + Math.round(elapsed / msPerDay) + " days ago";
    	} else if (elapsed < msPerYear) {
    		return "approximately " + Math.round(elapsed / msPerMonth) + " months ago";
    	} else {
    		return "approximately " + Math.round(elapsed / msPerYear) + " years ago";
    	}
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LastUpdated", slots, []);
    	let { changed } = $$props;
    	const writable_props = ["changed"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LastUpdated> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("changed" in $$props) $$invalidate(0, changed = $$props.changed);
    	};

    	$$self.$capture_state = () => ({ changed, timeDifference });

    	$$self.$inject_state = $$props => {
    		if ("changed" in $$props) $$invalidate(0, changed = $$props.changed);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [changed];
    }

    class LastUpdated extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { changed: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LastUpdated",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*changed*/ ctx[0] === undefined && !("changed" in props)) {
    			console.warn("<LastUpdated> was created without expected prop 'changed'");
    		}
    	}

    	get changed() {
    		throw new Error("<LastUpdated>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set changed(value) {
    		throw new Error("<LastUpdated>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Project/SecurityCoverage.svelte generated by Svelte v3.38.2 */

    const file$4 = "src/Project/SecurityCoverage.svelte";

    // (17:0) {#if coverage === 'covered'}
    function create_if_block$2(ctx) {
    	let a;
    	let span;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			span = element("span");
    			img = element("img");
    			if (img.src !== (img_src_value = "/" + drupalSettings.project_browser.module_path + "/images/shield-icon-black.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-fzzmbm");
    			add_location(img, file$4, 17, 149, 490);
    			attr_dev(span, "class", "security-covered svelte-fzzmbm");
    			attr_dev(span, "title", "Covered by Drupal Security Team");
    			add_location(span, file$4, 17, 78, 419);
    			attr_dev(a, "href", "https://www.drupal.org/security-advisory-policy");
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "svelte-fzzmbm");
    			add_location(a, file$4, 17, 4, 345);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span);
    			append_dev(span, img);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(17:0) {#if coverage === 'covered'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;
    	let if_block = /*coverage*/ ctx[0] === "covered" && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*coverage*/ ctx[0] === "covered") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SecurityCoverage", slots, []);
    	let { coverage } = $$props;
    	const writable_props = ["coverage"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SecurityCoverage> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("coverage" in $$props) $$invalidate(0, coverage = $$props.coverage);
    	};

    	$$self.$capture_state = () => ({ coverage });

    	$$self.$inject_state = $$props => {
    		if ("coverage" in $$props) $$invalidate(0, coverage = $$props.coverage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [coverage];
    }

    class SecurityCoverage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { coverage: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SecurityCoverage",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*coverage*/ ctx[0] === undefined && !("coverage" in props)) {
    			console.warn("<SecurityCoverage> was created without expected prop 'coverage'");
    		}
    	}

    	get coverage() {
    		throw new Error("<SecurityCoverage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set coverage(value) {
    		throw new Error("<SecurityCoverage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Project/TaxonomyTerm.svelte generated by Svelte v3.38.2 */
    const file$3 = "src/Project/TaxonomyTerm.svelte";

    // (11:0) {#if taxonomy_term_reference}
    function create_if_block$1(ctx) {
    	let div;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 2,
    		error: 3
    	};

    	handle_promise(promise = fetchEntity(/*taxonomy_term_reference*/ ctx[0].uri), info);

    	const block = {
    		c: function create() {
    			div = element("div");
    			info.block.c();
    			attr_dev(div, "class", /*wrapper_class*/ ctx[1]);
    			add_location(div, file$3, 11, 4, 230);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			info.block.m(div, info.anchor = null);
    			info.mount = () => div;
    			info.anchor = null;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*taxonomy_term_reference*/ 1 && promise !== (promise = fetchEntity(/*taxonomy_term_reference*/ ctx[0].uri)) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}

    			if (dirty & /*wrapper_class*/ 2) {
    				attr_dev(div, "class", /*wrapper_class*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(11:0) {#if taxonomy_term_reference}",
    		ctx
    	});

    	return block;
    }

    // (17:8) {:catch error}
    function create_catch_block(ctx) {
    	let span;
    	let t_value = /*error*/ ctx[3].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			set_style(span, "color", "red");
    			attr_dev(span, "class", "svelte-1ow4dq9");
    			add_location(span, file$3, 17, 12, 474);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*taxonomy_term_reference*/ 1 && t_value !== (t_value = /*error*/ ctx[3].message + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(17:8) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (15:8) {:then term}
    function create_then_block(ctx) {
    	let span;
    	let t_value = /*term*/ ctx[2].name + "";
    	let t;
    	let span_title_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "title", span_title_value = /*term*/ ctx[2].description);
    			attr_dev(span, "class", "svelte-1ow4dq9");
    			add_location(span, file$3, 15, 12, 387);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*taxonomy_term_reference*/ 1 && t_value !== (t_value = /*term*/ ctx[2].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*taxonomy_term_reference*/ 1 && span_title_value !== (span_title_value = /*term*/ ctx[2].description)) {
    				attr_dev(span, "title", span_title_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(15:8) {:then term}",
    		ctx
    	});

    	return block;
    }

    // (13:57)              <span>Loading...</span>         {:then term}
    function create_pending_block(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Loading...";
    			attr_dev(span, "class", "svelte-1ow4dq9");
    			add_location(span, file$3, 13, 12, 330);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(13:57)              <span>Loading...</span>         {:then term}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let if_block = /*taxonomy_term_reference*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*taxonomy_term_reference*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TaxonomyTerm", slots, []);
    	let { taxonomy_term_reference } = $$props;
    	let { wrapper_class } = $$props;
    	const writable_props = ["taxonomy_term_reference", "wrapper_class"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TaxonomyTerm> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("taxonomy_term_reference" in $$props) $$invalidate(0, taxonomy_term_reference = $$props.taxonomy_term_reference);
    		if ("wrapper_class" in $$props) $$invalidate(1, wrapper_class = $$props.wrapper_class);
    	};

    	$$self.$capture_state = () => ({
    		fetchEntity,
    		taxonomy_term_reference,
    		wrapper_class
    	});

    	$$self.$inject_state = $$props => {
    		if ("taxonomy_term_reference" in $$props) $$invalidate(0, taxonomy_term_reference = $$props.taxonomy_term_reference);
    		if ("wrapper_class" in $$props) $$invalidate(1, wrapper_class = $$props.wrapper_class);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [taxonomy_term_reference, wrapper_class];
    }

    class TaxonomyTerm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			taxonomy_term_reference: 0,
    			wrapper_class: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TaxonomyTerm",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*taxonomy_term_reference*/ ctx[0] === undefined && !("taxonomy_term_reference" in props)) {
    			console.warn("<TaxonomyTerm> was created without expected prop 'taxonomy_term_reference'");
    		}

    		if (/*wrapper_class*/ ctx[1] === undefined && !("wrapper_class" in props)) {
    			console.warn("<TaxonomyTerm> was created without expected prop 'wrapper_class'");
    		}
    	}

    	get taxonomy_term_reference() {
    		throw new Error("<TaxonomyTerm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set taxonomy_term_reference(value) {
    		throw new Error("<TaxonomyTerm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wrapper_class() {
    		throw new Error("<TaxonomyTerm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrapper_class(value) {
    		throw new Error("<TaxonomyTerm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Project/Project.svelte generated by Svelte v3.38.2 */
    const file$2 = "src/Project/Project.svelte";

    // (82:16) {#if project.author}
    function create_if_block(ctx) {
    	let div;
    	let t0;
    	let a;
    	let t1_value = /*project*/ ctx[0].author.name + "";
    	let t1;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("By ");
    			a = element("a");
    			t1 = text(t1_value);
    			attr_dev(a, "href", a_href_value = "https://www.drupal.org/user/" + /*project*/ ctx[0].author.id);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "svelte-5ifiip");
    			add_location(a, file$2, 82, 43, 2010);
    			attr_dev(div, "class", "author svelte-5ifiip");
    			add_location(div, file$2, 82, 20, 1987);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, a);
    			append_dev(a, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*project*/ 1 && t1_value !== (t1_value = /*project*/ ctx[0].author.name + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*project*/ 1 && a_href_value !== (a_href_value = "https://www.drupal.org/user/" + /*project*/ ctx[0].author.id)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(82:16) {#if project.author}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div8;
    	let div4;
    	let actionbutton;
    	let t0;
    	let div0;
    	let image;
    	let t1;
    	let div3;
    	let h3;
    	let a;
    	let t2_value = /*project*/ ctx[0].title + "";
    	let t2;
    	let a_href_value;
    	let t3;
    	let securitycoverage;
    	let t4;
    	let div1;
    	let raw_value = /*project*/ ctx[0].body.summary + "";
    	let t5;
    	let div2;
    	let t6;
    	let supportingorganization;
    	let t7;
    	let div7;
    	let div5;
    	let usage;
    	let t8;
    	let taxonomyterm0;
    	let t9;
    	let taxonomyterm1;
    	let t10;
    	let lastupdated;
    	let t11;
    	let div6;
    	let span;
    	let t12;
    	let t13_value = /*project*/ ctx[0].flag_project_star_user_count + "";
    	let t13;
    	let span_title_value;
    	let t14;
    	let categories;
    	let current;

    	actionbutton = new ActionButton({
    			props: { project: /*project*/ ctx[0] },
    			$$inline: true
    		});

    	image = new Image({
    			props: {
    				field_project_images: /*project*/ ctx[0].field_project_images
    			},
    			$$inline: true
    		});

    	securitycoverage = new SecurityCoverage({
    			props: {
    				coverage: /*project*/ ctx[0].field_security_advisory_coverage
    			},
    			$$inline: true
    		});

    	let if_block = /*project*/ ctx[0].author && create_if_block(ctx);

    	supportingorganization = new SupportingOrganization({
    			props: {
    				field_supporting_organizations: /*project*/ ctx[0].field_supporting_organizations
    			},
    			$$inline: true
    		});

    	usage = new Usage({
    			props: {
    				project_usage: /*project*/ ctx[0].project_usage,
    				project_usage_total: /*project*/ ctx[0].project_usage_total
    			},
    			$$inline: true
    		});

    	taxonomyterm0 = new TaxonomyTerm({
    			props: {
    				taxonomy_term_reference: /*project*/ ctx[0].taxonomy_vocabulary_44,
    				wrapper_class: "maintenance-status"
    			},
    			$$inline: true
    		});

    	taxonomyterm1 = new TaxonomyTerm({
    			props: {
    				taxonomy_term_reference: /*project*/ ctx[0].taxonomy_vocabulary_46,
    				wrapper_class: "development-status"
    			},
    			$$inline: true
    		});

    	lastupdated = new LastUpdated({
    			props: { changed: /*project*/ ctx[0].changed },
    			$$inline: true
    		});

    	categories = new Categories({
    			props: {
    				taxonomy_vocabulary_3: /*project*/ ctx[0].taxonomy_vocabulary_3
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div4 = element("div");
    			create_component(actionbutton.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			create_component(image.$$.fragment);
    			t1 = space();
    			div3 = element("div");
    			h3 = element("h3");
    			a = element("a");
    			t2 = text(t2_value);
    			t3 = space();
    			create_component(securitycoverage.$$.fragment);
    			t4 = space();
    			div1 = element("div");
    			t5 = space();
    			div2 = element("div");
    			if (if_block) if_block.c();
    			t6 = space();
    			create_component(supportingorganization.$$.fragment);
    			t7 = space();
    			div7 = element("div");
    			div5 = element("div");
    			create_component(usage.$$.fragment);
    			t8 = space();
    			create_component(taxonomyterm0.$$.fragment);
    			t9 = space();
    			create_component(taxonomyterm1.$$.fragment);
    			t10 = space();
    			create_component(lastupdated.$$.fragment);
    			t11 = space();
    			div6 = element("div");
    			span = element("span");
    			t12 = text("⭐  ");
    			t13 = text(t13_value);
    			t14 = space();
    			create_component(categories.$$.fragment);
    			attr_dev(div0, "class", "left svelte-5ifiip");
    			add_location(div0, file$2, 71, 8, 1498);
    			attr_dev(a, "href", a_href_value = /*project*/ ctx[0].url);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "svelte-5ifiip");
    			add_location(a, file$2, 76, 16, 1666);
    			attr_dev(h3, "class", "svelte-5ifiip");
    			add_location(h3, file$2, 75, 12, 1645);
    			attr_dev(div1, "class", "body svelte-5ifiip");
    			add_location(div1, file$2, 79, 12, 1844);
    			attr_dev(div2, "class", "suffix svelte-5ifiip");
    			add_location(div2, file$2, 80, 12, 1909);
    			attr_dev(div3, "class", "right");
    			add_location(div3, file$2, 74, 8, 1613);
    			attr_dev(div4, "class", "main svelte-5ifiip");
    			add_location(div4, file$2, 69, 4, 1429);
    			attr_dev(div5, "class", "right svelte-5ifiip");
    			add_location(div5, file$2, 89, 8, 2333);
    			attr_dev(span, "title", span_title_value = "Starred by " + /*project*/ ctx[0].flag_project_star_user_count + " users");
    			add_location(span, file$2, 95, 27, 2789);
    			attr_dev(div6, "class", "stars");
    			add_location(div6, file$2, 95, 8, 2770);
    			attr_dev(div7, "class", "metadata svelte-5ifiip");
    			add_location(div7, file$2, 88, 4, 2302);
    			attr_dev(div8, "class", "project svelte-5ifiip");
    			add_location(div8, file$2, 68, 0, 1403);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div4);
    			mount_component(actionbutton, div4, null);
    			append_dev(div4, t0);
    			append_dev(div4, div0);
    			mount_component(image, div0, null);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, h3);
    			append_dev(h3, a);
    			append_dev(a, t2);
    			append_dev(h3, t3);
    			mount_component(securitycoverage, h3, null);
    			append_dev(div3, t4);
    			append_dev(div3, div1);
    			div1.innerHTML = raw_value;
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div2, t6);
    			mount_component(supportingorganization, div2, null);
    			append_dev(div8, t7);
    			append_dev(div8, div7);
    			append_dev(div7, div5);
    			mount_component(usage, div5, null);
    			append_dev(div7, t8);
    			mount_component(taxonomyterm0, div7, null);
    			append_dev(div7, t9);
    			mount_component(taxonomyterm1, div7, null);
    			append_dev(div7, t10);
    			mount_component(lastupdated, div7, null);
    			append_dev(div7, t11);
    			append_dev(div7, div6);
    			append_dev(div6, span);
    			append_dev(span, t12);
    			append_dev(span, t13);
    			append_dev(div7, t14);
    			mount_component(categories, div7, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const actionbutton_changes = {};
    			if (dirty & /*project*/ 1) actionbutton_changes.project = /*project*/ ctx[0];
    			actionbutton.$set(actionbutton_changes);
    			const image_changes = {};
    			if (dirty & /*project*/ 1) image_changes.field_project_images = /*project*/ ctx[0].field_project_images;
    			image.$set(image_changes);
    			if ((!current || dirty & /*project*/ 1) && t2_value !== (t2_value = /*project*/ ctx[0].title + "")) set_data_dev(t2, t2_value);

    			if (!current || dirty & /*project*/ 1 && a_href_value !== (a_href_value = /*project*/ ctx[0].url)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			const securitycoverage_changes = {};
    			if (dirty & /*project*/ 1) securitycoverage_changes.coverage = /*project*/ ctx[0].field_security_advisory_coverage;
    			securitycoverage.$set(securitycoverage_changes);
    			if ((!current || dirty & /*project*/ 1) && raw_value !== (raw_value = /*project*/ ctx[0].body.summary + "")) div1.innerHTML = raw_value;
    			if (/*project*/ ctx[0].author) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div2, t6);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const supportingorganization_changes = {};
    			if (dirty & /*project*/ 1) supportingorganization_changes.field_supporting_organizations = /*project*/ ctx[0].field_supporting_organizations;
    			supportingorganization.$set(supportingorganization_changes);
    			const usage_changes = {};
    			if (dirty & /*project*/ 1) usage_changes.project_usage = /*project*/ ctx[0].project_usage;
    			if (dirty & /*project*/ 1) usage_changes.project_usage_total = /*project*/ ctx[0].project_usage_total;
    			usage.$set(usage_changes);
    			const taxonomyterm0_changes = {};
    			if (dirty & /*project*/ 1) taxonomyterm0_changes.taxonomy_term_reference = /*project*/ ctx[0].taxonomy_vocabulary_44;
    			taxonomyterm0.$set(taxonomyterm0_changes);
    			const taxonomyterm1_changes = {};
    			if (dirty & /*project*/ 1) taxonomyterm1_changes.taxonomy_term_reference = /*project*/ ctx[0].taxonomy_vocabulary_46;
    			taxonomyterm1.$set(taxonomyterm1_changes);
    			const lastupdated_changes = {};
    			if (dirty & /*project*/ 1) lastupdated_changes.changed = /*project*/ ctx[0].changed;
    			lastupdated.$set(lastupdated_changes);
    			if ((!current || dirty & /*project*/ 1) && t13_value !== (t13_value = /*project*/ ctx[0].flag_project_star_user_count + "")) set_data_dev(t13, t13_value);

    			if (!current || dirty & /*project*/ 1 && span_title_value !== (span_title_value = "Starred by " + /*project*/ ctx[0].flag_project_star_user_count + " users")) {
    				attr_dev(span, "title", span_title_value);
    			}

    			const categories_changes = {};
    			if (dirty & /*project*/ 1) categories_changes.taxonomy_vocabulary_3 = /*project*/ ctx[0].taxonomy_vocabulary_3;
    			categories.$set(categories_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(actionbutton.$$.fragment, local);
    			transition_in(image.$$.fragment, local);
    			transition_in(securitycoverage.$$.fragment, local);
    			transition_in(supportingorganization.$$.fragment, local);
    			transition_in(usage.$$.fragment, local);
    			transition_in(taxonomyterm0.$$.fragment, local);
    			transition_in(taxonomyterm1.$$.fragment, local);
    			transition_in(lastupdated.$$.fragment, local);
    			transition_in(categories.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(actionbutton.$$.fragment, local);
    			transition_out(image.$$.fragment, local);
    			transition_out(securitycoverage.$$.fragment, local);
    			transition_out(supportingorganization.$$.fragment, local);
    			transition_out(usage.$$.fragment, local);
    			transition_out(taxonomyterm0.$$.fragment, local);
    			transition_out(taxonomyterm1.$$.fragment, local);
    			transition_out(lastupdated.$$.fragment, local);
    			transition_out(categories.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			destroy_component(actionbutton);
    			destroy_component(image);
    			destroy_component(securitycoverage);
    			if (if_block) if_block.d();
    			destroy_component(supportingorganization);
    			destroy_component(usage);
    			destroy_component(taxonomyterm0);
    			destroy_component(taxonomyterm1);
    			destroy_component(lastupdated);
    			destroy_component(categories);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Project", slots, []);
    	let { project } = $$props;
    	const writable_props = ["project"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Project> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("project" in $$props) $$invalidate(0, project = $$props.project);
    	};

    	$$self.$capture_state = () => ({
    		project,
    		ActionButton,
    		SupportingOrganization,
    		Image,
    		Categories,
    		Usage,
    		LastUpdated,
    		SecurityCoverage,
    		TaxonomyTerm
    	});

    	$$self.$inject_state = $$props => {
    		if ("project" in $$props) $$invalidate(0, project = $$props.project);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [project];
    }

    class Project extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { project: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Project",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*project*/ ctx[0] === undefined && !("project" in props)) {
    			console.warn("<Project> was created without expected prop 'project'");
    		}
    	}

    	get project() {
    		throw new Error("<Project>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set project(value) {
    		throw new Error("<Project>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ProjectBrowser.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;
    const file$1 = "src/ProjectBrowser.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	child_ctx[20] = i;
    	return child_ctx;
    }

    // (132:4) {#each rows2 as row, index (row)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let project;
    	let current;

    	project = new Project({
    			props: { project: /*row*/ ctx[18] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(project.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(project, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const project_changes = {};
    			if (dirty & /*rows2*/ 131072) project_changes.project = /*row*/ ctx[18];
    			project.$set(project_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(project.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(project.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(project, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(132:4) {#each rows2 as row, index (row)}",
    		ctx
    	});

    	return block;
    }

    // (115:0) <ProjectGrid {loading} {rows} {pageIndex} {pageSize} let:rows={rows2}>
    function create_default_slot(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*rows2*/ ctx[17];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*row*/ ctx[18];
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rows2*/ 131072) {
    				each_value = /*rows2*/ ctx[17];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block, each_1_anchor, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(115:0) <ProjectGrid {loading} {rows} {pageIndex} {pageSize} let:rows={rows2}>",
    		ctx
    	});

    	return block;
    }

    // (116:4) 
    function create_top_slot(ctx) {
    	let div2;
    	let div0;
    	let ul;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;
    	let t3;
    	let div1;
    	let p;
    	let t5;
    	let search;
    	let t6;
    	let pagination;
    	let current;
    	let mounted;
    	let dispose;
    	search = new Search({ $$inline: true });
    	search.$on("search", /*onSearch*/ ctx[8]);
    	search.$on("selectCategory", /*onSelectCategory*/ ctx[9]);

    	pagination = new Pagination({
    			props: {
    				page: /*page*/ ctx[1],
    				pageSize: /*pageSize*/ ctx[6],
    				count: /*rowsCount*/ ctx[3],
    				serverSide: true
    			},
    			$$inline: true
    		});

    	pagination.$on("pageChange", /*onPageChange*/ ctx[7]);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Recommended projects";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "All projects";
    			t3 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Recommended projects must be covered by Drupal's security team, have at least one release, be actively maintained, be a full (not sandbox) project, and have an issue queue available.";
    			t5 = space();
    			create_component(search.$$.fragment);
    			t6 = space();
    			create_component(pagination.$$.fragment);
    			attr_dev(a0, "class", "tabs__link js-tabs-link");
    			toggle_class(a0, "is-active", /*tab*/ ctx[4] === "recommended");
    			add_location(a0, file$1, 120, 20, 3519);
    			attr_dev(li0, "class", "tabs__tab js-tab is-active svelte-1g5olsn");
    			toggle_class(li0, "js-active-tab", /*tab*/ ctx[4] === "recommended");
    			add_location(li0, file$1, 119, 16, 3413);
    			attr_dev(a1, "title", "All published projects");
    			attr_dev(a1, "class", "tabs__link js-tabs-link");
    			toggle_class(a1, "is-active", /*tab*/ ctx[4] === "all");
    			add_location(a1, file$1, 123, 20, 3774);
    			attr_dev(li1, "class", "tabs__tab js-tab svelte-1g5olsn");
    			toggle_class(li1, "js-active-tab", /*tab*/ ctx[4] === "all");
    			add_location(li1, file$1, 122, 16, 3686);
    			attr_dev(ul, "class", "tabs tabs--secondary clearfix");
    			add_location(ul, file$1, 117, 12, 3250);
    			attr_dev(div0, "class", "smart-filters tabs-wrapper is-horizontal is-collapsible position-container is-horizontal-enabled");
    			add_location(div0, file$1, 116, 8, 3127);
    			add_location(p, file$1, 127, 46, 4011);
    			attr_dev(div1, "class", "smart-filter-description svelte-1g5olsn");
    			add_location(div1, file$1, 127, 8, 3973);
    			attr_dev(div2, "slot", "top");
    			add_location(div2, file$1, 115, 4, 3102);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(div2, t5);
    			mount_component(search, div2, null);
    			append_dev(div2, t6);
    			mount_component(pagination, div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*showRecommended*/ ctx[10], false, false, false),
    					listen_dev(a1, "click", /*showAll*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tab*/ 16) {
    				toggle_class(a0, "is-active", /*tab*/ ctx[4] === "recommended");
    			}

    			if (dirty & /*tab*/ 16) {
    				toggle_class(li0, "js-active-tab", /*tab*/ ctx[4] === "recommended");
    			}

    			if (dirty & /*tab*/ 16) {
    				toggle_class(a1, "is-active", /*tab*/ ctx[4] === "all");
    			}

    			if (dirty & /*tab*/ 16) {
    				toggle_class(li1, "js-active-tab", /*tab*/ ctx[4] === "all");
    			}

    			const pagination_changes = {};
    			if (dirty & /*page*/ 2) pagination_changes.page = /*page*/ ctx[1];
    			if (dirty & /*rowsCount*/ 8) pagination_changes.count = /*rowsCount*/ ctx[3];
    			pagination.$set(pagination_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(search.$$.fragment, local);
    			transition_in(pagination.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(search.$$.fragment, local);
    			transition_out(pagination.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(search);
    			destroy_component(pagination);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_top_slot.name,
    		type: "slot",
    		source: "(116:4) ",
    		ctx
    	});

    	return block;
    }

    // (135:4) 
    function create_bottom_slot(ctx) {
    	let div;
    	let pagination;
    	let current;

    	pagination = new Pagination({
    			props: {
    				page: /*page*/ ctx[1],
    				pageSize: /*pageSize*/ ctx[6],
    				count: /*rowsCount*/ ctx[3],
    				serverSide: true
    			},
    			$$inline: true
    		});

    	pagination.$on("pageChange", /*onPageChange*/ ctx[7]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(pagination.$$.fragment);
    			attr_dev(div, "slot", "bottom");
    			add_location(div, file$1, 134, 4, 4488);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(pagination, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const pagination_changes = {};
    			if (dirty & /*page*/ 2) pagination_changes.page = /*page*/ ctx[1];
    			if (dirty & /*rowsCount*/ 8) pagination_changes.count = /*rowsCount*/ ctx[3];
    			pagination.$set(pagination_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pagination.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pagination.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(pagination);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_bottom_slot.name,
    		type: "slot",
    		source: "(135:4) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let projectgrid;
    	let current;

    	projectgrid = new ProjectGrid({
    			props: {
    				loading: /*loading*/ ctx[2],
    				rows: /*rows*/ ctx[0],
    				pageIndex: /*pageIndex*/ ctx[5],
    				pageSize: /*pageSize*/ ctx[6],
    				$$slots: {
    					bottom: [
    						create_bottom_slot,
    						({ rows: rows2 }) => ({ 17: rows2 }),
    						({ rows: rows2 }) => rows2 ? 131072 : 0
    					],
    					top: [
    						create_top_slot,
    						({ rows: rows2 }) => ({ 17: rows2 }),
    						({ rows: rows2 }) => rows2 ? 131072 : 0
    					],
    					default: [
    						create_default_slot,
    						({ rows: rows2 }) => ({ 17: rows2 }),
    						({ rows: rows2 }) => rows2 ? 131072 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(projectgrid.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(projectgrid, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const projectgrid_changes = {};
    			if (dirty & /*loading*/ 4) projectgrid_changes.loading = /*loading*/ ctx[2];
    			if (dirty & /*rows*/ 1) projectgrid_changes.rows = /*rows*/ ctx[0];

    			if (dirty & /*$$scope, page, rowsCount, tab, rows2*/ 2228250) {
    				projectgrid_changes.$$scope = { dirty, ctx };
    			}

    			projectgrid.$set(projectgrid_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projectgrid.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projectgrid.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(projectgrid, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getParameterByName(name, url = window.location.href) {
    	name = name.replace(/[\[\]]/g, "\\$&");

    	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    		results = regex.exec(url);

    	if (!results) return null;
    	if (!results[2]) return "";
    	return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    function onCellClick(row) {
    	
    } // alert(JSON.stringify(row));

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProjectBrowser", slots, []);
    	let data;
    	let rows = [];
    	let page = 0; // first page
    	let pageIndex = 0; // first row
    	let pageSize = 12;
    	let loading = true;

    	// Total result set size.
    	let rowsCount = 0;

    	let text = "";
    	let category;
    	let tab = "recommended";

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
    		$$invalidate(2, loading = true);

    		// Additional query parameters are hardcoded in DrupalOrgProxyController::getAll();
    		let url = "http://local.project-browser.com/drupal-org-proxy/project?page=" + _page + "&limit=" + pageSize + "&tab=" + tab;

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
    			$$invalidate(0, rows = data.list);
    			console.log(data);
    			$$invalidate(3, rowsCount = getRowCount(data));
    		} else {
    			$$invalidate(0, rows = []);
    			$$invalidate(3, rowsCount = 0);
    		}

    		$$invalidate(2, loading = false);
    	}

    	/**
     * @todo Make this accurate. It's currently an approximation because it assumes even the last
     * page of results contains a full 25 rows. It's possible the last page contains fewer.
     * @param data
     * @returns {number}
     */
    	function getRowCount(data) {
    		var last_page_num = getParameterByName("page", data.last);
    		return last_page_num * pageSize;
    	}

    	function onPageChange(event) {
    		load(event.detail.page);
    		$$invalidate(1, page = event.detail.page);
    	}

    	async function onSearch(event) {
    		text = event.detail.text;
    		await load(page);
    		$$invalidate(1, page = 0);
    	}

    	async function onSelectCategory(event) {
    		category = event.detail.category;
    		await load(page);
    		$$invalidate(1, page = 0);
    	}

    	async function showRecommended() {
    		$$invalidate(4, tab = "recommended");
    		await load(0);
    	}

    	async function showAll() {
    		$$invalidate(4, tab = "all");
    		await load(0);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<ProjectBrowser> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		ProjectGrid,
    		Pagination,
    		Search,
    		Project,
    		data,
    		rows,
    		page,
    		pageIndex,
    		pageSize,
    		loading,
    		rowsCount,
    		text,
    		category,
    		tab,
    		load,
    		getRowCount,
    		getParameterByName,
    		onCellClick,
    		onPageChange,
    		onSearch,
    		onSelectCategory,
    		showRecommended,
    		showAll
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) data = $$props.data;
    		if ("rows" in $$props) $$invalidate(0, rows = $$props.rows);
    		if ("page" in $$props) $$invalidate(1, page = $$props.page);
    		if ("pageIndex" in $$props) $$invalidate(5, pageIndex = $$props.pageIndex);
    		if ("pageSize" in $$props) $$invalidate(6, pageSize = $$props.pageSize);
    		if ("loading" in $$props) $$invalidate(2, loading = $$props.loading);
    		if ("rowsCount" in $$props) $$invalidate(3, rowsCount = $$props.rowsCount);
    		if ("text" in $$props) text = $$props.text;
    		if ("category" in $$props) category = $$props.category;
    		if ("tab" in $$props) $$invalidate(4, tab = $$props.tab);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		rows,
    		page,
    		loading,
    		rowsCount,
    		tab,
    		pageIndex,
    		pageSize,
    		onPageChange,
    		onSearch,
    		onSelectCategory,
    		showRecommended,
    		showAll
    	];
    }

    class ProjectBrowser extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProjectBrowser",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.38.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div;
    	let projectbrowser;
    	let t;
    	let modal_1;
    	let current;
    	projectbrowser = new ProjectBrowser({ $$inline: true });

    	modal_1 = new Modal({
    			props: { show: /*$modal*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			create_component(projectbrowser.$$.fragment);
    			t = space();
    			create_component(modal_1.$$.fragment);
    			attr_dev(div, "id", "project-browser");
    			add_location(div, file, 17, 1, 581);
    			add_location(main, file, 16, 0, 573);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			mount_component(projectbrowser, div, null);
    			append_dev(main, t);
    			mount_component(modal_1, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal_1_changes = {};
    			if (dirty & /*$modal*/ 1) modal_1_changes.show = /*$modal*/ ctx[0];
    			modal_1.$set(modal_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projectbrowser.$$.fragment, local);
    			transition_in(modal_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projectbrowser.$$.fragment, local);
    			transition_out(modal_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(projectbrowser);
    			destroy_component(modal_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $modal;
    	validate_store(modal, "modal");
    	component_subscribe($$self, modal, $$value => $$invalidate(0, $modal = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let data = [];

    	onMount(async () => {
    		// todo Make this URL dynamic. It would work to simply change this to
    		// "/drupal-org-proxy/project" for when the Svelete JS is loaded within a Drupal page,
    		// but that would not work during development when viewing the Svelte app on http://localhost:5000/.
    		const res = await fetch(`/drupal-org-proxy/project`);

    		data = await res.json();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		Modal,
    		modal,
    		ProjectBrowser,
    		data,
    		$modal
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) data = $$props.data;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$modal];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	// The #project-browser markup is returned by the project_browser.browse Drupal route.
    	target: document.querySelector('#project-browser'),
    	props: {
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

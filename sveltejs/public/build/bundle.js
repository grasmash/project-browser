
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
    const file$8 = "src/Modal.svelte";

    // (323:0) {#if Component}
    function create_if_block$4(ctx) {
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
    	let if_block = /*state*/ ctx[0].closeButton && create_if_block_1$3(ctx);
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
    			add_location(div0, file$8, 351, 16, 9722);
    			attr_dev(div1, "class", "window svelte-hz6fyb");
    			attr_dev(div1, "role", "dialog");
    			attr_dev(div1, "aria-modal", "true");
    			attr_dev(div1, "style", /*cssWindow*/ ctx[7]);
    			add_location(div1, file$8, 332, 12, 8893);
    			attr_dev(div2, "class", "window-wrap svelte-hz6fyb");
    			attr_dev(div2, "style", /*cssWindowWrap*/ ctx[6]);
    			add_location(div2, file$8, 331, 8, 8816);
    			attr_dev(div3, "class", "bg svelte-hz6fyb");
    			attr_dev(div3, "style", /*cssBg*/ ctx[5]);
    			add_location(div3, file$8, 323, 4, 8552);
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
    					if_block = create_if_block_1$3(ctx);
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
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(323:0) {#if Component}",
    		ctx
    	});

    	return block;
    }

    // (345:16) {#if state.closeButton}
    function create_if_block_1$3(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2$1, create_else_block$3];
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
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(345:16) {#if state.closeButton}",
    		ctx
    	});

    	return block;
    }

    // (348:20) {:else}
    function create_else_block$3(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", "close svelte-hz6fyb");
    			attr_dev(button, "style", /*cssCloseButton*/ ctx[9]);
    			add_location(button, file$8, 348, 24, 9593);
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
    		id: create_else_block$3.name,
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

    function create_fragment$8(ctx) {
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*Component*/ ctx[1] && create_if_block$4(ctx);
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
    					if_block = create_if_block$4(ctx);
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
    		id: create_fragment$8.name,
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

    function instance$8($$self, $$props, $$invalidate) {
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
    			instance$8,
    			create_fragment$8,
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
    			id: create_fragment$8.name
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

    /* src/Sort.svelte generated by Svelte v3.38.2 */
    const file$7 = "src/Sort.svelte";

    // (60:2) {:else}
    function create_else_block$2(ctx) {
    	let span;
    	let raw_value = /*labels*/ ctx[1].unsorted.html + "";
    	let span_title_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "title", span_title_value = /*labels*/ ctx[1].unsorted.title);
    			add_location(span, file$7, 60, 4, 1399);
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
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(60:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (56:27) 
    function create_if_block_1$2(ctx) {
    	let span;
    	let raw_value = /*labels*/ ctx[1].desc.html + "";
    	let span_title_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "title", span_title_value = /*labels*/ ctx[1].desc.title);
    			add_location(span, file$7, 56, 4, 1309);
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
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(56:27) ",
    		ctx
    	});

    	return block;
    }

    // (52:2) {#if dir === 'asc'}
    function create_if_block$3(ctx) {
    	let span;
    	let raw_value = /*labels*/ ctx[1].asc.html + "";
    	let span_title_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "title", span_title_value = /*labels*/ ctx[1].asc.title);
    			add_location(span, file$7, 52, 4, 1203);
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
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(52:2) {#if dir === 'asc'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let span;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*dir*/ ctx[0] === "asc") return create_if_block$3;
    		if (/*dir*/ ctx[0] === "desc") return create_if_block_1$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if_block.c();
    			attr_dev(span, "class", "sort svelte-13q1u02");
    			add_location(span, file$7, 50, 0, 1138);
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
    		id: create_fragment$7.name,
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

    function instance$7($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { dir: 0, key: 3, labels: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sort",
    			options,
    			id: create_fragment$7.name
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

    /* src/Search.svelte generated by Svelte v3.38.2 */
    const file$6 = "src/Search.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let input;
    	let input_title_value;
    	let input_placeholder_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			attr_dev(input, "type", "search");
    			attr_dev(input, "title", input_title_value = /*labels*/ ctx[1].placeholder);
    			attr_dev(input, "placeholder", input_placeholder_value = /*labels*/ ctx[1].placeholder);
    			attr_dev(input, "class", "svelte-h52piv");
    			add_location(input, file$6, 82, 4, 1969);
    			attr_dev(div, "class", "search svelte-h52piv");
    			add_location(div, file$6, 81, 0, 1944);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*text*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
    					listen_dev(input, "keyup", /*onSearch*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*labels*/ 2 && input_title_value !== (input_title_value = /*labels*/ ctx[1].placeholder)) {
    				attr_dev(input, "title", input_title_value);
    			}

    			if (dirty & /*labels*/ 2 && input_placeholder_value !== (input_placeholder_value = /*labels*/ ctx[1].placeholder)) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty & /*text*/ 1) {
    				set_input_value(input, /*text*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
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

    let globalLabels$2;

    function setLabels$1(labels) {
    	globalLabels$2 = labels;
    }

    function instance$6($$self, $$props, $$invalidate) {
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

    	const writable_props = ["filter", "index", "text", "labels"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Search> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		text = this.value;
    		$$invalidate(0, text);
    	}

    	$$self.$$set = $$props => {
    		if ("filter" in $$props) $$invalidate(3, filter = $$props.filter);
    		if ("index" in $$props) $$invalidate(4, index = $$props.index);
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("labels" in $$props) $$invalidate(1, labels = $$props.labels);
    	};

    	$$self.$capture_state = () => ({
    		globalLabels: globalLabels$2,
    		setLabels: setLabels$1,
    		createEventDispatcher,
    		getContext,
    		dispatch,
    		stateContext,
    		filter,
    		index,
    		text,
    		labels,
    		onSearch
    	});

    	$$self.$inject_state = $$props => {
    		if ("filter" in $$props) $$invalidate(3, filter = $$props.filter);
    		if ("index" in $$props) $$invalidate(4, index = $$props.index);
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("labels" in $$props) $$invalidate(1, labels = $$props.labels);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, labels, onSearch, filter, index, input_input_handler];
    }

    class Search extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { filter: 3, index: 4, text: 0, labels: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Search",
    			options,
    			id: create_fragment$6.name
    		});
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

    	get labels() {
    		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labels(value) {
    		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Pagination.svelte generated by Svelte v3.38.2 */
    const file$5 = "src/Pagination.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (84:8) {#if page + button >= 0 && page + button <= pageCount}
    function create_if_block$2(ctx) {
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
    			attr_dev(button, "class", "svelte-dl9idu");
    			toggle_class(button, "active", /*page*/ ctx[2] === /*page*/ ctx[2] + /*button*/ ctx[15]);
    			add_location(button, file$5, 85, 16, 1947);
    			attr_dev(li, "class", "svelte-dl9idu");
    			add_location(li, file$5, 84, 12, 1926);
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
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(84:8) {#if page + button >= 0 && page + button <= pageCount}",
    		ctx
    	});

    	return block;
    }

    // (83:4) {#each buttons as button}
    function create_each_block$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*page*/ ctx[2] + /*button*/ ctx[15] >= 0 && /*page*/ ctx[2] + /*button*/ ctx[15] <= /*pageCount*/ ctx[4] && create_if_block$2(ctx);

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
    					if_block = create_if_block$2(ctx);
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(83:4) {#each buttons as button}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
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
    	let div;
    	let t9;
    	let t10;
    	let mounted;
    	let dispose;
    	let each_value = /*buttons*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
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
    			div = element("div");
    			t9 = text(/*count*/ ctx[1]);
    			t10 = text(" total rows");
    			button0.disabled = button0_disabled_value = /*page*/ ctx[2] === 0;
    			attr_dev(button0, "class", "svelte-dl9idu");
    			add_location(button0, file$5, 73, 8, 1560);
    			attr_dev(li0, "class", "svelte-dl9idu");
    			add_location(li0, file$5, 72, 4, 1547);
    			button1.disabled = button1_disabled_value = /*page*/ ctx[2] === 0;
    			attr_dev(button1, "class", "svelte-dl9idu");
    			add_location(button1, file$5, 78, 8, 1694);
    			attr_dev(li1, "class", "svelte-dl9idu");
    			add_location(li1, file$5, 77, 4, 1681);
    			button2.disabled = button2_disabled_value = /*page*/ ctx[2] > /*pageCount*/ ctx[4] - 1;
    			attr_dev(button2, "class", "svelte-dl9idu");
    			add_location(button2, file$5, 94, 8, 2212);
    			attr_dev(li2, "class", "svelte-dl9idu");
    			add_location(li2, file$5, 93, 4, 2199);
    			button3.disabled = button3_disabled_value = /*page*/ ctx[2] >= /*pageCount*/ ctx[4];
    			attr_dev(button3, "class", "svelte-dl9idu");
    			add_location(button3, file$5, 101, 8, 2394);
    			attr_dev(li3, "class", "svelte-dl9idu");
    			add_location(li3, file$5, 100, 4, 2381);
    			attr_dev(ul, "class", "svelte-dl9idu");
    			add_location(ul, file$5, 71, 0, 1538);
    			add_location(div, file$5, 106, 0, 2531);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
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
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, t9);
    			append_dev(div, t10);

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
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
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

    let globalLabels$1;

    function setLabels(labels) {
    	globalLabels$1 = labels;
    }

    function instance$5($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
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
    			id: create_fragment$5.name
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
    const file$4 = "src/ProjectGrid.svelte";
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

    // (100:17)      
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
    			attr_dev(div, "class", "slot-top svelte-eihsbi");
    			add_location(div, file$4, 100, 4, 2328);
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
    		source: "(100:17)      ",
    		ctx
    	});

    	return block;
    }

    // (112:4) {:else}
    function create_else_block$1(ctx) {
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
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(112:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (110:39) 
    function create_if_block_1$1(ctx) {
    	let div;
    	let raw_value = /*labels*/ ctx[5].empty + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			add_location(div, file$4, 110, 8, 2639);
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
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(110:39) ",
    		ctx
    	});

    	return block;
    }

    // (108:4) {#if loading}
    function create_if_block$1(ctx) {
    	let div;
    	let raw_value = /*labels*/ ctx[5].loading + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "loading svelte-eihsbi");
    			add_location(div, file$4, 108, 8, 2541);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*labels*/ 32 && raw_value !== (raw_value = /*labels*/ ctx[5].loading + "")) div.innerHTML = raw_value;		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(108:4) {#if loading}",
    		ctx
    	});

    	return block;
    }

    // (118:20)      
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
    			attr_dev(div, "class", "slot-bottom svelte-eihsbi");
    			add_location(div, file$4, 118, 4, 2787);
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
    		source: "(118:20)      ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
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
    	const if_block_creators = [create_if_block$1, create_if_block_1$1, create_else_block$1];
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
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty("grid " + /*$$props*/ ctx[10].class) + " svelte-eihsbi"));
    			toggle_class(div, "responsive", /*responsive*/ ctx[3]);
    			add_location(div, file$4, 105, 0, 2435);
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

    			if (!current || dirty & /*$$props*/ 1024 && div_class_value !== (div_class_value = "" + (null_to_empty("grid " + /*$$props*/ ctx[10].class) + " svelte-eihsbi"))) {
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
    		id: create_fragment$4.name,
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

    function instance$4($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
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
    			id: create_fragment$4.name
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

    function sortString(rows, dir, key) {
        return rows.sort((a, b) =>
            dir === "asc"
                ? ("" + a[key]).localeCompare(b[key])
                : ("" + b[key]).localeCompare(a[key])
        );
    }

    function sortNumber(rows, dir, key) {
        return rows.sort((a, b) =>
            dir === "asc" ? a[key] - b[key] : b[key] - a[key]
        );
    }

    /* src/DownloadPopup.svelte generated by Svelte v3.38.2 */

    const file$3 = "src/DownloadPopup.svelte";

    function create_fragment$3(ctx) {
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
    	let h31;
    	let t19;
    	let p3;
    	let t20;
    	let a2;
    	let t21;
    	let a2_href_value;
    	let t22;
    	let t23;
    	let p4;
    	let t24;
    	let a3;
    	let t26;
    	let t27;
    	let pre1;
    	let t28;
    	let t29_value = /*project*/ ctx[0].field_project_machine_name + "";
    	let t29;

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
    			h31 = element("h3");
    			h31.textContent = "2. Install";
    			t19 = space();
    			p3 = element("p");
    			t20 = text("To use the module you must next install/enable it. Visit the ");
    			a2 = element("a");
    			t21 = text("modules page");
    			t22 = text(" to install the module using your web browser.");
    			t23 = space();
    			p4 = element("p");
    			t24 = text("Alternatively, you can use ");
    			a3 = element("a");
    			a3.textContent = "drush";
    			t26 = text(" to enable it via the CLI:");
    			t27 = space();
    			pre1 = element("pre");
    			t28 = text("drush pm-enable ");
    			t29 = text(t29_value);
    			attr_dev(h2, "class", "svelte-5u68qx");
    			add_location(h2, file$3, 29, 0, 619);
    			add_location(h30, file$3, 31, 0, 645);
    			attr_dev(a0, "href", "https://www.drupal.org/docs/develop/using-composer/using-composer-to-install-drupal-and-manage-dependencies#managing-contributed");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$3, 33, 7, 674);
    			attr_dev(a1, "href", "https://getcomposer.org/");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$3, 33, 220, 887);
    			add_location(p0, file$3, 33, 0, 667);
    			add_location(p1, file$3, 35, 0, 957);
    			attr_dev(pre0, "class", "svelte-5u68qx");
    			add_location(pre0, file$3, 37, 0, 1144);
    			add_location(p2, file$3, 41, 0, 1247);
    			add_location(h31, file$3, 43, 0, 1303);
    			attr_dev(a2, "href", a2_href_value = "/admin/modules#module-" + /*project*/ ctx[0].field_project_machine_name);
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$3, 45, 64, 1388);
    			add_location(p3, file$3, 45, 0, 1324);
    			attr_dev(a3, "href", "https://www.drush.org/latest/");
    			attr_dev(a3, "target", "_blank");
    			add_location(a3, file$3, 46, 30, 1570);
    			add_location(p4, file$3, 46, 0, 1540);
    			attr_dev(pre1, "class", "svelte-5u68qx");
    			add_location(pre1, file$3, 47, 0, 1666);
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
    			insert_dev(target, h31, anchor);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, p3, anchor);
    			append_dev(p3, t20);
    			append_dev(p3, a2);
    			append_dev(a2, t21);
    			append_dev(p3, t22);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, p4, anchor);
    			append_dev(p4, t24);
    			append_dev(p4, a3);
    			append_dev(p4, t26);
    			insert_dev(target, t27, anchor);
    			insert_dev(target, pre1, anchor);
    			append_dev(pre1, t28);
    			append_dev(pre1, t29);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*project*/ 1 && t0_value !== (t0_value = /*project*/ ctx[0].title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*project*/ 1 && t13_value !== (t13_value = /*project*/ ctx[0].field_project_machine_name + "")) set_data_dev(t13, t13_value);

    			if (dirty & /*project*/ 1 && a2_href_value !== (a2_href_value = "/admin/modules#module-" + /*project*/ ctx[0].field_project_machine_name)) {
    				attr_dev(a2, "href", a2_href_value);
    			}

    			if (dirty & /*project*/ 1 && t29_value !== (t29_value = /*project*/ ctx[0].field_project_machine_name + "")) set_data_dev(t29, t29_value);
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
    			if (detaching) detach_dev(h31);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t27);
    			if (detaching) detach_dev(pre1);
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { project: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DownloadPopup",
    			options,
    			id: create_fragment$3.name
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

    /* src/DownloadButton.svelte generated by Svelte v3.38.2 */
    const file$2 = "src/DownloadButton.svelte";

    function create_fragment$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Download";
    			add_location(button, file$2, 21, 0, 509);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*showPopupWithProps*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DownloadButton", slots, []);
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DownloadButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("project" in $$props) $$invalidate(1, project = $$props.project);
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
    		showPopupWithProps
    	});

    	$$self.$inject_state = $$props => {
    		if ("opening" in $$props) opening = $$props.opening;
    		if ("opened" in $$props) opened = $$props.opened;
    		if ("closing" in $$props) closing = $$props.closing;
    		if ("closed" in $$props) closed = $$props.closed;
    		if ("project" in $$props) $$invalidate(1, project = $$props.project);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showPopupWithProps, project];
    }

    class DownloadButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { project: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DownloadButton",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*project*/ ctx[1] === undefined && !("project" in props)) {
    			console.warn("<DownloadButton> was created without expected prop 'project'");
    		}
    	}

    	get project() {
    		throw new Error("<DownloadButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set project(value) {
    		throw new Error("<DownloadButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ProjectBrowser.svelte generated by Svelte v3.38.2 */

    const { Error: Error_1, Object: Object_1, console: console_1 } = globals;
    const file$1 = "src/ProjectBrowser.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	child_ctx[20] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i][0];
    	child_ctx[22] = list[i][1];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	return child_ctx;
    }

    // (165:20) {:else}
    function create_else_block_3(ctx) {
    	let downloadbutton;
    	let current;

    	downloadbutton = new DownloadButton({
    			props: { project: /*row*/ ctx[18] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(downloadbutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(downloadbutton, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const downloadbutton_changes = {};
    			if (dirty & /*rows2*/ 131072) downloadbutton_changes.project = /*row*/ ctx[18];
    			downloadbutton.$set(downloadbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(downloadbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(downloadbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(downloadbutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(165:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (163:82) 
    function create_if_block_6(ctx) {
    	let a;
    	let button;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			button = element("button");
    			button.textContent = "Install";
    			attr_dev(button, "type", "button");
    			add_location(button, file$1, 163, 105, 4905);
    			attr_dev(a, "href", a_href_value = "/admin/modules#module-" + /*row*/ ctx[18].field_project_machine_name);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$1, 163, 24, 4824);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, button);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rows2*/ 131072 && a_href_value !== (a_href_value = "/admin/modules#module-" + /*row*/ ctx[18].field_project_machine_name)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(163:82) ",
    		ctx
    	});

    	return block;
    }

    // (161:20) {#if projectIsEnabled(row.field_project_machine_name)}
    function create_if_block_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Installed");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(161:20) {#if projectIsEnabled(row.field_project_machine_name)}",
    		ctx
    	});

    	return block;
    }

    // (170:20) {#if typeof row.field_project_images !== "undefined" && row.field_project_images.length}
    function create_if_block_4(ctx) {
    	let await_block_anchor;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 28,
    		error: 29
    	};

    	handle_promise(promise = /*getFileUrl*/ ctx[6](/*row*/ ctx[18].field_project_images[0].file.id), info);

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

    			if (dirty & /*rows2*/ 131072 && promise !== (promise = /*getFileUrl*/ ctx[6](/*row*/ ctx[18].field_project_images[0].file.id)) && handle_promise(promise, info)) ; else {
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
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(170:20) {#if typeof row.field_project_images !== \\\"undefined\\\" && row.field_project_images.length}",
    		ctx
    	});

    	return block;
    }

    // (175:24) {:catch error}
    function create_catch_block(ctx) {
    	let p;
    	let t_value = /*error*/ ctx[29].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			set_style(p, "color", "red");
    			add_location(p, file$1, 175, 28, 5544);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rows2*/ 131072 && t_value !== (t_value = /*error*/ ctx[29].message + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(175:24) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (173:24) {:then url}
    function create_then_block(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*url*/ ctx[28])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*row*/ ctx[18].field_project_images[0].alt);
    			attr_dev(img, "class", "svelte-8ye9yr");
    			add_location(img, file$1, 173, 28, 5418);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rows2*/ 131072 && img.src !== (img_src_value = /*url*/ ctx[28])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*rows2*/ 131072 && img_alt_value !== (img_alt_value = /*row*/ ctx[18].field_project_images[0].alt)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(173:24) {:then url}",
    		ctx
    	});

    	return block;
    }

    // (171:80) }
    function create_pending_block(ctx) {
    	let t0;
    	let p;

    	const block = {
    		c: function create() {
    			t0 = text("}\n                            ");
    			p = element("p");
    			p.textContent = "...waiting";
    			add_location(p, file$1, 171, 28, 5336);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(171:80) }",
    		ctx
    	});

    	return block;
    }

    // (183:24) {#if row.field_security_advisory_coverage === 'covered'}
    function create_if_block_3(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "🛡";
    			attr_dev(span, "class", "security-covered");
    			attr_dev(span, "title", "Covered by Drupal Security Team");
    			add_location(span, file$1, 183, 28, 5914);
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
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(183:24) {#if row.field_security_advisory_coverage === 'covered'}",
    		ctx
    	});

    	return block;
    }

    // (194:20) {:else}
    function create_else_block_2(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Unknown";
    			add_location(span, file$1, 194, 24, 6431);
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
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(194:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (192:20) {#if row.taxonomy_vocabulary_44}
    function create_if_block_2(ctx) {
    	let t_value = /*row*/ ctx[18].maintenance_status + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rows2*/ 131072 && t_value !== (t_value = /*row*/ ctx[18].maintenance_status + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(192:20) {#if row.taxonomy_vocabulary_44}",
    		ctx
    	});

    	return block;
    }

    // (201:20) {:else}
    function create_else_block_1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Unknown";
    			add_location(span, file$1, 201, 24, 6709);
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
    		source: "(201:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (199:20) {#if row.taxonomy_vocabulary_46}
    function create_if_block_1(ctx) {
    	let t_value = /*row*/ ctx[18].development_status + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rows2*/ 131072 && t_value !== (t_value = /*row*/ ctx[18].development_status + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(199:20) {#if row.taxonomy_vocabulary_46}",
    		ctx
    	});

    	return block;
    }

    // (207:24) {#each row.taxonomy_vocabulary_3 || [] as category}
    function create_each_block_2(ctx) {
    	let li;
    	let t_value = /*category*/ ctx[25].uri + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "category");
    			add_location(li, file$1, 207, 28, 6954);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rows2*/ 131072 && t_value !== (t_value = /*category*/ ctx[25].uri + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(207:24) {#each row.taxonomy_vocabulary_3 || [] as category}",
    		ctx
    	});

    	return block;
    }

    // (219:20) {:else}
    function create_else_block(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "No reported usage.";
    			add_location(span, file$1, 219, 24, 7462);
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
    		id: create_else_block.name,
    		type: "else",
    		source: "(219:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (213:20) {#if row.project_usage}
    function create_if_block(ctx) {
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value_1 = Object.entries(/*row*/ ctx[18].project_usage);
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*key*/ ctx[21];
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(ul, file$1, 213, 24, 7185);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, rows2*/ 131072) {
    				each_value_1 = Object.entries(/*row*/ ctx[18].project_usage);
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, ul, destroy_block, create_each_block_1, null, get_each_context_1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(213:20) {#if row.project_usage}",
    		ctx
    	});

    	return block;
    }

    // (215:28) {#each Object.entries(row.project_usage) as [key, val] (key) }
    function create_each_block_1(key_1, ctx) {
    	let li;
    	let t0_value = /*key*/ ctx[21] + "";
    	let t0;
    	let t1;
    	let t2_value = /*val*/ ctx[22] + "";
    	let t2;
    	let t3;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = text(": ");
    			t2 = text(t2_value);
    			t3 = text(" installs");
    			add_location(li, file$1, 215, 32, 7313);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    			append_dev(li, t3);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*rows2*/ 131072 && t0_value !== (t0_value = /*key*/ ctx[21] + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*rows2*/ 131072 && t2_value !== (t2_value = /*val*/ ctx[22] + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(215:28) {#each Object.entries(row.project_usage) as [key, val] (key) }",
    		ctx
    	});

    	return block;
    }

    // (157:4) {#each rows2 as row, index (row)}
    function create_each_block(key_1, ctx) {
    	let div10;
    	let div4;
    	let div0;
    	let show_if;
    	let show_if_1;
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let div1;
    	let t1;
    	let div3;
    	let h3;
    	let a;
    	let t2_value = /*row*/ ctx[18].title + "";
    	let t2;
    	let a_href_value;
    	let t3;
    	let t4;
    	let div2;
    	let raw_value = String(/*row*/ ctx[18].body.value).substring(0, 200) + "..." + "";
    	let t5;
    	let div9;
    	let div5;
    	let t6;
    	let div6;
    	let t7;
    	let div7;
    	let ul;
    	let t8;
    	let div8;
    	let t9;
    	let current;
    	const if_block_creators = [create_if_block_5, create_if_block_6, create_else_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*rows2*/ 131072) show_if = !!projectIsEnabled(/*row*/ ctx[18].field_project_machine_name);
    		if (show_if) return 0;
    		if (dirty & /*rows2*/ 131072) show_if_1 = !!projectIsDownloaded(/*row*/ ctx[18].field_project_machine_name);
    		if (show_if_1) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx, -1);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = typeof /*row*/ ctx[18].field_project_images !== "undefined" && /*row*/ ctx[18].field_project_images.length && create_if_block_4(ctx);
    	let if_block2 = /*row*/ ctx[18].field_security_advisory_coverage === "covered" && create_if_block_3(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*row*/ ctx[18].taxonomy_vocabulary_44) return create_if_block_2;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block3 = current_block_type(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*row*/ ctx[18].taxonomy_vocabulary_46) return create_if_block_1;
    		return create_else_block_1;
    	}

    	let current_block_type_1 = select_block_type_2(ctx);
    	let if_block4 = current_block_type_1(ctx);
    	let each_value_2 = /*row*/ ctx[18].taxonomy_vocabulary_3 || [];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	function select_block_type_3(ctx, dirty) {
    		if (/*row*/ ctx[18].project_usage) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type_2 = select_block_type_3(ctx);
    	let if_block5 = current_block_type_2(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div10 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div3 = element("div");
    			h3 = element("h3");
    			a = element("a");
    			t2 = text(t2_value);
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			div2 = element("div");
    			t5 = space();
    			div9 = element("div");
    			div5 = element("div");
    			if_block3.c();
    			t6 = space();
    			div6 = element("div");
    			if_block4.c();
    			t7 = space();
    			div7 = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t8 = space();
    			div8 = element("div");
    			if_block5.c();
    			t9 = space();
    			attr_dev(div0, "class", "action svelte-8ye9yr");
    			add_location(div0, file$1, 159, 16, 4587);
    			attr_dev(div1, "class", "left svelte-8ye9yr");
    			add_location(div1, file$1, 168, 16, 5098);
    			attr_dev(a, "href", a_href_value = /*row*/ ctx[18].url);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$1, 181, 24, 5753);
    			add_location(h3, file$1, 180, 20, 5724);
    			add_location(div2, file$1, 186, 20, 6078);
    			attr_dev(div3, "class", "right svelte-8ye9yr");
    			add_location(div3, file$1, 179, 16, 5684);
    			attr_dev(div4, "class", "main svelte-8ye9yr");
    			add_location(div4, file$1, 158, 12, 4552);
    			attr_dev(div5, "data-label", "Maintenance status");
    			add_location(div5, file$1, 190, 16, 6239);
    			attr_dev(div6, "data-label", "Development status");
    			add_location(div6, file$1, 197, 16, 6517);
    			add_location(ul, file$1, 205, 20, 6845);
    			attr_dev(div7, "data-label", "Categories");
    			add_location(div7, file$1, 204, 16, 6795);
    			attr_dev(div8, "data-label", "Usage");
    			add_location(div8, file$1, 211, 16, 7092);
    			attr_dev(div9, "class", "metadata svelte-8ye9yr");
    			add_location(div9, file$1, 189, 12, 6200);
    			attr_dev(div10, "class", "project svelte-8ye9yr");
    			add_location(div10, file$1, 157, 8, 4518);
    			this.first = div10;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div10, anchor);
    			append_dev(div10, div4);
    			append_dev(div4, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			append_dev(div4, t0);
    			append_dev(div4, div1);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, h3);
    			append_dev(h3, a);
    			append_dev(a, t2);
    			append_dev(h3, t3);
    			if (if_block2) if_block2.m(h3, null);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			div2.innerHTML = raw_value;
    			append_dev(div10, t5);
    			append_dev(div10, div9);
    			append_dev(div9, div5);
    			if_block3.m(div5, null);
    			append_dev(div9, t6);
    			append_dev(div9, div6);
    			if_block4.m(div6, null);
    			append_dev(div9, t7);
    			append_dev(div9, div7);
    			append_dev(div7, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(div9, t8);
    			append_dev(div9, div8);
    			if_block5.m(div8, null);
    			append_dev(div10, t9);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
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
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div0, null);
    			}

    			if (typeof /*row*/ ctx[18].field_project_images !== "undefined" && /*row*/ ctx[18].field_project_images.length) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if ((!current || dirty & /*rows2*/ 131072) && t2_value !== (t2_value = /*row*/ ctx[18].title + "")) set_data_dev(t2, t2_value);

    			if (!current || dirty & /*rows2*/ 131072 && a_href_value !== (a_href_value = /*row*/ ctx[18].url)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (/*row*/ ctx[18].field_security_advisory_coverage === "covered") {
    				if (if_block2) ; else {
    					if_block2 = create_if_block_3(ctx);
    					if_block2.c();
    					if_block2.m(h3, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if ((!current || dirty & /*rows2*/ 131072) && raw_value !== (raw_value = String(/*row*/ ctx[18].body.value).substring(0, 200) + "..." + "")) div2.innerHTML = raw_value;
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block3) {
    				if_block3.p(ctx, dirty);
    			} else {
    				if_block3.d(1);
    				if_block3 = current_block_type(ctx);

    				if (if_block3) {
    					if_block3.c();
    					if_block3.m(div5, null);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_2(ctx)) && if_block4) {
    				if_block4.p(ctx, dirty);
    			} else {
    				if_block4.d(1);
    				if_block4 = current_block_type_1(ctx);

    				if (if_block4) {
    					if_block4.c();
    					if_block4.m(div6, null);
    				}
    			}

    			if (dirty & /*rows2*/ 131072) {
    				each_value_2 = /*row*/ ctx[18].taxonomy_vocabulary_3 || [];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (current_block_type_2 === (current_block_type_2 = select_block_type_3(ctx)) && if_block5) {
    				if_block5.p(ctx, dirty);
    			} else {
    				if_block5.d(1);
    				if_block5 = current_block_type_2(ctx);

    				if (if_block5) {
    					if_block5.c();
    					if_block5.m(div8, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div10);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if_block3.d();
    			if_block4.d();
    			destroy_each(each_blocks, detaching);
    			if_block5.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(157:4) {#each rows2 as row, index (row)}",
    		ctx
    	});

    	return block;
    }

    // (152:0) <ProjectGrid {loading} {rows} {pageIndex} {pageSize} let:rows={rows2}>
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
    			if (dirty & /*Object, rows2, String, getFileUrl, projectIsEnabled, projectIsDownloaded*/ 131136) {
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
    		source: "(152:0) <ProjectGrid {loading} {rows} {pageIndex} {pageSize} let:rows={rows2}>",
    		ctx
    	});

    	return block;
    }

    // (153:4) 
    function create_top_slot(ctx) {
    	let div;
    	let search;
    	let t;
    	let pagination;
    	let current;
    	search = new Search({ $$inline: true });
    	search.$on("search", /*onSearch*/ ctx[8]);

    	pagination = new Pagination({
    			props: {
    				page: /*page*/ ctx[1],
    				pageSize: /*pageSize*/ ctx[5],
    				count: /*rowsCount*/ ctx[3],
    				serverSide: true
    			},
    			$$inline: true
    		});

    	pagination.$on("pageChange", /*onPageChange*/ ctx[7]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(search.$$.fragment);
    			t = space();
    			create_component(pagination.$$.fragment);
    			attr_dev(div, "slot", "top");
    			add_location(div, file$1, 152, 4, 4298);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(search, div, null);
    			append_dev(div, t);
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
    			if (detaching) detach_dev(div);
    			destroy_component(search);
    			destroy_component(pagination);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_top_slot.name,
    		type: "slot",
    		source: "(153:4) ",
    		ctx
    	});

    	return block;
    }

    // (226:4) 
    function create_bottom_slot(ctx) {
    	let div;
    	let pagination;
    	let current;

    	pagination = new Pagination({
    			props: {
    				page: /*page*/ ctx[1],
    				pageSize: /*pageSize*/ ctx[5],
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
    			add_location(div, file$1, 225, 4, 7593);
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
    		source: "(226:4) ",
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
    				pageIndex: /*pageIndex*/ ctx[4],
    				pageSize: /*pageSize*/ ctx[5],
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
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(projectgrid, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const projectgrid_changes = {};
    			if (dirty & /*loading*/ 4) projectgrid_changes.loading = /*loading*/ ctx[2];
    			if (dirty & /*rows*/ 1) projectgrid_changes.rows = /*rows*/ ctx[0];

    			if (dirty & /*$$scope, page, rowsCount, rows2*/ 1073872906) {
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

    /**
     * Determine is a project is present in the local Drupal codebase.
     * @param project_name
     * @returns {boolean}
     */
    function projectIsDownloaded(project_name) {
    	return typeof drupalSettings !== "undefined" && project_name in drupalSettings.project_browser.modules;
    }

    /**
     * Determine if a project is enabled/installed in the local Drupal codebase.
     * @param project_name
     * @returns {boolean}
     */
    function projectIsEnabled(project_name) {
    	return typeof drupalSettings !== "undefined" && project_name in drupalSettings.project_browser.modules && drupalSettings.project_browser.modules === 1;
    }

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
    	let sorting = "title";
    	let sortKeys = "title";
    	let sortDirection = "ASC";

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
    		let url = "http://local.project-browser.com/drupal-org-proxy/project?page=" + _page + "&limit=" + pageSize + "&sort=" + sortKeys + "&direction=" + sortDirection;

    		if (text) {
    			url = url + "&title=" + text;
    		}

    		const res = await fetch(url);
    		data = await res.json();
    		$$invalidate(0, rows = data.list);
    		console.log(data);
    		$$invalidate(3, rowsCount = getRowCount(data));
    		$$invalidate(2, loading = false);
    	}

    	async function getFileUrl(fid) {
    		const response = await fetch("https://www.drupal.org/api-d7/file/" + fid + ".json");

    		if (response.ok) {
    			data = await response.json();
    			return data.url;
    		} else {
    			throw new Error("Could not load image");
    		}
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

    	async function onSort(event) {
    		sortKeys = event.detail.key;
    		sortDirection = String(event.detail.dir).toUpperCase();
    		await load(page);
    	}

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<ProjectBrowser> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		ProjectGrid,
    		Pagination,
    		Search,
    		Sort,
    		sortNumber,
    		sortString,
    		DownloadButton,
    		data,
    		rows,
    		page,
    		pageIndex,
    		pageSize,
    		loading,
    		rowsCount,
    		text,
    		sorting,
    		sortKeys,
    		sortDirection,
    		load,
    		getFileUrl,
    		getRowCount,
    		getParameterByName,
    		onCellClick,
    		onPageChange,
    		projectIsDownloaded,
    		projectIsEnabled,
    		onSearch,
    		onSort
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) data = $$props.data;
    		if ("rows" in $$props) $$invalidate(0, rows = $$props.rows);
    		if ("page" in $$props) $$invalidate(1, page = $$props.page);
    		if ("pageIndex" in $$props) $$invalidate(4, pageIndex = $$props.pageIndex);
    		if ("pageSize" in $$props) $$invalidate(5, pageSize = $$props.pageSize);
    		if ("loading" in $$props) $$invalidate(2, loading = $$props.loading);
    		if ("rowsCount" in $$props) $$invalidate(3, rowsCount = $$props.rowsCount);
    		if ("text" in $$props) text = $$props.text;
    		if ("sorting" in $$props) sorting = $$props.sorting;
    		if ("sortKeys" in $$props) sortKeys = $$props.sortKeys;
    		if ("sortDirection" in $$props) sortDirection = $$props.sortDirection;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		rows,
    		page,
    		loading,
    		rowsCount,
    		pageIndex,
    		pageSize,
    		getFileUrl,
    		onPageChange,
    		onSearch
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
    			add_location(div, file, 17, 1, 613);
    			add_location(main, file, 16, 0, 605);
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
    		const res = await fetch(`http://local.project-browser.com/drupal-org-proxy/project`);

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

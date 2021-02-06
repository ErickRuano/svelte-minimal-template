
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    const local = {
        apiURL: "http://localhost:3000"
    };

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
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
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
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
            mount_component(component, options.target, options.anchor);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.1' }, detail)));
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

    /* src/app/components/layouts/Module.svelte generated by Svelte v3.32.1 */

    const file = "src/app/components/layouts/Module.svelte";
    const get_footer_slot_changes = dirty => ({});
    const get_footer_slot_context = ctx => ({});
    const get_main_slot_changes = dirty => ({});
    const get_main_slot_context = ctx => ({});
    const get_header_slot_changes = dirty => ({});
    const get_header_slot_context = ctx => ({});
    const get_aside_slot_changes = dirty => ({});
    const get_aside_slot_context = ctx => ({});
    const get_mobnav_slot_changes = dirty => ({});
    const get_mobnav_slot_context = ctx => ({});
    const get_webnav_slot_changes = dirty => ({});
    const get_webnav_slot_context = ctx => ({});

    function create_fragment(ctx) {
    	let div;
    	let nav0;
    	let t0;
    	let nav1;
    	let t1;
    	let aside;
    	let t2;
    	let header;
    	let t3;
    	let main;
    	let t4;
    	let footer;
    	let current;
    	const webnav_slot_template = /*#slots*/ ctx[1].webnav;
    	const webnav_slot = create_slot(webnav_slot_template, ctx, /*$$scope*/ ctx[0], get_webnav_slot_context);
    	const mobnav_slot_template = /*#slots*/ ctx[1].mobnav;
    	const mobnav_slot = create_slot(mobnav_slot_template, ctx, /*$$scope*/ ctx[0], get_mobnav_slot_context);
    	const aside_slot_template = /*#slots*/ ctx[1].aside;
    	const aside_slot = create_slot(aside_slot_template, ctx, /*$$scope*/ ctx[0], get_aside_slot_context);
    	const header_slot_template = /*#slots*/ ctx[1].header;
    	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[0], get_header_slot_context);
    	const main_slot_template = /*#slots*/ ctx[1].main;
    	const main_slot = create_slot(main_slot_template, ctx, /*$$scope*/ ctx[0], get_main_slot_context);
    	const footer_slot_template = /*#slots*/ ctx[1].footer;
    	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[0], get_footer_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			nav0 = element("nav");
    			if (webnav_slot) webnav_slot.c();
    			t0 = space();
    			nav1 = element("nav");
    			if (mobnav_slot) mobnav_slot.c();
    			t1 = space();
    			aside = element("aside");
    			if (aside_slot) aside_slot.c();
    			t2 = space();
    			header = element("header");
    			if (header_slot) header_slot.c();
    			t3 = space();
    			main = element("main");
    			if (main_slot) main_slot.c();
    			t4 = space();
    			footer = element("footer");
    			if (footer_slot) footer_slot.c();
    			attr_dev(nav0, "id", "webNav");
    			attr_dev(nav0, "class", "svelte-1azxxvs");
    			add_location(nav0, file, 134, 2, 2137);
    			attr_dev(nav1, "id", "mobNav");
    			attr_dev(nav1, "class", "svelte-1azxxvs");
    			add_location(nav1, file, 138, 2, 2198);
    			attr_dev(aside, "class", "svelte-1azxxvs");
    			add_location(aside, file, 142, 2, 2261);
    			attr_dev(header, "class", "svelte-1azxxvs");
    			add_location(header, file, 146, 2, 2313);
    			attr_dev(main, "class", "svelte-1azxxvs");
    			add_location(main, file, 150, 2, 2368);
    			attr_dev(footer, "class", "svelte-1azxxvs");
    			add_location(footer, file, 154, 2, 2417);
    			attr_dev(div, "class", "layout svelte-1azxxvs");
    			add_location(div, file, 133, 0, 2113);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, nav0);

    			if (webnav_slot) {
    				webnav_slot.m(nav0, null);
    			}

    			append_dev(div, t0);
    			append_dev(div, nav1);

    			if (mobnav_slot) {
    				mobnav_slot.m(nav1, null);
    			}

    			append_dev(div, t1);
    			append_dev(div, aside);

    			if (aside_slot) {
    				aside_slot.m(aside, null);
    			}

    			append_dev(div, t2);
    			append_dev(div, header);

    			if (header_slot) {
    				header_slot.m(header, null);
    			}

    			append_dev(div, t3);
    			append_dev(div, main);

    			if (main_slot) {
    				main_slot.m(main, null);
    			}

    			append_dev(div, t4);
    			append_dev(div, footer);

    			if (footer_slot) {
    				footer_slot.m(footer, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (webnav_slot) {
    				if (webnav_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(webnav_slot, webnav_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_webnav_slot_changes, get_webnav_slot_context);
    				}
    			}

    			if (mobnav_slot) {
    				if (mobnav_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(mobnav_slot, mobnav_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_mobnav_slot_changes, get_mobnav_slot_context);
    				}
    			}

    			if (aside_slot) {
    				if (aside_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(aside_slot, aside_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_aside_slot_changes, get_aside_slot_context);
    				}
    			}

    			if (header_slot) {
    				if (header_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(header_slot, header_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_header_slot_changes, get_header_slot_context);
    				}
    			}

    			if (main_slot) {
    				if (main_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(main_slot, main_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_main_slot_changes, get_main_slot_context);
    				}
    			}

    			if (footer_slot) {
    				if (footer_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(footer_slot, footer_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_footer_slot_changes, get_footer_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(webnav_slot, local);
    			transition_in(mobnav_slot, local);
    			transition_in(aside_slot, local);
    			transition_in(header_slot, local);
    			transition_in(main_slot, local);
    			transition_in(footer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(webnav_slot, local);
    			transition_out(mobnav_slot, local);
    			transition_out(aside_slot, local);
    			transition_out(header_slot, local);
    			transition_out(main_slot, local);
    			transition_out(footer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (webnav_slot) webnav_slot.d(detaching);
    			if (mobnav_slot) mobnav_slot.d(detaching);
    			if (aside_slot) aside_slot.d(detaching);
    			if (header_slot) header_slot.d(detaching);
    			if (main_slot) main_slot.d(detaching);
    			if (footer_slot) footer_slot.d(detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Module", slots, ['webnav','mobnav','aside','header','main','footer']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Module> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Module extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Module",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/app/components/layouts/Auth.svelte generated by Svelte v3.32.1 */

    const file$1 = "src/app/components/layouts/Auth.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (default_slot) default_slot.c();
    			attr_dev(main, "style", /*mainStyle*/ ctx[0]);
    			attr_dev(main, "class", "svelte-jf82en");
    			add_location(main, file$1, 27, 0, 497);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);

    			if (default_slot) {
    				default_slot.m(main, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*mainStyle*/ 1) {
    				attr_dev(main, "style", /*mainStyle*/ ctx[0]);
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
    			if (detaching) detach_dev(main);
    			if (default_slot) default_slot.d(detaching);
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

    function instance$1($$self, $$props, $$invalidate) {
    	let mainStyle;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Auth", slots, ['default']);
    	let { background = "url(https://source.unsplash.com/random/1920x1080) no-repeat center center fixed" } = $$props;
    	let { style = "" } = $$props;
    	const writable_props = ["background", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Auth> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("background" in $$props) $$invalidate(1, background = $$props.background);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ background, style, mainStyle });

    	$$self.$inject_state = $$props => {
    		if ("background" in $$props) $$invalidate(1, background = $$props.background);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    		if ("mainStyle" in $$props) $$invalidate(0, mainStyle = $$props.mainStyle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*background, style*/ 6) {
    			 $$invalidate(0, mainStyle = `
      --loginBackground: ${background}
      ${style}
    `);
    		}
    	};

    	return [mainStyle, background, style, $$scope, slots];
    }

    class Auth extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { background: 1, style: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Auth",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get background() {
    		throw new Error("<Auth>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set background(value) {
    		throw new Error("<Auth>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Auth>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Auth>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/app/components/atoms/Button.svelte generated by Svelte v3.32.1 */

    const file$2 = "src/app/components/atoms/Button.svelte";

    function create_fragment$2(ctx) {
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "type", /*type*/ ctx[1]);
    			attr_dev(button, "class", "button svelte-y5u05n");
    			attr_dev(button, "style", /*buttonStyle*/ ctx[2]);
    			toggle_class(button, "outline", /*outline*/ ctx[0]);
    			add_location(button, file$2, 19, 0, 416);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[10], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*type*/ 2) {
    				attr_dev(button, "type", /*type*/ ctx[1]);
    			}

    			if (dirty & /*outline*/ 1) {
    				toggle_class(button, "outline", /*outline*/ ctx[0]);
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
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
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
    	validate_slots("Button", slots, ['default']);
    	let { backgroundColor = "#505050" } = $$props;
    	let { foregroundColor = "#FFF" } = $$props;
    	let { width = "auto" } = $$props;
    	let { height = "4em" } = $$props;
    	let { style = "" } = $$props;
    	let { outline = false } = $$props;
    	let { type = "submit" } = $$props;

    	let buttonStyle = `
		--backgroundColor:${backgroundColor};
		--foregroundColor:${foregroundColor};
		--width:${width};
		--height:${height};
		${style}
	`;

    	const writable_props = [
    		"backgroundColor",
    		"foregroundColor",
    		"width",
    		"height",
    		"style",
    		"outline",
    		"type"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("backgroundColor" in $$props) $$invalidate(3, backgroundColor = $$props.backgroundColor);
    		if ("foregroundColor" in $$props) $$invalidate(4, foregroundColor = $$props.foregroundColor);
    		if ("width" in $$props) $$invalidate(5, width = $$props.width);
    		if ("height" in $$props) $$invalidate(6, height = $$props.height);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    		if ("outline" in $$props) $$invalidate(0, outline = $$props.outline);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		backgroundColor,
    		foregroundColor,
    		width,
    		height,
    		style,
    		outline,
    		type,
    		buttonStyle
    	});

    	$$self.$inject_state = $$props => {
    		if ("backgroundColor" in $$props) $$invalidate(3, backgroundColor = $$props.backgroundColor);
    		if ("foregroundColor" in $$props) $$invalidate(4, foregroundColor = $$props.foregroundColor);
    		if ("width" in $$props) $$invalidate(5, width = $$props.width);
    		if ("height" in $$props) $$invalidate(6, height = $$props.height);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    		if ("outline" in $$props) $$invalidate(0, outline = $$props.outline);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("buttonStyle" in $$props) $$invalidate(2, buttonStyle = $$props.buttonStyle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		outline,
    		type,
    		buttonStyle,
    		backgroundColor,
    		foregroundColor,
    		width,
    		height,
    		style,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			backgroundColor: 3,
    			foregroundColor: 4,
    			width: 5,
    			height: 6,
    			style: 7,
    			outline: 0,
    			type: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get backgroundColor() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get foregroundColor() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set foregroundColor(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outline() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outline(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/app/components/atoms/Input.svelte generated by Svelte v3.32.1 */

    const { console: console_1 } = globals;
    const file$3 = "src/app/components/atoms/Input.svelte";

    // (85:4) {:else}
    function create_else_block(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
    			attr_dev(input, "class", "svelte-1ne1a67");
    			toggle_class(input, "outline", /*outline*/ ctx[4]);
    			add_location(input, file$3, 85, 4, 2302);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler_3*/ ctx[15]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*placeholder*/ 2) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (dirty & /*outline*/ 16) {
    				toggle_class(input, "outline", /*outline*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(85:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (83:34) 
    function create_if_block_3(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
    			attr_dev(input, "class", "svelte-1ne1a67");
    			toggle_class(input, "outline", /*outline*/ ctx[4]);
    			add_location(input, file$3, 83, 4, 2199);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			input.checked = /*value*/ ctx[0];

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[14]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*placeholder*/ 2) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
    			}

    			if (dirty & /*value*/ 1) {
    				input.checked = /*value*/ ctx[0];
    			}

    			if (dirty & /*outline*/ 16) {
    				toggle_class(input, "outline", /*outline*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(83:34) ",
    		ctx
    	});

    	return block;
    }

    // (81:34) 
    function create_if_block_2(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "password");
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
    			attr_dev(input, "class", "svelte-1ne1a67");
    			toggle_class(input, "outline", /*outline*/ ctx[4]);
    			add_location(input, file$3, 81, 4, 2075);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler_2*/ ctx[13]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*placeholder*/ 2) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (dirty & /*outline*/ 16) {
    				toggle_class(input, "outline", /*outline*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(81:34) ",
    		ctx
    	});

    	return block;
    }

    // (79:32) 
    function create_if_block_1(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
    			attr_dev(input, "class", "svelte-1ne1a67");
    			toggle_class(input, "outline", /*outline*/ ctx[4]);
    			add_location(input, file$3, 79, 4, 1953);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler_1*/ ctx[12]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*placeholder*/ 2) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
    			}

    			if (dirty & /*value*/ 1 && to_number(input.value) !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (dirty & /*outline*/ 16) {
    				toggle_class(input, "outline", /*outline*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(79:32) ",
    		ctx
    	});

    	return block;
    }

    // (77:4) {#if type === 'text'}
    function create_if_block(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
    			attr_dev(input, "class", "svelte-1ne1a67");
    			toggle_class(input, "outline", /*outline*/ ctx[4]);
    			add_location(input, file$3, 77, 4, 1835);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[11]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*placeholder*/ 2) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (dirty & /*outline*/ 16) {
    				toggle_class(input, "outline", /*outline*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(77:4) {#if type === 'text'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*type*/ ctx[2] === "text") return create_if_block;
    		if (/*type*/ ctx[2] === "number") return create_if_block_1;
    		if (/*type*/ ctx[2] === "password") return create_if_block_2;
    		if (/*type*/ ctx[2] === "checkbox") return create_if_block_3;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "input-container svelte-1ne1a67");
    			attr_dev(div, "style", /*inputStyle*/ ctx[5]);
    			toggle_class(div, "outline", /*outline*/ ctx[4]);
    			toggle_class(div, "search", /*search*/ ctx[3]);
    			add_location(div, file$3, 75, 0, 1708);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}

    			if (dirty & /*outline*/ 16) {
    				toggle_class(div, "outline", /*outline*/ ctx[4]);
    			}

    			if (dirty & /*search*/ 8) {
    				toggle_class(div, "search", /*search*/ ctx[3]);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Input", slots, []);
    	let { placeholder = "" } = $$props;
    	let { type = "text" } = $$props;
    	let { value } = $$props;
    	let { search } = $$props;
    	console.log(search);
    	let { backgroundColor = "#FFF" } = $$props;
    	let { foregroundColor = "#DDD" } = $$props;
    	let { width = "100%" } = $$props;
    	let { height = "4em" } = $$props;
    	let { style = "" } = $$props;
    	let { outline } = $$props;

    	let inputStyle = `
		--backgroundColor:${backgroundColor};
		--foregroundColor:${foregroundColor};
		--width:${width};
		--height:${height};
		${style}
	`;

    	const writable_props = [
    		"placeholder",
    		"type",
    		"value",
    		"search",
    		"backgroundColor",
    		"foregroundColor",
    		"width",
    		"height",
    		"style",
    		"outline"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	function input_input_handler_1() {
    		value = to_number(this.value);
    		$$invalidate(0, value);
    	}

    	function input_input_handler_2() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	function input_change_handler() {
    		value = this.checked;
    		$$invalidate(0, value);
    	}

    	function input_input_handler_3() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
    		if ("type" in $$props) $$invalidate(2, type = $$props.type);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("search" in $$props) $$invalidate(3, search = $$props.search);
    		if ("backgroundColor" in $$props) $$invalidate(6, backgroundColor = $$props.backgroundColor);
    		if ("foregroundColor" in $$props) $$invalidate(7, foregroundColor = $$props.foregroundColor);
    		if ("width" in $$props) $$invalidate(8, width = $$props.width);
    		if ("height" in $$props) $$invalidate(9, height = $$props.height);
    		if ("style" in $$props) $$invalidate(10, style = $$props.style);
    		if ("outline" in $$props) $$invalidate(4, outline = $$props.outline);
    	};

    	$$self.$capture_state = () => ({
    		placeholder,
    		type,
    		value,
    		search,
    		backgroundColor,
    		foregroundColor,
    		width,
    		height,
    		style,
    		outline,
    		inputStyle
    	});

    	$$self.$inject_state = $$props => {
    		if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
    		if ("type" in $$props) $$invalidate(2, type = $$props.type);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("search" in $$props) $$invalidate(3, search = $$props.search);
    		if ("backgroundColor" in $$props) $$invalidate(6, backgroundColor = $$props.backgroundColor);
    		if ("foregroundColor" in $$props) $$invalidate(7, foregroundColor = $$props.foregroundColor);
    		if ("width" in $$props) $$invalidate(8, width = $$props.width);
    		if ("height" in $$props) $$invalidate(9, height = $$props.height);
    		if ("style" in $$props) $$invalidate(10, style = $$props.style);
    		if ("outline" in $$props) $$invalidate(4, outline = $$props.outline);
    		if ("inputStyle" in $$props) $$invalidate(5, inputStyle = $$props.inputStyle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		placeholder,
    		type,
    		search,
    		outline,
    		inputStyle,
    		backgroundColor,
    		foregroundColor,
    		width,
    		height,
    		style,
    		input_input_handler,
    		input_input_handler_1,
    		input_input_handler_2,
    		input_change_handler,
    		input_input_handler_3
    	];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			placeholder: 1,
    			type: 2,
    			value: 0,
    			search: 3,
    			backgroundColor: 6,
    			foregroundColor: 7,
    			width: 8,
    			height: 9,
    			style: 10,
    			outline: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console_1.warn("<Input> was created without expected prop 'value'");
    		}

    		if (/*search*/ ctx[3] === undefined && !("search" in props)) {
    			console_1.warn("<Input> was created without expected prop 'search'");
    		}

    		if (/*outline*/ ctx[4] === undefined && !("outline" in props)) {
    			console_1.warn("<Input> was created without expected prop 'outline'");
    		}
    	}

    	get placeholder() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get search() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set search(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get foregroundColor() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set foregroundColor(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outline() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outline(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // Material Design Icons v5.9.55
    var mdiMagnify = "M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z";

    /* src/app/components/atoms/Search.svelte generated by Svelte v3.32.1 */
    const file$4 = "src/app/components/atoms/Search.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let input;
    	let t;
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t = space();
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[0]);
    			attr_dev(input, "class", "svelte-f6rnm1");
    			add_location(input, file$4, 50, 4, 1003);
    			attr_dev(path, "fill", "#CACACA");
    			attr_dev(path, "d", mdiMagnify);
    			attr_dev(path, "class", "svelte-f6rnm1");
    			add_location(path, file$4, 52, 8, 1097);
    			set_style(svg, "width", "2em");
    			set_style(svg, "height", "2em");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-f6rnm1");
    			add_location(svg, file$4, 51, 4, 1032);
    			attr_dev(div, "class", "search-container svelte-f6rnm1");
    			add_location(div, file$4, 49, 0, 967);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			append_dev(div, t);
    			append_dev(div, svg);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*placeholder*/ 1) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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
    	validate_slots("Search", slots, []);
    	let { placeholder = "Search something here" } = $$props;
    	const writable_props = ["placeholder"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Search> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("placeholder" in $$props) $$invalidate(0, placeholder = $$props.placeholder);
    	};

    	$$self.$capture_state = () => ({ mdiMagnify, placeholder });

    	$$self.$inject_state = $$props => {
    		if ("placeholder" in $$props) $$invalidate(0, placeholder = $$props.placeholder);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [placeholder];
    }

    class Search extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { placeholder: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Search",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get placeholder() {
    		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    let formatDate = function(date = new Date(), locale = "es-GT", options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }){
        // gets date, locale? and options? parameters and returns formatted date
        let dateObject = new Date(date);
        if(options.hour || options.minute || options.second){
            return dateObject.toLocaleTimeString(locale, options)
        }else {
            return dateObject.toLocaleString(locale, options)
        }
    };

    var helperIndex = {
        formatDate
    };

    /* src/app/components/molecules/Webnav.svelte generated by Svelte v3.32.1 */
    const file$5 = "src/app/components/molecules/Webnav.svelte";

    function create_fragment$5(ctx) {
    	let div1;
    	let b;
    	let t0;
    	let t1;
    	let span;
    	let div0;
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			b = element("b");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			span = element("span");
    			div0 = element("div");
    			img = element("img");
    			attr_dev(b, "class", "svelte-dkzi9j");
    			add_location(b, file$5, 65, 8, 1210);
    			if (img.src !== (img_src_value = /*user*/ ctx[1].picture)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = "" + (/*user*/ ctx[1].displayName + "'s profile picture"));
    			attr_dev(img, "width", "100%");
    			attr_dev(img, "height", "100%");
    			attr_dev(img, "class", "svelte-dkzi9j");
    			add_location(img, file$5, 69, 16, 1321);
    			attr_dev(div0, "class", "avatar-holder svelte-dkzi9j");
    			add_location(div0, file$5, 68, 12, 1276);
    			attr_dev(span, "class", "user-holder svelte-dkzi9j");
    			add_location(span, file$5, 67, 8, 1236);
    			attr_dev(div1, "class", "webnav-container svelte-dkzi9j");
    			attr_dev(div1, "style", /*style*/ ctx[2]);
    			add_location(div1, file$5, 63, 4, 1160);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, b);
    			append_dev(b, t0);
    			append_dev(div1, t1);
    			append_dev(div1, span);
    			append_dev(span, div0);
    			append_dev(div0, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);

    			if (dirty & /*user*/ 2 && img.src !== (img_src_value = /*user*/ ctx[1].picture)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*user*/ 2 && img_alt_value !== (img_alt_value = "" + (/*user*/ ctx[1].displayName + "'s profile picture"))) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*style*/ 4) {
    				attr_dev(div1, "style", /*style*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
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

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Webnav", slots, []);
    	let { title = "APP" } = $$props;

    	let { user = {
    		picture: "https://avatars.dicebear.com/4.5/api/bottts/%7Bmars%7D.svg",
    		displayName: "User"
    	} } = $$props;

    	let { style = "" } = $$props;
    	const writable_props = ["title", "user", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Webnav> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("user" in $$props) $$invalidate(1, user = $$props.user);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    	};

    	$$self.$capture_state = () => ({ formatDate, title, user, style });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("user" in $$props) $$invalidate(1, user = $$props.user);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, user, style];
    }

    class Webnav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { title: 0, user: 1, style: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Webnav",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get title() {
    		throw new Error("<Webnav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Webnav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get user() {
    		throw new Error("<Webnav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set user(value) {
    		throw new Error("<Webnav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Webnav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Webnav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
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
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function regexparam (str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.32.1 */

    const { Error: Error_1, Object: Object_1, console: console_1$1 } = globals;

    // (209:0) {:else}
    function create_else_block$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
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
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
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
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
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
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(209:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (202:0) {#if componentParams}
    function create_if_block$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
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
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
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
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
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
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(202:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap$1(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn("Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading");

    	return wrap({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location$1 = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == "#" ? "" : "#") + location;

    	try {
    		window.history.replaceState(undefined, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn("Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment.");
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event("hashchange"));
    }

    function link(node, hrefVar) {
    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	updateLink(node, hrefVar || node.getAttribute("href"));

    	return {
    		update(updated) {
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, href) {
    	// Destination must start with '/'
    	if (!href || href.length < 1 || href.charAt(0) != "/") {
    		throw Error("Invalid value for \"href\" attribute: " + href);
    	}

    	// Add # to the href attribute
    	node.setAttribute("href", "#" + href);

    	node.addEventListener("click", scrollstateHistoryHandler);
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {HTMLElementEventMap} event - an onclick event attached to an anchor tag
     */
    function scrollstateHistoryHandler(event) {
    	// Prevent default anchor onclick behaviour
    	event.preventDefault();

    	const href = event.currentTarget.getAttribute("href");

    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument - strings must start with / or *");
    			}

    			const { pattern, keys } = regexparam(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == "object" && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == "string") {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || "/";
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || "/";
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || "") || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {bool} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	if (restoreScrollState) {
    		window.addEventListener("popstate", event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		});

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.scrollX, previousScrollState.scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick("conditionsFailed", detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoading", Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == "object" && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    	});

    	const writable_props = ["routes", "prefix", "restoreScrollState"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble($$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		derived,
    		tick,
    		_wrap: wrap,
    		wrap: wrap$1,
    		getLocation,
    		loc,
    		location: location$1,
    		querystring,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		scrollstateHistoryHandler,
    		createEventDispatcher,
    		afterUpdate,
    		regexparam,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		lastLoc,
    		componentObj
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ("component" in $$props) $$invalidate(0, component = $$props.component);
    		if ("componentParams" in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ("props" in $$props) $$invalidate(2, props = $$props.props);
    		if ("previousScrollState" in $$props) previousScrollState = $$props.previousScrollState;
    		if ("lastLoc" in $$props) lastLoc = $$props.lastLoc;
    		if ("componentObj" in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			 history.scrollRestoration = restoreScrollState ? "manual" : "auto";
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/app/components/molecules/Aside.svelte generated by Svelte v3.32.1 */
    const file$6 = "src/app/components/molecules/Aside.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (93:12) {#each links as link, i}
    function create_each_block(ctx) {
    	let li;
    	let p;
    	let t0_value = /*link*/ ctx[4].display + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*link*/ ctx[4]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(p, "class", "svelte-6x7g3a");
    			add_location(p, file$6, 94, 16, 2072);
    			attr_dev(li, "class", "svelte-6x7g3a");
    			toggle_class(li, "selected", /*$location*/ ctx[2] === /*link*/ ctx[4].url);
    			add_location(li, file$6, 93, 12, 1970);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, p);
    			append_dev(p, t0);
    			append_dev(li, t1);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*links*/ 1 && t0_value !== (t0_value = /*link*/ ctx[4].display + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$location, links*/ 5) {
    				toggle_class(li, "selected", /*$location*/ ctx[2] === /*link*/ ctx[4].url);
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(93:12) {#each links as link, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let section;
    	let img;
    	let img_src_value;
    	let t;
    	let ul;
    	let each_value = /*links*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			section = element("section");
    			img = element("img");
    			t = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(img, "width", "75%");
    			attr_dev(img, "margin", "auto");
    			attr_dev(img, "height", "auto");
    			if (img.src !== (img_src_value = "https://avatars.dicebear.com/4.5/api/bottts/%7Bmars%7D.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Logo");
    			add_location(img, file$6, 88, 12, 1761);
    			attr_dev(section, "class", "avatar-holder svelte-6x7g3a");
    			add_location(section, file$6, 87, 8, 1716);
    			attr_dev(ul, "class", "svelte-6x7g3a");
    			add_location(ul, file$6, 91, 8, 1914);
    			attr_dev(div, "class", "aside-container svelte-6x7g3a");
    			attr_dev(div, "style", /*style*/ ctx[1]);
    			add_location(div, file$6, 85, 4, 1667);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, section);
    			append_dev(section, img);
    			append_dev(div, t);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$location, links, push*/ 5) {
    				each_value = /*links*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*style*/ 2) {
    				attr_dev(div, "style", /*style*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
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
    	let $location;
    	validate_store(location$1, "location");
    	component_subscribe($$self, location$1, $$value => $$invalidate(2, $location = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Aside", slots, []);
    	let { links = [{ url: "/user", display: "User" }, { url: "/app", display: "App" }] } = $$props;
    	let { style = "" } = $$props;
    	const writable_props = ["links", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Aside> was created with unknown prop '${key}'`);
    	});

    	const click_handler = link => {
    		push(`#${link.url}`);
    	};

    	$$self.$$set = $$props => {
    		if ("links" in $$props) $$invalidate(0, links = $$props.links);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    	};

    	$$self.$capture_state = () => ({
    		formatDate,
    		location: location$1,
    		push,
    		links,
    		style,
    		$location
    	});

    	$$self.$inject_state = $$props => {
    		if ("links" in $$props) $$invalidate(0, links = $$props.links);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [links, style, $location, click_handler];
    }

    class Aside extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { links: 0, style: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Aside",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get links() {
    		throw new Error("<Aside>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set links(value) {
    		throw new Error("<Aside>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Aside>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Aside>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

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

    /* src/app/components/molecules/Modal.svelte generated by Svelte v3.32.1 */
    const file$7 = "src/app/components/molecules/Modal.svelte";

    // (41:0) {#if visible}
    function create_if_block$2(ctx) {
    	let div_1;
    	let current_block_type_index;
    	let if_block;
    	let div_1_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_1$1, create_if_block_2$1, create_if_block_3$1, create_if_block_4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*aside*/ ctx[1]) return 0;
    		if (/*section*/ ctx[2]) return 1;
    		if (/*main*/ ctx[3]) return 2;
    		if (/*div*/ ctx[4]) return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div_1 = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div_1, "class", "modal-container svelte-15bieiq");
    			attr_dev(div_1, "style", /*modalContainerStyle*/ ctx[9]);
    			add_location(div_1, file$7, 41, 0, 933);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div_1, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div_1, null);
    			}

    			/*div_1_binding*/ ctx[15](div_1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div_1, "click", /*click_handler_4*/ ctx[16], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(div_1, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);

    			add_render_callback(() => {
    				if (!div_1_transition) div_1_transition = create_bidirectional_transition(
    					div_1,
    					fade,
    					{
    						duration: /*transition*/ ctx[6].duration || /*defaultTransition*/ ctx[8].duration
    					},
    					true
    				);

    				div_1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);

    			if (!div_1_transition) div_1_transition = create_bidirectional_transition(
    				div_1,
    				fade,
    				{
    					duration: /*transition*/ ctx[6].duration || /*defaultTransition*/ ctx[8].duration
    				},
    				false
    			);

    			div_1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div_1);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			/*div_1_binding*/ ctx[15](null);
    			if (detaching && div_1_transition) div_1_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(41:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (55:14) 
    function create_if_block_4(ctx) {
    	let div_1;
    	let div_1_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], null);

    	const block = {
    		c: function create() {
    			div_1 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div_1, "class", "modal-content svelte-15bieiq");
    			attr_dev(div_1, "style", /*style*/ ctx[5]);
    			add_location(div_1, file$7, 55, 1, 1695);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div_1, anchor);

    			if (default_slot) {
    				default_slot.m(div_1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div_1, "click", stop_propagation(click_handler_3), false, false, true);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[13], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*style*/ 32) {
    				attr_dev(div_1, "style", /*style*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div_1_transition) div_1_transition = create_bidirectional_transition(
    					div_1,
    					fly,
    					{
    						.../*defaultTransition*/ ctx[8],
    						.../*transition*/ ctx[6]
    					},
    					true
    				);

    				div_1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);

    			if (!div_1_transition) div_1_transition = create_bidirectional_transition(
    				div_1,
    				fly,
    				{
    					.../*defaultTransition*/ ctx[8],
    					.../*transition*/ ctx[6]
    				},
    				false
    			);

    			div_1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div_1);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_1_transition) div_1_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(55:14) ",
    		ctx
    	});

    	return block;
    }

    // (51:15) 
    function create_if_block_3$1(ctx) {
    	let main_1;
    	let main_1_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], null);

    	const block = {
    		c: function create() {
    			main_1 = element("main");
    			if (default_slot) default_slot.c();
    			attr_dev(main_1, "class", "modal-content svelte-15bieiq");
    			attr_dev(main_1, "style", /*style*/ ctx[5]);
    			add_location(main_1, file$7, 51, 1, 1519);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main_1, anchor);

    			if (default_slot) {
    				default_slot.m(main_1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(main_1, "click", stop_propagation(click_handler_2), false, false, true);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[13], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*style*/ 32) {
    				attr_dev(main_1, "style", /*style*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!main_1_transition) main_1_transition = create_bidirectional_transition(
    					main_1,
    					fly,
    					{
    						.../*defaultTransition*/ ctx[8],
    						.../*transition*/ ctx[6]
    					},
    					true
    				);

    				main_1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);

    			if (!main_1_transition) main_1_transition = create_bidirectional_transition(
    				main_1,
    				fly,
    				{
    					.../*defaultTransition*/ ctx[8],
    					.../*transition*/ ctx[6]
    				},
    				false
    			);

    			main_1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main_1);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && main_1_transition) main_1_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(51:15) ",
    		ctx
    	});

    	return block;
    }

    // (47:18) 
    function create_if_block_2$1(ctx) {
    	let section_1;
    	let section_1_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], null);

    	const block = {
    		c: function create() {
    			section_1 = element("section");
    			if (default_slot) default_slot.c();
    			attr_dev(section_1, "class", "modal-content svelte-15bieiq");
    			attr_dev(section_1, "style", /*style*/ ctx[5]);
    			add_location(section_1, file$7, 47, 1, 1336);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section_1, anchor);

    			if (default_slot) {
    				default_slot.m(section_1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(section_1, "click", stop_propagation(click_handler_1), false, false, true);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[13], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*style*/ 32) {
    				attr_dev(section_1, "style", /*style*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!section_1_transition) section_1_transition = create_bidirectional_transition(
    					section_1,
    					fly,
    					{
    						.../*defaultTransition*/ ctx[8],
    						.../*transition*/ ctx[6]
    					},
    					true
    				);

    				section_1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);

    			if (!section_1_transition) section_1_transition = create_bidirectional_transition(
    				section_1,
    				fly,
    				{
    					.../*defaultTransition*/ ctx[8],
    					.../*transition*/ ctx[6]
    				},
    				false
    			);

    			section_1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section_1);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && section_1_transition) section_1_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(47:18) ",
    		ctx
    	});

    	return block;
    }

    // (43:0) {#if aside}
    function create_if_block_1$1(ctx) {
    	let aside_1;
    	let aside_1_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], null);

    	const block = {
    		c: function create() {
    			aside_1 = element("aside");
    			if (default_slot) default_slot.c();
    			attr_dev(aside_1, "class", "modal-content svelte-15bieiq");
    			attr_dev(aside_1, "style", /*style*/ ctx[5]);
    			add_location(aside_1, file$7, 43, 1, 1153);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, aside_1, anchor);

    			if (default_slot) {
    				default_slot.m(aside_1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(aside_1, "click", stop_propagation(click_handler), false, false, true);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[13], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*style*/ 32) {
    				attr_dev(aside_1, "style", /*style*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!aside_1_transition) aside_1_transition = create_bidirectional_transition(
    					aside_1,
    					fly,
    					{
    						.../*defaultTransition*/ ctx[8],
    						.../*transition*/ ctx[6]
    					},
    					true
    				);

    				aside_1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);

    			if (!aside_1_transition) aside_1_transition = create_bidirectional_transition(
    				aside_1,
    				fly,
    				{
    					.../*defaultTransition*/ ctx[8],
    					.../*transition*/ ctx[6]
    				},
    				false
    			);

    			aside_1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(aside_1);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && aside_1_transition) aside_1_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(43:0) {#if aside}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*visible*/ ctx[0] && create_if_block$2(ctx);

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
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*visible*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*visible*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
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
    			if (if_block) if_block.d(detaching);
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

    const click_handler = () => {
    	
    };

    const click_handler_1 = () => {
    	
    };

    const click_handler_2 = () => {
    	
    };

    const click_handler_3 = () => {
    	
    };

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Modal", slots, ['default']);
    	let { aside = false } = $$props;
    	let { section = false } = $$props;
    	let { main = false } = $$props;
    	let { div = true } = $$props;
    	let { backgroundColor = "rgba(0,0,0,0.4)" } = $$props;
    	let { foregroundColor = "#FFF" } = $$props;
    	let { index = 0 } = $$props;
    	let { style = "" } = $$props;
    	let { visible = false } = $$props;
    	const defaultTransition = { duration: 250 };
    	let { transition = {} } = $$props;
    	let modalContainer;

    	const modalContainerStyle = `
		--index:${index};
		--modalBackgroundColor:${backgroundColor};
		--modalForegroundColor:${foregroundColor};
		`;

    	const keyUpHandler = event => {
    		if (event.key === "Escape" || event.keyCode === 27) {
    			$$invalidate(0, visible = false);
    		}
    	};

    	onMount(() => {
    		document.addEventListener("keyup", keyUpHandler);
    	});

    	onDestroy(() => {
    	});

    	const writable_props = [
    		"aside",
    		"section",
    		"main",
    		"div",
    		"backgroundColor",
    		"foregroundColor",
    		"index",
    		"style",
    		"visible",
    		"transition"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	function div_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			modalContainer = $$value;
    			$$invalidate(7, modalContainer);
    		});
    	}

    	const click_handler_4 = () => {
    		$$invalidate(0, visible = false);
    	};

    	$$self.$$set = $$props => {
    		if ("aside" in $$props) $$invalidate(1, aside = $$props.aside);
    		if ("section" in $$props) $$invalidate(2, section = $$props.section);
    		if ("main" in $$props) $$invalidate(3, main = $$props.main);
    		if ("div" in $$props) $$invalidate(4, div = $$props.div);
    		if ("backgroundColor" in $$props) $$invalidate(10, backgroundColor = $$props.backgroundColor);
    		if ("foregroundColor" in $$props) $$invalidate(11, foregroundColor = $$props.foregroundColor);
    		if ("index" in $$props) $$invalidate(12, index = $$props.index);
    		if ("style" in $$props) $$invalidate(5, style = $$props.style);
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("transition" in $$props) $$invalidate(6, transition = $$props.transition);
    		if ("$$scope" in $$props) $$invalidate(13, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		fade,
    		fly,
    		aside,
    		section,
    		main,
    		div,
    		backgroundColor,
    		foregroundColor,
    		index,
    		style,
    		visible,
    		defaultTransition,
    		transition,
    		modalContainer,
    		modalContainerStyle,
    		keyUpHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ("aside" in $$props) $$invalidate(1, aside = $$props.aside);
    		if ("section" in $$props) $$invalidate(2, section = $$props.section);
    		if ("main" in $$props) $$invalidate(3, main = $$props.main);
    		if ("div" in $$props) $$invalidate(4, div = $$props.div);
    		if ("backgroundColor" in $$props) $$invalidate(10, backgroundColor = $$props.backgroundColor);
    		if ("foregroundColor" in $$props) $$invalidate(11, foregroundColor = $$props.foregroundColor);
    		if ("index" in $$props) $$invalidate(12, index = $$props.index);
    		if ("style" in $$props) $$invalidate(5, style = $$props.style);
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("transition" in $$props) $$invalidate(6, transition = $$props.transition);
    		if ("modalContainer" in $$props) $$invalidate(7, modalContainer = $$props.modalContainer);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		visible,
    		aside,
    		section,
    		main,
    		div,
    		style,
    		transition,
    		modalContainer,
    		defaultTransition,
    		modalContainerStyle,
    		backgroundColor,
    		foregroundColor,
    		index,
    		$$scope,
    		slots,
    		div_1_binding,
    		click_handler_4
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			aside: 1,
    			section: 2,
    			main: 3,
    			div: 4,
    			backgroundColor: 10,
    			foregroundColor: 11,
    			index: 12,
    			style: 5,
    			visible: 0,
    			transition: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get aside() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set aside(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get section() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set section(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get main() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set main(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get div() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set div(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get foregroundColor() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set foregroundColor(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get visible() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transition() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transition(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var alphabet;
    var alphabetIndexMap;
    var alphabetIndexMapLength = 0;

    function isNumberCode(code) {
      return code >= 48 && code <= 57;
    }

    function naturalCompare(a, b) {
      var lengthA = (a += '').length;
      var lengthB = (b += '').length;
      var aIndex = 0;
      var bIndex = 0;

      while (aIndex < lengthA && bIndex < lengthB) {
        var charCodeA = a.charCodeAt(aIndex);
        var charCodeB = b.charCodeAt(bIndex);

        if (isNumberCode(charCodeA)) {
          if (!isNumberCode(charCodeB)) {
            return charCodeA - charCodeB;
          }

          var numStartA = aIndex;
          var numStartB = bIndex;

          while (charCodeA === 48 && ++numStartA < lengthA) {
            charCodeA = a.charCodeAt(numStartA);
          }
          while (charCodeB === 48 && ++numStartB < lengthB) {
            charCodeB = b.charCodeAt(numStartB);
          }

          var numEndA = numStartA;
          var numEndB = numStartB;

          while (numEndA < lengthA && isNumberCode(a.charCodeAt(numEndA))) {
            ++numEndA;
          }
          while (numEndB < lengthB && isNumberCode(b.charCodeAt(numEndB))) {
            ++numEndB;
          }

          var difference = numEndA - numStartA - numEndB + numStartB; // numA length - numB length
          if (difference) {
            return difference;
          }

          while (numStartA < numEndA) {
            difference = a.charCodeAt(numStartA++) - b.charCodeAt(numStartB++);
            if (difference) {
              return difference;
            }
          }

          aIndex = numEndA;
          bIndex = numEndB;
          continue;
        }

        if (charCodeA !== charCodeB) {
          if (
            charCodeA < alphabetIndexMapLength &&
            charCodeB < alphabetIndexMapLength &&
            alphabetIndexMap[charCodeA] !== -1 &&
            alphabetIndexMap[charCodeB] !== -1
          ) {
            return alphabetIndexMap[charCodeA] - alphabetIndexMap[charCodeB];
          }

          return charCodeA - charCodeB;
        }

        ++aIndex;
        ++bIndex;
      }

      if (aIndex >= lengthA && bIndex < lengthB && lengthA >= lengthB) {
        return -1;
      }

      if (bIndex >= lengthB && aIndex < lengthA && lengthB >= lengthA) {
        return 1;
      }

      return lengthA - lengthB;
    }

    naturalCompare.caseInsensitive = naturalCompare.i = function(a, b) {
      return naturalCompare(('' + a).toLowerCase(), ('' + b).toLowerCase());
    };

    Object.defineProperties(naturalCompare, {
      alphabet: {
        get: function() {
          return alphabet;
        },

        set: function(value) {
          alphabet = value;
          alphabetIndexMap = [];

          var i = 0;

          if (alphabet) {
            for (; i < alphabet.length; i++) {
              alphabetIndexMap[alphabet.charCodeAt(i)] = i;
            }
          }

          alphabetIndexMapLength = alphabetIndexMap.length;

          for (i = 0; i < alphabetIndexMapLength; i++) {
            if (alphabetIndexMap[i] === undefined) {
              alphabetIndexMap[i] = -1;
            }
          }
        },
      },
    });

    var naturalCompare_1 = naturalCompare;

    /**
     * A cross-browser implementation of getElementsByClass.
     * Heavily based on Dustin Diaz's function: http://dustindiaz.com/getelementsbyclass.
     *
     * Find all elements with class `className` inside `container`.
     * Use `single = true` to increase performance in older browsers
     * when only one element is needed.
     *
     * @param {String} className
     * @param {Element} container
     * @param {Boolean} single
     * @api public
     */
    var getElementsByClassName = function (container, className, single) {
      if (single) {
        return container.getElementsByClassName(className)[0]
      } else {
        return container.getElementsByClassName(className)
      }
    };

    var querySelector = function (container, className, single) {
      className = '.' + className;
      if (single) {
        return container.querySelector(className)
      } else {
        return container.querySelectorAll(className)
      }
    };

    var polyfill = function (container, className, single) {
      var classElements = [],
        tag = '*';

      var els = container.getElementsByTagName(tag);
      var elsLen = els.length;
      var pattern = new RegExp('(^|\\s)' + className + '(\\s|$)');
      for (var i = 0, j = 0; i < elsLen; i++) {
        if (pattern.test(els[i].className)) {
          if (single) {
            return els[i]
          } else {
            classElements[j] = els[i];
            j++;
          }
        }
      }
      return classElements
    };

    var getByClass = (function () {
      return function (container, className, single, options) {
        options = options || {};
        if ((options.test && options.getElementsByClassName) || (!options.test && document.getElementsByClassName)) {
          return getElementsByClassName(container, className, single)
        } else if ((options.test && options.querySelector) || (!options.test && document.querySelector)) {
          return querySelector(container, className, single)
        } else {
          return polyfill(container, className, single)
        }
      }
    })();

    /*
     * Source: https://github.com/segmentio/extend
     */
    var extend = function extend(object) {
      // Takes an unlimited number of extenders.
      var args = Array.prototype.slice.call(arguments, 1);

      // For each extender, copy their properties on our object.
      for (var i = 0, source; (source = args[i]); i++) {
        if (!source) continue
        for (var property in source) {
          object[property] = source[property];
        }
      }

      return object
    };

    var indexOf = [].indexOf;

    var indexOf_1 = function(arr, obj){
      if (indexOf) return arr.indexOf(obj);
      for (var i = 0, il = arr.length; i < il; ++i) {
        if (arr[i] === obj) return i;
      }
      return -1
    };

    /**
     * Source: https://github.com/timoxley/to-array
     *
     * Convert an array-like object into an `Array`.
     * If `collection` is already an `Array`, then will return a clone of `collection`.
     *
     * @param {Array | Mixed} collection An `Array` or array-like object to convert e.g. `arguments` or `NodeList`
     * @return {Array} Naive conversion of `collection` to a new `Array`.
     * @api public
     */
    var toArray = function toArray(collection) {
      if (typeof collection === 'undefined') return []
      if (collection === null) return [null]
      if (collection === window) return [window]
      if (typeof collection === 'string') return [collection]
      if (isArray(collection)) return collection
      if (typeof collection.length != 'number') return [collection]
      if (typeof collection === 'function' && collection instanceof Function) return [collection]

      var arr = [];
      for (var i = 0, il = collection.length; i < il; i++) {
        if (Object.prototype.hasOwnProperty.call(collection, i) || i in collection) {
          arr.push(collection[i]);
        }
      }
      if (!arr.length) return []
      return arr
    };

    function isArray(arr) {
      return Object.prototype.toString.call(arr) === '[object Array]'
    }

    var bind$1 = window.addEventListener ? 'addEventListener' : 'attachEvent',
      unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
      prefix = bind$1 !== 'addEventListener' ? 'on' : '';

    /**
     * Bind `el` event `type` to `fn`.
     *
     * @param {Element} el, NodeList, HTMLCollection or Array
     * @param {String} type
     * @param {Function} fn
     * @param {Boolean} capture
     * @api public
     */

    var bind_1 = function (el, type, fn, capture) {
      el = toArray(el);
      for (var i = 0, il = el.length; i < il; i++) {
        el[i][bind$1](prefix + type, fn, capture || false);
      }
    };

    /**
     * Unbind `el` event `type`'s callback `fn`.
     *
     * @param {Element} el, NodeList, HTMLCollection or Array
     * @param {String} type
     * @param {Function} fn
     * @param {Boolean} capture
     * @api public
     */

    var unbind_1 = function (el, type, fn, capture) {
      el = toArray(el);
      for (var i = 0, il = el.length; i < il; i++) {
        el[i][unbind](prefix + type, fn, capture || false);
      }
    };

    /**
     * Returns a function, that, as long as it continues to be invoked, will not
     * be triggered. The function will be called after it stops being called for
     * `wait` milliseconds. If `immediate` is true, trigger the function on the
     * leading edge, instead of the trailing.
     *
     * @param {Function} fn
     * @param {Integer} wait
     * @param {Boolean} immediate
     * @api public
     */

    var debounce = function (fn, wait, immediate) {
      var timeout;
      return wait
        ? function () {
            var context = this,
              args = arguments;
            var later = function () {
              timeout = null;
              if (!immediate) fn.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) fn.apply(context, args);
          }
        : fn
    };

    var events = {
    	bind: bind_1,
    	unbind: unbind_1,
    	debounce: debounce
    };

    var toString = function (s) {
      s = s === undefined ? '' : s;
      s = s === null ? '' : s;
      s = s.toString();
      return s
    };

    /**
     * Module dependencies.
     */

    /**
     * Whitespace regexp.
     */

    var re = /\s+/;

    /**
     * Wrap `el` in a `ClassList`.
     *
     * @param {Element} el
     * @return {ClassList}
     * @api public
     */

    var classes = function (el) {
      return new ClassList(el)
    };

    /**
     * Initialize a new ClassList for `el`.
     *
     * @param {Element} el
     * @api private
     */

    function ClassList(el) {
      if (!el || !el.nodeType) {
        throw new Error('A DOM element reference is required')
      }
      this.el = el;
      this.list = el.classList;
    }

    /**
     * Add class `name` if not already present.
     *
     * @param {String} name
     * @return {ClassList}
     * @api public
     */

    ClassList.prototype.add = function (name) {
      // classList
      if (this.list) {
        this.list.add(name);
        return this
      }

      // fallback
      var arr = this.array();
      var i = indexOf_1(arr, name);
      if (!~i) arr.push(name);
      this.el.className = arr.join(' ');
      return this
    };

    /**
     * Remove class `name` when present, or
     * pass a regular expression to remove
     * any which match.
     *
     * @param {String|RegExp} name
     * @return {ClassList}
     * @api public
     */

    ClassList.prototype.remove = function (name) {
      // classList
      if (this.list) {
        this.list.remove(name);
        return this
      }

      // fallback
      var arr = this.array();
      var i = indexOf_1(arr, name);
      if (~i) arr.splice(i, 1);
      this.el.className = arr.join(' ');
      return this
    };

    /**
     * Toggle class `name`, can force state via `force`.
     *
     * For browsers that support classList, but do not support `force` yet,
     * the mistake will be detected and corrected.
     *
     * @param {String} name
     * @param {Boolean} force
     * @return {ClassList}
     * @api public
     */

    ClassList.prototype.toggle = function (name, force) {
      // classList
      if (this.list) {
        if ('undefined' !== typeof force) {
          if (force !== this.list.toggle(name, force)) {
            this.list.toggle(name); // toggle again to correct
          }
        } else {
          this.list.toggle(name);
        }
        return this
      }

      // fallback
      if ('undefined' !== typeof force) {
        if (!force) {
          this.remove(name);
        } else {
          this.add(name);
        }
      } else {
        if (this.has(name)) {
          this.remove(name);
        } else {
          this.add(name);
        }
      }

      return this
    };

    /**
     * Return an array of classes.
     *
     * @return {Array}
     * @api public
     */

    ClassList.prototype.array = function () {
      var className = this.el.getAttribute('class') || '';
      var str = className.replace(/^\s+|\s+$/g, '');
      var arr = str.split(re);
      if ('' === arr[0]) arr.shift();
      return arr
    };

    /**
     * Check if class `name` is present.
     *
     * @param {String} name
     * @return {ClassList}
     * @api public
     */

    ClassList.prototype.has = ClassList.prototype.contains = function (name) {
      return this.list ? this.list.contains(name) : !!~indexOf_1(this.array(), name)
    };

    /**
     * A cross-browser implementation of getAttribute.
     * Source found here: http://stackoverflow.com/a/3755343/361337 written by Vivin Paliath
     *
     * Return the value for `attr` at `element`.
     *
     * @param {Element} el
     * @param {String} attr
     * @api public
     */
    var getAttribute = function (el, attr) {
      var result = (el.getAttribute && el.getAttribute(attr)) || null;
      if (!result) {
        var attrs = el.attributes;
        var length = attrs.length;
        for (var i = 0; i < length; i++) {
          if (attrs[i] !== undefined) {
            if (attrs[i].nodeName === attr) {
              result = attrs[i].nodeValue;
            }
          }
        }
      }
      return result
    };

    var item = function (list) {
      return function (initValues, element, notCreate) {
        var item = this;

        this._values = {};

        this.found = false; // Show if list.searched == true and this.found == true
        this.filtered = false; // Show if list.filtered == true and this.filtered == true

        var init = function (initValues, element, notCreate) {
          if (element === undefined) {
            if (notCreate) {
              item.values(initValues, notCreate);
            } else {
              item.values(initValues);
            }
          } else {
            item.elm = element;
            var values = list.templater.get(item, initValues);
            item.values(values);
          }
        };

        this.values = function (newValues, notCreate) {
          if (newValues !== undefined) {
            for (var name in newValues) {
              item._values[name] = newValues[name];
            }
            if (notCreate !== true) {
              list.templater.set(item, item.values());
            }
          } else {
            return item._values
          }
        };

        this.show = function () {
          list.templater.show(item);
        };

        this.hide = function () {
          list.templater.hide(item);
        };

        this.matching = function () {
          return (
            (list.filtered && list.searched && item.found && item.filtered) ||
            (list.filtered && !list.searched && item.filtered) ||
            (!list.filtered && list.searched && item.found) ||
            (!list.filtered && !list.searched)
          )
        };

        this.visible = function () {
          return item.elm && item.elm.parentNode == list.list ? true : false
        };

        init(initValues, element, notCreate);
      }
    };

    var addAsync = function (list) {
      var addAsync = function (values, callback, items) {
        var valuesToAdd = values.splice(0, 50);
        items = items || [];
        items = items.concat(list.add(valuesToAdd));
        if (values.length > 0) {
          setTimeout(function () {
            addAsync(values, callback, items);
          }, 1);
        } else {
          list.update();
          callback(items);
        }
      };
      return addAsync
    };

    var pagination = function (list) {
      var isHidden = false;

      var refresh = function (pagingList, options) {
        if (list.page < 1) {
          list.listContainer.style.display = 'none';
          isHidden = true;
          return
        } else if (isHidden) {
          list.listContainer.style.display = 'block';
        }

        var item,
          l = list.matchingItems.length,
          index = list.i,
          page = list.page,
          pages = Math.ceil(l / page),
          currentPage = Math.ceil(index / page),
          innerWindow = options.innerWindow || 2,
          left = options.left || options.outerWindow || 0,
          right = options.right || options.outerWindow || 0;

        right = pages - right;
        pagingList.clear();
        for (var i = 1; i <= pages; i++) {
          var className = currentPage === i ? 'active' : '';

          //console.log(i, left, right, currentPage, (currentPage - innerWindow), (currentPage + innerWindow), className);

          if (is.number(i, left, right, currentPage, innerWindow)) {
            item = pagingList.add({
              page: i,
              dotted: false,
            })[0];
            if (className) {
              classes(item.elm).add(className);
            }
            item.elm.firstChild.setAttribute('data-i', i);
            item.elm.firstChild.setAttribute('data-page', page);
          } else if (is.dotted(pagingList, i, left, right, currentPage, innerWindow, pagingList.size())) {
            item = pagingList.add({
              page: '...',
              dotted: true,
            })[0];
            classes(item.elm).add('disabled');
          }
        }
      };

      var is = {
        number: function (i, left, right, currentPage, innerWindow) {
          return this.left(i, left) || this.right(i, right) || this.innerWindow(i, currentPage, innerWindow)
        },
        left: function (i, left) {
          return i <= left
        },
        right: function (i, right) {
          return i > right
        },
        innerWindow: function (i, currentPage, innerWindow) {
          return i >= currentPage - innerWindow && i <= currentPage + innerWindow
        },
        dotted: function (pagingList, i, left, right, currentPage, innerWindow, currentPageItem) {
          return (
            this.dottedLeft(pagingList, i, left, right, currentPage, innerWindow) ||
            this.dottedRight(pagingList, i, left, right, currentPage, innerWindow, currentPageItem)
          )
        },
        dottedLeft: function (pagingList, i, left, right, currentPage, innerWindow) {
          return i == left + 1 && !this.innerWindow(i, currentPage, innerWindow) && !this.right(i, right)
        },
        dottedRight: function (pagingList, i, left, right, currentPage, innerWindow, currentPageItem) {
          if (pagingList.items[currentPageItem - 1].values().dotted) {
            return false
          } else {
            return i == right && !this.innerWindow(i, currentPage, innerWindow) && !this.right(i, right)
          }
        },
      };

      return function (options) {
        var pagingList = new src(list.listContainer.id, {
          listClass: options.paginationClass || 'pagination',
          item: options.item || "<li><a class='page' href='#'></a></li>",
          valueNames: ['page', 'dotted'],
          searchClass: 'pagination-search-that-is-not-supposed-to-exist',
          sortClass: 'pagination-sort-that-is-not-supposed-to-exist',
        });

        events.bind(pagingList.listContainer, 'click', function (e) {
          var target = e.target || e.srcElement,
            page = list.utils.getAttribute(target, 'data-page'),
            i = list.utils.getAttribute(target, 'data-i');
          if (i) {
            list.show((i - 1) * page + 1, page);
          }
        });

        list.on('updated', function () {
          refresh(pagingList, options);
        });
        refresh(pagingList, options);
      }
    };

    var parse = function (list) {
      var Item = item(list);

      var getChildren = function (parent) {
        var nodes = parent.childNodes,
          items = [];
        for (var i = 0, il = nodes.length; i < il; i++) {
          // Only textnodes have a data attribute
          if (nodes[i].data === undefined) {
            items.push(nodes[i]);
          }
        }
        return items
      };

      var parse = function (itemElements, valueNames) {
        for (var i = 0, il = itemElements.length; i < il; i++) {
          list.items.push(new Item(valueNames, itemElements[i]));
        }
      };
      var parseAsync = function (itemElements, valueNames) {
        var itemsToIndex = itemElements.splice(0, 50); // TODO: If < 100 items, what happens in IE etc?
        parse(itemsToIndex, valueNames);
        if (itemElements.length > 0) {
          setTimeout(function () {
            parseAsync(itemElements, valueNames);
          }, 1);
        } else {
          list.update();
          list.trigger('parseComplete');
        }
      };

      list.handlers.parseComplete = list.handlers.parseComplete || [];

      return function () {
        var itemsToIndex = getChildren(list.list),
          valueNames = list.valueNames;

        if (list.indexAsync) {
          parseAsync(itemsToIndex, valueNames);
        } else {
          parse(itemsToIndex, valueNames);
        }
      }
    };

    var Templater = function (list) {
      var createItem,
        templater = this;

      var init = function () {
        var itemSource;

        if (typeof list.item === 'function') {
          createItem = function (values) {
            var item = list.item(values);
            return getItemSource(item)
          };
          return
        }

        if (typeof list.item === 'string') {
          if (list.item.indexOf('<') === -1) {
            itemSource = document.getElementById(list.item);
          } else {
            itemSource = getItemSource(list.item);
          }
        } else {
          /* If item source does not exists, use the first item in list as
          source for new items */
          itemSource = getFirstListItem();
        }

        if (!itemSource) {
          throw new Error("The list needs to have at least one item on init otherwise you'll have to add a template.")
        }

        itemSource = createCleanTemplateItem(itemSource, list.valueNames);

        createItem = function () {
          return itemSource.cloneNode(true)
        };
      };

      var createCleanTemplateItem = function (templateNode, valueNames) {
        var el = templateNode.cloneNode(true);
        el.removeAttribute('id');

        for (var i = 0, il = valueNames.length; i < il; i++) {
          var elm = undefined,
            valueName = valueNames[i];
          if (valueName.data) {
            for (var j = 0, jl = valueName.data.length; j < jl; j++) {
              el.setAttribute('data-' + valueName.data[j], '');
            }
          } else if (valueName.attr && valueName.name) {
            elm = list.utils.getByClass(el, valueName.name, true);
            if (elm) {
              elm.setAttribute(valueName.attr, '');
            }
          } else {
            elm = list.utils.getByClass(el, valueName, true);
            if (elm) {
              elm.innerHTML = '';
            }
          }
        }
        return el
      };

      var getFirstListItem = function () {
        var nodes = list.list.childNodes;

        for (var i = 0, il = nodes.length; i < il; i++) {
          // Only textnodes have a data attribute
          if (nodes[i].data === undefined) {
            return nodes[i].cloneNode(true)
          }
        }
        return undefined
      };

      var getItemSource = function (itemHTML) {
        if (typeof itemHTML !== 'string') return undefined
        if (/<tr[\s>]/g.exec(itemHTML)) {
          var tbody = document.createElement('tbody');
          tbody.innerHTML = itemHTML;
          return tbody.firstElementChild
        } else if (itemHTML.indexOf('<') !== -1) {
          var div = document.createElement('div');
          div.innerHTML = itemHTML;
          return div.firstElementChild
        }
        return undefined
      };

      var getValueName = function (name) {
        for (var i = 0, il = list.valueNames.length; i < il; i++) {
          var valueName = list.valueNames[i];
          if (valueName.data) {
            var data = valueName.data;
            for (var j = 0, jl = data.length; j < jl; j++) {
              if (data[j] === name) {
                return { data: name }
              }
            }
          } else if (valueName.attr && valueName.name && valueName.name == name) {
            return valueName
          } else if (valueName === name) {
            return name
          }
        }
      };

      var setValue = function (item, name, value) {
        var elm = undefined,
          valueName = getValueName(name);
        if (!valueName) return
        if (valueName.data) {
          item.elm.setAttribute('data-' + valueName.data, value);
        } else if (valueName.attr && valueName.name) {
          elm = list.utils.getByClass(item.elm, valueName.name, true);
          if (elm) {
            elm.setAttribute(valueName.attr, value);
          }
        } else {
          elm = list.utils.getByClass(item.elm, valueName, true);
          if (elm) {
            elm.innerHTML = value;
          }
        }
      };

      this.get = function (item, valueNames) {
        templater.create(item);
        var values = {};
        for (var i = 0, il = valueNames.length; i < il; i++) {
          var elm = undefined,
            valueName = valueNames[i];
          if (valueName.data) {
            for (var j = 0, jl = valueName.data.length; j < jl; j++) {
              values[valueName.data[j]] = list.utils.getAttribute(item.elm, 'data-' + valueName.data[j]);
            }
          } else if (valueName.attr && valueName.name) {
            elm = list.utils.getByClass(item.elm, valueName.name, true);
            values[valueName.name] = elm ? list.utils.getAttribute(elm, valueName.attr) : '';
          } else {
            elm = list.utils.getByClass(item.elm, valueName, true);
            values[valueName] = elm ? elm.innerHTML : '';
          }
        }
        return values
      };

      this.set = function (item, values) {
        if (!templater.create(item)) {
          for (var v in values) {
            if (values.hasOwnProperty(v)) {
              setValue(item, v, values[v]);
            }
          }
        }
      };

      this.create = function (item) {
        if (item.elm !== undefined) {
          return false
        }
        item.elm = createItem(item.values());
        templater.set(item, item.values());
        return true
      };
      this.remove = function (item) {
        if (item.elm.parentNode === list.list) {
          list.list.removeChild(item.elm);
        }
      };
      this.show = function (item) {
        templater.create(item);
        list.list.appendChild(item.elm);
      };
      this.hide = function (item) {
        if (item.elm !== undefined && item.elm.parentNode === list.list) {
          list.list.removeChild(item.elm);
        }
      };
      this.clear = function () {
        /* .innerHTML = ''; fucks up IE */
        if (list.list.hasChildNodes()) {
          while (list.list.childNodes.length >= 1) {
            list.list.removeChild(list.list.firstChild);
          }
        }
      };

      init();
    };

    var templater = function (list) {
      return new Templater(list)
    };

    var search = function (list) {
      var columns, searchString, customSearch;

      var prepare = {
        resetList: function () {
          list.i = 1;
          list.templater.clear();
          customSearch = undefined;
        },
        setOptions: function (args) {
          if (args.length == 2 && args[1] instanceof Array) {
            columns = args[1];
          } else if (args.length == 2 && typeof args[1] == 'function') {
            columns = undefined;
            customSearch = args[1];
          } else if (args.length == 3) {
            columns = args[1];
            customSearch = args[2];
          } else {
            columns = undefined;
          }
        },
        setColumns: function () {
          if (list.items.length === 0) return
          if (columns === undefined) {
            columns = list.searchColumns === undefined ? prepare.toArray(list.items[0].values()) : list.searchColumns;
          }
        },
        setSearchString: function (s) {
          s = list.utils.toString(s).toLowerCase();
          s = s.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&'); // Escape regular expression characters
          searchString = s;
        },
        toArray: function (values) {
          var tmpColumn = [];
          for (var name in values) {
            tmpColumn.push(name);
          }
          return tmpColumn
        },
      };
      var search = {
        list: function () {
          // Extract quoted phrases "word1 word2" from original searchString
          // searchString is converted to lowercase by List.js
          var words = [],
            phrase,
            ss = searchString;
          while ((phrase = ss.match(/"([^"]+)"/)) !== null) {
            words.push(phrase[1]);
            ss = ss.substring(0, phrase.index) + ss.substring(phrase.index + phrase[0].length);
          }
          // Get remaining space-separated words (if any)
          ss = ss.trim();
          if (ss.length) words = words.concat(ss.split(/\s+/));
          for (var k = 0, kl = list.items.length; k < kl; k++) {
            var item = list.items[k];
            item.found = false;
            if (!words.length) continue
            for (var i = 0, il = words.length; i < il; i++) {
              var word_found = false;
              for (var j = 0, jl = columns.length; j < jl; j++) {
                var values = item.values(),
                  column = columns[j];
                if (values.hasOwnProperty(column) && values[column] !== undefined && values[column] !== null) {
                  var text = typeof values[column] !== 'string' ? values[column].toString() : values[column];
                  if (text.toLowerCase().indexOf(words[i]) !== -1) {
                    // word found, so no need to check it against any other columns
                    word_found = true;
                    break
                  }
                }
              }
              // this word not found? no need to check any other words, the item cannot match
              if (!word_found) break
            }
            item.found = word_found;
          }
        },
        // Removed search.item() and search.values()
        reset: function () {
          list.reset.search();
          list.searched = false;
        },
      };

      var searchMethod = function (str) {
        list.trigger('searchStart');

        prepare.resetList();
        prepare.setSearchString(str);
        prepare.setOptions(arguments); // str, cols|searchFunction, searchFunction
        prepare.setColumns();

        if (searchString === '') {
          search.reset();
        } else {
          list.searched = true;
          if (customSearch) {
            customSearch(searchString, columns);
          } else {
            search.list();
          }
        }

        list.update();
        list.trigger('searchComplete');
        return list.visibleItems
      };

      list.handlers.searchStart = list.handlers.searchStart || [];
      list.handlers.searchComplete = list.handlers.searchComplete || [];

      list.utils.events.bind(
        list.utils.getByClass(list.listContainer, list.searchClass),
        'keyup',
        list.utils.events.debounce(function (e) {
          var target = e.target || e.srcElement, // IE have srcElement
            alreadyCleared = target.value === '' && !list.searched;
          if (!alreadyCleared) {
            // If oninput already have resetted the list, do nothing
            searchMethod(target.value);
          }
        }, list.searchDelay)
      );

      // Used to detect click on HTML5 clear button
      list.utils.events.bind(list.utils.getByClass(list.listContainer, list.searchClass), 'input', function (e) {
        var target = e.target || e.srcElement;
        if (target.value === '') {
          searchMethod('');
        }
      });

      return searchMethod
    };

    var filter = function (list) {
      // Add handlers
      list.handlers.filterStart = list.handlers.filterStart || [];
      list.handlers.filterComplete = list.handlers.filterComplete || [];

      return function (filterFunction) {
        list.trigger('filterStart');
        list.i = 1; // Reset paging
        list.reset.filter();
        if (filterFunction === undefined) {
          list.filtered = false;
        } else {
          list.filtered = true;
          var is = list.items;
          for (var i = 0, il = is.length; i < il; i++) {
            var item = is[i];
            if (filterFunction(item)) {
              item.filtered = true;
            } else {
              item.filtered = false;
            }
          }
        }
        list.update();
        list.trigger('filterComplete');
        return list.visibleItems
      }
    };

    var sort = function (list) {
      var buttons = {
        els: undefined,
        clear: function () {
          for (var i = 0, il = buttons.els.length; i < il; i++) {
            list.utils.classes(buttons.els[i]).remove('asc');
            list.utils.classes(buttons.els[i]).remove('desc');
          }
        },
        getOrder: function (btn) {
          var predefinedOrder = list.utils.getAttribute(btn, 'data-order');
          if (predefinedOrder == 'asc' || predefinedOrder == 'desc') {
            return predefinedOrder
          } else if (list.utils.classes(btn).has('desc')) {
            return 'asc'
          } else if (list.utils.classes(btn).has('asc')) {
            return 'desc'
          } else {
            return 'asc'
          }
        },
        getInSensitive: function (btn, options) {
          var insensitive = list.utils.getAttribute(btn, 'data-insensitive');
          if (insensitive === 'false') {
            options.insensitive = false;
          } else {
            options.insensitive = true;
          }
        },
        setOrder: function (options) {
          for (var i = 0, il = buttons.els.length; i < il; i++) {
            var btn = buttons.els[i];
            if (list.utils.getAttribute(btn, 'data-sort') !== options.valueName) {
              continue
            }
            var predefinedOrder = list.utils.getAttribute(btn, 'data-order');
            if (predefinedOrder == 'asc' || predefinedOrder == 'desc') {
              if (predefinedOrder == options.order) {
                list.utils.classes(btn).add(options.order);
              }
            } else {
              list.utils.classes(btn).add(options.order);
            }
          }
        },
      };

      var sort = function () {
        list.trigger('sortStart');
        var options = {};

        var target = arguments[0].currentTarget || arguments[0].srcElement || undefined;

        if (target) {
          options.valueName = list.utils.getAttribute(target, 'data-sort');
          buttons.getInSensitive(target, options);
          options.order = buttons.getOrder(target);
        } else {
          options = arguments[1] || options;
          options.valueName = arguments[0];
          options.order = options.order || 'asc';
          options.insensitive = typeof options.insensitive == 'undefined' ? true : options.insensitive;
        }

        buttons.clear();
        buttons.setOrder(options);

        // caseInsensitive
        // alphabet
        var customSortFunction = options.sortFunction || list.sortFunction || null,
          multi = options.order === 'desc' ? -1 : 1,
          sortFunction;

        if (customSortFunction) {
          sortFunction = function (itemA, itemB) {
            return customSortFunction(itemA, itemB, options) * multi
          };
        } else {
          sortFunction = function (itemA, itemB) {
            var sort = list.utils.naturalSort;
            sort.alphabet = list.alphabet || options.alphabet || undefined;
            if (!sort.alphabet && options.insensitive) {
              sort = list.utils.naturalSort.caseInsensitive;
            }
            return sort(itemA.values()[options.valueName], itemB.values()[options.valueName]) * multi
          };
        }

        list.items.sort(sortFunction);
        list.update();
        list.trigger('sortComplete');
      };

      // Add handlers
      list.handlers.sortStart = list.handlers.sortStart || [];
      list.handlers.sortComplete = list.handlers.sortComplete || [];

      buttons.els = list.utils.getByClass(list.listContainer, list.sortClass);
      list.utils.events.bind(buttons.els, 'click', sort);
      list.on('searchStart', buttons.clear);
      list.on('filterStart', buttons.clear);

      return sort
    };

    var fuzzy = function (text, pattern, options) {
      // Aproximately where in the text is the pattern expected to be found?
      var Match_Location = options.location || 0;

      //Determines how close the match must be to the fuzzy location (specified above). An exact letter match which is 'distance' characters away from the fuzzy location would score as a complete mismatch. A distance of '0' requires the match be at the exact location specified, a threshold of '1000' would require a perfect match to be within 800 characters of the fuzzy location to be found using a 0.8 threshold.
      var Match_Distance = options.distance || 100;

      // At what point does the match algorithm give up. A threshold of '0.0' requires a perfect match (of both letters and location), a threshold of '1.0' would match anything.
      var Match_Threshold = options.threshold || 0.4;

      if (pattern === text) return true // Exact match
      if (pattern.length > 32) return false // This algorithm cannot be used

      // Set starting location at beginning text and initialise the alphabet.
      var loc = Match_Location,
        s = (function () {
          var q = {},
            i;

          for (i = 0; i < pattern.length; i++) {
            q[pattern.charAt(i)] = 0;
          }

          for (i = 0; i < pattern.length; i++) {
            q[pattern.charAt(i)] |= 1 << (pattern.length - i - 1);
          }

          return q
        })();

      // Compute and return the score for a match with e errors and x location.
      // Accesses loc and pattern through being a closure.

      function match_bitapScore_(e, x) {
        var accuracy = e / pattern.length,
          proximity = Math.abs(loc - x);

        if (!Match_Distance) {
          // Dodge divide by zero error.
          return proximity ? 1.0 : accuracy
        }
        return accuracy + proximity / Match_Distance
      }

      var score_threshold = Match_Threshold, // Highest score beyond which we give up.
        best_loc = text.indexOf(pattern, loc); // Is there a nearby exact match? (speedup)

      if (best_loc != -1) {
        score_threshold = Math.min(match_bitapScore_(0, best_loc), score_threshold);
        // What about in the other direction? (speedup)
        best_loc = text.lastIndexOf(pattern, loc + pattern.length);

        if (best_loc != -1) {
          score_threshold = Math.min(match_bitapScore_(0, best_loc), score_threshold);
        }
      }

      // Initialise the bit arrays.
      var matchmask = 1 << (pattern.length - 1);
      best_loc = -1;

      var bin_min, bin_mid;
      var bin_max = pattern.length + text.length;
      var last_rd;
      for (var d = 0; d < pattern.length; d++) {
        // Scan for the best match; each iteration allows for one more error.
        // Run a binary search to determine how far from 'loc' we can stray at this
        // error level.
        bin_min = 0;
        bin_mid = bin_max;
        while (bin_min < bin_mid) {
          if (match_bitapScore_(d, loc + bin_mid) <= score_threshold) {
            bin_min = bin_mid;
          } else {
            bin_max = bin_mid;
          }
          bin_mid = Math.floor((bin_max - bin_min) / 2 + bin_min);
        }
        // Use the result from this iteration as the maximum for the next.
        bin_max = bin_mid;
        var start = Math.max(1, loc - bin_mid + 1);
        var finish = Math.min(loc + bin_mid, text.length) + pattern.length;

        var rd = Array(finish + 2);
        rd[finish + 1] = (1 << d) - 1;
        for (var j = finish; j >= start; j--) {
          // The alphabet (s) is a sparse hash, so the following line generates
          // warnings.
          var charMatch = s[text.charAt(j - 1)];
          if (d === 0) {
            // First pass: exact match.
            rd[j] = ((rd[j + 1] << 1) | 1) & charMatch;
          } else {
            // Subsequent passes: fuzzy match.
            rd[j] = (((rd[j + 1] << 1) | 1) & charMatch) | (((last_rd[j + 1] | last_rd[j]) << 1) | 1) | last_rd[j + 1];
          }
          if (rd[j] & matchmask) {
            var score = match_bitapScore_(d, j - 1);
            // This match will almost certainly be better than any existing match.
            // But check anyway.
            if (score <= score_threshold) {
              // Told you so.
              score_threshold = score;
              best_loc = j - 1;
              if (best_loc > loc) {
                // When passing loc, don't exceed our current distance from loc.
                start = Math.max(1, 2 * loc - best_loc);
              } else {
                // Already passed loc, downhill from here on in.
                break
              }
            }
          }
        }
        // No hope for a (better) match at greater error levels.
        if (match_bitapScore_(d + 1, loc) > score_threshold) {
          break
        }
        last_rd = rd;
      }

      return best_loc < 0 ? false : true
    };

    var fuzzySearch = function (list, options) {
      options = options || {};

      options = extend(
        {
          location: 0,
          distance: 100,
          threshold: 0.4,
          multiSearch: true,
          searchClass: 'fuzzy-search',
        },
        options
      );

      var fuzzySearch = {
        search: function (searchString, columns) {
          // Substract arguments from the searchString or put searchString as only argument
          var searchArguments = options.multiSearch ? searchString.replace(/ +$/, '').split(/ +/) : [searchString];

          for (var k = 0, kl = list.items.length; k < kl; k++) {
            fuzzySearch.item(list.items[k], columns, searchArguments);
          }
        },
        item: function (item, columns, searchArguments) {
          var found = true;
          for (var i = 0; i < searchArguments.length; i++) {
            var foundArgument = false;
            for (var j = 0, jl = columns.length; j < jl; j++) {
              if (fuzzySearch.values(item.values(), columns[j], searchArguments[i])) {
                foundArgument = true;
              }
            }
            if (!foundArgument) {
              found = false;
            }
          }
          item.found = found;
        },
        values: function (values, value, searchArgument) {
          if (values.hasOwnProperty(value)) {
            var text = toString(values[value]).toLowerCase();

            if (fuzzy(text, searchArgument, options)) {
              return true
            }
          }
          return false
        },
      };

      events.bind(
        getByClass(list.listContainer, options.searchClass),
        'keyup',
        list.utils.events.debounce(function (e) {
          var target = e.target || e.srcElement; // IE have srcElement
          list.search(target.value, fuzzySearch.search);
        }, list.searchDelay)
      );

      return function (str, columns) {
        list.search(str, columns, fuzzySearch.search);
      }
    };

    var src = function (id, options, values) {
      var self = this,
        init,
        Item = item(self),
        addAsync$1 = addAsync(self),
        initPagination = pagination(self);

      init = {
        start: function () {
          self.listClass = 'list';
          self.searchClass = 'search';
          self.sortClass = 'sort';
          self.page = 10000;
          self.i = 1;
          self.items = [];
          self.visibleItems = [];
          self.matchingItems = [];
          self.searched = false;
          self.filtered = false;
          self.searchColumns = undefined;
          self.searchDelay = 0;
          self.handlers = { updated: [] };
          self.valueNames = [];
          self.utils = {
            getByClass: getByClass,
            extend: extend,
            indexOf: indexOf_1,
            events: events,
            toString: toString,
            naturalSort: naturalCompare_1,
            classes: classes,
            getAttribute: getAttribute,
            toArray: toArray,
          };

          self.utils.extend(self, options);

          self.listContainer = typeof id === 'string' ? document.getElementById(id) : id;
          if (!self.listContainer) {
            return
          }
          self.list = getByClass(self.listContainer, self.listClass, true);

          self.parse = parse(self);
          self.templater = templater(self);
          self.search = search(self);
          self.filter = filter(self);
          self.sort = sort(self);
          self.fuzzySearch = fuzzySearch(self, options.fuzzySearch);

          this.handlers();
          this.items();
          this.pagination();

          self.update();
        },
        handlers: function () {
          for (var handler in self.handlers) {
            if (self[handler] && self.handlers.hasOwnProperty(handler)) {
              self.on(handler, self[handler]);
            }
          }
        },
        items: function () {
          self.parse(self.list);
          if (values !== undefined) {
            self.add(values);
          }
        },
        pagination: function () {
          if (options.pagination !== undefined) {
            if (options.pagination === true) {
              options.pagination = [{}];
            }
            if (options.pagination[0] === undefined) {
              options.pagination = [options.pagination];
            }
            for (var i = 0, il = options.pagination.length; i < il; i++) {
              initPagination(options.pagination[i]);
            }
          }
        },
      };

      /*
       * Re-parse the List, use if html have changed
       */
      this.reIndex = function () {
        self.items = [];
        self.visibleItems = [];
        self.matchingItems = [];
        self.searched = false;
        self.filtered = false;
        self.parse(self.list);
      };

      this.toJSON = function () {
        var json = [];
        for (var i = 0, il = self.items.length; i < il; i++) {
          json.push(self.items[i].values());
        }
        return json
      };

      /*
       * Add object to list
       */
      this.add = function (values, callback) {
        if (values.length === 0) {
          return
        }
        if (callback) {
          addAsync$1(values.slice(0), callback);
          return
        }
        var added = [],
          notCreate = false;
        if (values[0] === undefined) {
          values = [values];
        }
        for (var i = 0, il = values.length; i < il; i++) {
          var item = null;
          notCreate = self.items.length > self.page ? true : false;
          item = new Item(values[i], undefined, notCreate);
          self.items.push(item);
          added.push(item);
        }
        self.update();
        return added
      };

      this.show = function (i, page) {
        this.i = i;
        this.page = page;
        self.update();
        return self
      };

      /* Removes object from list.
       * Loops through the list and removes objects where
       * property "valuename" === value
       */
      this.remove = function (valueName, value, options) {
        var found = 0;
        for (var i = 0, il = self.items.length; i < il; i++) {
          if (self.items[i].values()[valueName] == value) {
            self.templater.remove(self.items[i], options);
            self.items.splice(i, 1);
            il--;
            i--;
            found++;
          }
        }
        self.update();
        return found
      };

      /* Gets the objects in the list which
       * property "valueName" === value
       */
      this.get = function (valueName, value) {
        var matchedItems = [];
        for (var i = 0, il = self.items.length; i < il; i++) {
          var item = self.items[i];
          if (item.values()[valueName] == value) {
            matchedItems.push(item);
          }
        }
        return matchedItems
      };

      /*
       * Get size of the list
       */
      this.size = function () {
        return self.items.length
      };

      /*
       * Removes all items from the list
       */
      this.clear = function () {
        self.templater.clear();
        self.items = [];
        return self
      };

      this.on = function (event, callback) {
        self.handlers[event].push(callback);
        return self
      };

      this.off = function (event, callback) {
        var e = self.handlers[event];
        var index = indexOf_1(e, callback);
        if (index > -1) {
          e.splice(index, 1);
        }
        return self
      };

      this.trigger = function (event) {
        var i = self.handlers[event].length;
        while (i--) {
          self.handlers[event][i](self);
        }
        return self
      };

      this.reset = {
        filter: function () {
          var is = self.items,
            il = is.length;
          while (il--) {
            is[il].filtered = false;
          }
          return self
        },
        search: function () {
          var is = self.items,
            il = is.length;
          while (il--) {
            is[il].found = false;
          }
          return self
        },
      };

      this.update = function () {
        var is = self.items,
          il = is.length;

        self.visibleItems = [];
        self.matchingItems = [];
        self.templater.clear();
        for (var i = 0; i < il; i++) {
          if (is[i].matching() && self.matchingItems.length + 1 >= self.i && self.visibleItems.length < self.page) {
            is[i].show();
            self.visibleItems.push(is[i]);
            self.matchingItems.push(is[i]);
          } else if (is[i].matching()) {
            self.matchingItems.push(is[i]);
            is[i].hide();
          } else {
            is[i].hide();
          }
        }
        self.trigger('updated');
        return self
      };

      init.start();
    };

    /* src/app/components/molecules/Table.svelte generated by Svelte v3.32.1 */

    const { console: console_1$2 } = globals;
    const file$8 = "src/app/components/molecules/Table.svelte";
    const get_default_slot_changes = dirty => ({});

    const get_default_slot_context = ctx => ({
    	"output-rows": /*rows*/ ctx[0],
    	"output-headers": /*headers*/ ctx[1]
    });

    function create_fragment$9(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], get_default_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "id", "simple-datatable");
    			attr_dev(div, "style", /*tableStyle*/ ctx[2]);
    			attr_dev(div, "class", "svelte-awh96m");
    			add_location(div, file$8, 41, 0, 903);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, get_default_slot_changes, get_default_slot_context);
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
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
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
    	validate_slots("Table", slots, ['default']);
    	let { data = [] } = $$props;
    	let rows = data;
    	let headers = [];

    	let { options = {
    		valueNames: [], // This should be obtained from data headers
    		
    	} } = $$props;

    	console.log("options", options);
    	let { headerBackground = "var(--theme-secondary)" } = $$props;
    	let { headerColor = "#FFF" } = $$props;
    	let { evenBackground = "#FFF" } = $$props;
    	let { evenColor = "inherit" } = $$props;
    	let { oddBackground = "#F3F3F3" } = $$props;
    	let { oddColor = "inherit" } = $$props;
    	let { style = "" } = $$props;

    	let tableStyle = `
		--headerBackground: ${headerBackground};
		--headerColor: ${headerColor};
		--evenBackground: ${evenBackground};
		--evenColor: ${evenColor};
		--oddBackground: ${oddBackground};
		--oddColor: ${oddColor};
		${style}
	`;

    	onMount(() => {
    		new src("simple-datatable", options);
    	});

    	const writable_props = [
    		"data",
    		"options",
    		"headerBackground",
    		"headerColor",
    		"evenBackground",
    		"evenColor",
    		"oddBackground",
    		"oddColor",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Table> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(3, data = $$props.data);
    		if ("options" in $$props) $$invalidate(4, options = $$props.options);
    		if ("headerBackground" in $$props) $$invalidate(5, headerBackground = $$props.headerBackground);
    		if ("headerColor" in $$props) $$invalidate(6, headerColor = $$props.headerColor);
    		if ("evenBackground" in $$props) $$invalidate(7, evenBackground = $$props.evenBackground);
    		if ("evenColor" in $$props) $$invalidate(8, evenColor = $$props.evenColor);
    		if ("oddBackground" in $$props) $$invalidate(9, oddBackground = $$props.oddBackground);
    		if ("oddColor" in $$props) $$invalidate(10, oddColor = $$props.oddColor);
    		if ("style" in $$props) $$invalidate(11, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		List: src,
    		data,
    		rows,
    		headers,
    		options,
    		headerBackground,
    		headerColor,
    		evenBackground,
    		evenColor,
    		oddBackground,
    		oddColor,
    		style,
    		tableStyle
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(3, data = $$props.data);
    		if ("rows" in $$props) $$invalidate(0, rows = $$props.rows);
    		if ("headers" in $$props) $$invalidate(1, headers = $$props.headers);
    		if ("options" in $$props) $$invalidate(4, options = $$props.options);
    		if ("headerBackground" in $$props) $$invalidate(5, headerBackground = $$props.headerBackground);
    		if ("headerColor" in $$props) $$invalidate(6, headerColor = $$props.headerColor);
    		if ("evenBackground" in $$props) $$invalidate(7, evenBackground = $$props.evenBackground);
    		if ("evenColor" in $$props) $$invalidate(8, evenColor = $$props.evenColor);
    		if ("oddBackground" in $$props) $$invalidate(9, oddBackground = $$props.oddBackground);
    		if ("oddColor" in $$props) $$invalidate(10, oddColor = $$props.oddColor);
    		if ("style" in $$props) $$invalidate(11, style = $$props.style);
    		if ("tableStyle" in $$props) $$invalidate(2, tableStyle = $$props.tableStyle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		rows,
    		headers,
    		tableStyle,
    		data,
    		options,
    		headerBackground,
    		headerColor,
    		evenBackground,
    		evenColor,
    		oddBackground,
    		oddColor,
    		style,
    		$$scope,
    		slots
    	];
    }

    class Table extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			data: 3,
    			options: 4,
    			headerBackground: 5,
    			headerColor: 6,
    			evenBackground: 7,
    			evenColor: 8,
    			oddBackground: 9,
    			oddColor: 10,
    			style: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Table",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get data() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get headerBackground() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set headerBackground(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get headerColor() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set headerColor(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get evenBackground() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set evenBackground(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get evenColor() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set evenColor(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get oddBackground() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set oddBackground(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get oddColor() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set oddColor(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // Layouts


    var componentIndex = {
        Module : Module,
        Auth : Auth,
        Button : Button,
        Input : Input,
        Search : Search,
        Webnav : Webnav,
        Aside : Aside,
        Modal : Modal,
        Table : Table
    };

    // Layouts
    const Module$1 = Module;
    const Auth$1 = Auth;

    // Components
    const Button$1 = Button;
    const Input$1 = Input;
    const Webnav$1 = Webnav;
    const Aside$1 = Aside;
    const Modal$1 = Modal;
    const Table$1 = Table;

    function authorizeRequestInterceptor (config) {
        const session = localStorage.getItem('session');
        if(session){
          config.headers.Authorization =  JSON.parse(session).id_token || null;
        }
        // config.headers['Content-Type'] = 'application/json'
        return config
      }

    function parseResponseInterceptor (response) {
      return response.data
    }

    var interceptorIndex = {
        authorizeRequest : authorizeRequestInterceptor,
        parseResponse : parseResponseInterceptor
    };

    /* src/app/pages/landing/landing.page.svelte generated by Svelte v3.32.1 */

    const file$9 = "src/app/pages/landing/landing.page.svelte";

    function create_fragment$a(ctx) {
    	let section;
    	let t0;
    	let p;
    	let t1;
    	let a;

    	const block = {
    		c: function create() {
    			section = element("section");
    			t0 = text("This is the landing page\n\n\t");
    			p = element("p");
    			t1 = text("Please go to: ");
    			a = element("a");
    			a.textContent = "Home";
    			attr_dev(a, "href", "#/home");
    			add_location(a, file$9, 8, 18, 78);
    			add_location(p, file$9, 8, 1, 61);
    			add_location(section, file$9, 5, 0, 22);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, t0);
    			append_dev(section, p);
    			append_dev(p, t1);
    			append_dev(p, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
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

    function instance$a($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Landing_page", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Landing_page> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Landing_page extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Landing_page",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    var has = Object.prototype.hasOwnProperty;

    var hexTable = (function () {
        var array = [];
        for (var i = 0; i < 256; ++i) {
            array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
        }

        return array;
    }());

    var compactQueue = function compactQueue(queue) {
        var obj;

        while (queue.length) {
            var item = queue.pop();
            obj = item.obj[item.prop];

            if (Array.isArray(obj)) {
                var compacted = [];

                for (var j = 0; j < obj.length; ++j) {
                    if (typeof obj[j] !== 'undefined') {
                        compacted.push(obj[j]);
                    }
                }

                item.obj[item.prop] = compacted;
            }
        }

        return obj;
    };

    var arrayToObject = function arrayToObject(source, options) {
        var obj = options && options.plainObjects ? Object.create(null) : {};
        for (var i = 0; i < source.length; ++i) {
            if (typeof source[i] !== 'undefined') {
                obj[i] = source[i];
            }
        }

        return obj;
    };

    var merge = function merge(target, source, options) {
        if (!source) {
            return target;
        }

        if (typeof source !== 'object') {
            if (Array.isArray(target)) {
                target.push(source);
            } else if (typeof target === 'object') {
                if (options.plainObjects || options.allowPrototypes || !has.call(Object.prototype, source)) {
                    target[source] = true;
                }
            } else {
                return [target, source];
            }

            return target;
        }

        if (typeof target !== 'object') {
            return [target].concat(source);
        }

        var mergeTarget = target;
        if (Array.isArray(target) && !Array.isArray(source)) {
            mergeTarget = arrayToObject(target, options);
        }

        if (Array.isArray(target) && Array.isArray(source)) {
            source.forEach(function (item, i) {
                if (has.call(target, i)) {
                    if (target[i] && typeof target[i] === 'object') {
                        target[i] = merge(target[i], item, options);
                    } else {
                        target.push(item);
                    }
                } else {
                    target[i] = item;
                }
            });
            return target;
        }

        return Object.keys(source).reduce(function (acc, key) {
            var value = source[key];

            if (has.call(acc, key)) {
                acc[key] = merge(acc[key], value, options);
            } else {
                acc[key] = value;
            }
            return acc;
        }, mergeTarget);
    };

    var assign$1 = function assignSingleSource(target, source) {
        return Object.keys(source).reduce(function (acc, key) {
            acc[key] = source[key];
            return acc;
        }, target);
    };

    var decode = function (str) {
        try {
            return decodeURIComponent(str.replace(/\+/g, ' '));
        } catch (e) {
            return str;
        }
    };

    var encode = function encode(str) {
        // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
        // It has been adapted here for stricter adherence to RFC 3986
        if (str.length === 0) {
            return str;
        }

        var string = typeof str === 'string' ? str : String(str);

        var out = '';
        for (var i = 0; i < string.length; ++i) {
            var c = string.charCodeAt(i);

            if (
                c === 0x2D // -
                || c === 0x2E // .
                || c === 0x5F // _
                || c === 0x7E // ~
                || (c >= 0x30 && c <= 0x39) // 0-9
                || (c >= 0x41 && c <= 0x5A) // a-z
                || (c >= 0x61 && c <= 0x7A) // A-Z
            ) {
                out += string.charAt(i);
                continue;
            }

            if (c < 0x80) {
                out = out + hexTable[c];
                continue;
            }

            if (c < 0x800) {
                out = out + (hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)]);
                continue;
            }

            if (c < 0xD800 || c >= 0xE000) {
                out = out + (hexTable[0xE0 | (c >> 12)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)]);
                continue;
            }

            i += 1;
            c = 0x10000 + (((c & 0x3FF) << 10) | (string.charCodeAt(i) & 0x3FF));
            out += hexTable[0xF0 | (c >> 18)]
                + hexTable[0x80 | ((c >> 12) & 0x3F)]
                + hexTable[0x80 | ((c >> 6) & 0x3F)]
                + hexTable[0x80 | (c & 0x3F)];
        }

        return out;
    };

    var compact = function compact(value) {
        var queue = [{ obj: { o: value }, prop: 'o' }];
        var refs = [];

        for (var i = 0; i < queue.length; ++i) {
            var item = queue[i];
            var obj = item.obj[item.prop];

            var keys = Object.keys(obj);
            for (var j = 0; j < keys.length; ++j) {
                var key = keys[j];
                var val = obj[key];
                if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
                    queue.push({ obj: obj, prop: key });
                    refs.push(val);
                }
            }
        }

        return compactQueue(queue);
    };

    var isRegExp = function isRegExp(obj) {
        return Object.prototype.toString.call(obj) === '[object RegExp]';
    };

    var isBuffer = function isBuffer(obj) {
        if (obj === null || typeof obj === 'undefined') {
            return false;
        }

        return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
    };

    var utils = {
        arrayToObject: arrayToObject,
        assign: assign$1,
        compact: compact,
        decode: decode,
        encode: encode,
        isBuffer: isBuffer,
        isRegExp: isRegExp,
        merge: merge
    };

    var replace$1 = String.prototype.replace;
    var percentTwenties = /%20/g;

    var formats = {
        'default': 'RFC3986',
        formatters: {
            RFC1738: function (value) {
                return replace$1.call(value, percentTwenties, '+');
            },
            RFC3986: function (value) {
                return value;
            }
        },
        RFC1738: 'RFC1738',
        RFC3986: 'RFC3986'
    };

    var arrayPrefixGenerators = {
        brackets: function brackets(prefix) { // eslint-disable-line func-name-matching
            return prefix + '[]';
        },
        indices: function indices(prefix, key) { // eslint-disable-line func-name-matching
            return prefix + '[' + key + ']';
        },
        repeat: function repeat(prefix) { // eslint-disable-line func-name-matching
            return prefix;
        }
    };

    var toISO = Date.prototype.toISOString;

    var defaults = {
        delimiter: '&',
        encode: true,
        encoder: utils.encode,
        encodeValuesOnly: false,
        serializeDate: function serializeDate(date) { // eslint-disable-line func-name-matching
            return toISO.call(date);
        },
        skipNulls: false,
        strictNullHandling: false
    };

    var stringify = function stringify( // eslint-disable-line func-name-matching
        object,
        prefix,
        generateArrayPrefix,
        strictNullHandling,
        skipNulls,
        encoder,
        filter,
        sort,
        allowDots,
        serializeDate,
        formatter,
        encodeValuesOnly
    ) {
        var obj = object;
        if (typeof filter === 'function') {
            obj = filter(prefix, obj);
        } else if (obj instanceof Date) {
            obj = serializeDate(obj);
        } else if (obj === null) {
            if (strictNullHandling) {
                return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder) : prefix;
            }

            obj = '';
        }

        if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || utils.isBuffer(obj)) {
            if (encoder) {
                var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder);
                return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults.encoder))];
            }
            return [formatter(prefix) + '=' + formatter(String(obj))];
        }

        var values = [];

        if (typeof obj === 'undefined') {
            return values;
        }

        var objKeys;
        if (Array.isArray(filter)) {
            objKeys = filter;
        } else {
            var keys = Object.keys(obj);
            objKeys = sort ? keys.sort(sort) : keys;
        }

        for (var i = 0; i < objKeys.length; ++i) {
            var key = objKeys[i];

            if (skipNulls && obj[key] === null) {
                continue;
            }

            if (Array.isArray(obj)) {
                values = values.concat(stringify(
                    obj[key],
                    generateArrayPrefix(prefix, key),
                    generateArrayPrefix,
                    strictNullHandling,
                    skipNulls,
                    encoder,
                    filter,
                    sort,
                    allowDots,
                    serializeDate,
                    formatter,
                    encodeValuesOnly
                ));
            } else {
                values = values.concat(stringify(
                    obj[key],
                    prefix + (allowDots ? '.' + key : '[' + key + ']'),
                    generateArrayPrefix,
                    strictNullHandling,
                    skipNulls,
                    encoder,
                    filter,
                    sort,
                    allowDots,
                    serializeDate,
                    formatter,
                    encodeValuesOnly
                ));
            }
        }

        return values;
    };

    var stringify_1 = function (object, opts) {
        var obj = object;
        var options = opts ? utils.assign({}, opts) : {};

        if (options.encoder !== null && options.encoder !== undefined && typeof options.encoder !== 'function') {
            throw new TypeError('Encoder has to be a function.');
        }

        var delimiter = typeof options.delimiter === 'undefined' ? defaults.delimiter : options.delimiter;
        var strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults.strictNullHandling;
        var skipNulls = typeof options.skipNulls === 'boolean' ? options.skipNulls : defaults.skipNulls;
        var encode = typeof options.encode === 'boolean' ? options.encode : defaults.encode;
        var encoder = typeof options.encoder === 'function' ? options.encoder : defaults.encoder;
        var sort = typeof options.sort === 'function' ? options.sort : null;
        var allowDots = typeof options.allowDots === 'undefined' ? false : options.allowDots;
        var serializeDate = typeof options.serializeDate === 'function' ? options.serializeDate : defaults.serializeDate;
        var encodeValuesOnly = typeof options.encodeValuesOnly === 'boolean' ? options.encodeValuesOnly : defaults.encodeValuesOnly;
        if (typeof options.format === 'undefined') {
            options.format = formats['default'];
        } else if (!Object.prototype.hasOwnProperty.call(formats.formatters, options.format)) {
            throw new TypeError('Unknown format option provided.');
        }
        var formatter = formats.formatters[options.format];
        var objKeys;
        var filter;

        if (typeof options.filter === 'function') {
            filter = options.filter;
            obj = filter('', obj);
        } else if (Array.isArray(options.filter)) {
            filter = options.filter;
            objKeys = filter;
        }

        var keys = [];

        if (typeof obj !== 'object' || obj === null) {
            return '';
        }

        var arrayFormat;
        if (options.arrayFormat in arrayPrefixGenerators) {
            arrayFormat = options.arrayFormat;
        } else if ('indices' in options) {
            arrayFormat = options.indices ? 'indices' : 'repeat';
        } else {
            arrayFormat = 'indices';
        }

        var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];

        if (!objKeys) {
            objKeys = Object.keys(obj);
        }

        if (sort) {
            objKeys.sort(sort);
        }

        for (var i = 0; i < objKeys.length; ++i) {
            var key = objKeys[i];

            if (skipNulls && obj[key] === null) {
                continue;
            }

            keys = keys.concat(stringify(
                obj[key],
                key,
                generateArrayPrefix,
                strictNullHandling,
                skipNulls,
                encode ? encoder : null,
                filter,
                sort,
                allowDots,
                serializeDate,
                formatter,
                encodeValuesOnly
            ));
        }

        var joined = keys.join(delimiter);
        var prefix = options.addQueryPrefix === true ? '?' : '';

        return joined.length > 0 ? prefix + joined : '';
    };

    var has$1 = Object.prototype.hasOwnProperty;

    var defaults$1 = {
        allowDots: false,
        allowPrototypes: false,
        arrayLimit: 20,
        decoder: utils.decode,
        delimiter: '&',
        depth: 5,
        parameterLimit: 1000,
        plainObjects: false,
        strictNullHandling: false
    };

    var parseValues = function parseQueryStringValues(str, options) {
        var obj = {};
        var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str;
        var limit = options.parameterLimit === Infinity ? undefined : options.parameterLimit;
        var parts = cleanStr.split(options.delimiter, limit);

        for (var i = 0; i < parts.length; ++i) {
            var part = parts[i];

            var bracketEqualsPos = part.indexOf(']=');
            var pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;

            var key, val;
            if (pos === -1) {
                key = options.decoder(part, defaults$1.decoder);
                val = options.strictNullHandling ? null : '';
            } else {
                key = options.decoder(part.slice(0, pos), defaults$1.decoder);
                val = options.decoder(part.slice(pos + 1), defaults$1.decoder);
            }
            if (has$1.call(obj, key)) {
                obj[key] = [].concat(obj[key]).concat(val);
            } else {
                obj[key] = val;
            }
        }

        return obj;
    };

    var parseObject = function (chain, val, options) {
        var leaf = val;

        for (var i = chain.length - 1; i >= 0; --i) {
            var obj;
            var root = chain[i];

            if (root === '[]') {
                obj = [];
                obj = obj.concat(leaf);
            } else {
                obj = options.plainObjects ? Object.create(null) : {};
                var cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
                var index = parseInt(cleanRoot, 10);
                if (
                    !isNaN(index)
                    && root !== cleanRoot
                    && String(index) === cleanRoot
                    && index >= 0
                    && (options.parseArrays && index <= options.arrayLimit)
                ) {
                    obj = [];
                    obj[index] = leaf;
                } else {
                    obj[cleanRoot] = leaf;
                }
            }

            leaf = obj;
        }

        return leaf;
    };

    var parseKeys = function parseQueryStringKeys(givenKey, val, options) {
        if (!givenKey) {
            return;
        }

        // Transform dot notation to bracket notation
        var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey;

        // The regex chunks

        var brackets = /(\[[^[\]]*])/;
        var child = /(\[[^[\]]*])/g;

        // Get the parent

        var segment = brackets.exec(key);
        var parent = segment ? key.slice(0, segment.index) : key;

        // Stash the parent if it exists

        var keys = [];
        if (parent) {
            // If we aren't using plain objects, optionally prefix keys
            // that would overwrite object prototype properties
            if (!options.plainObjects && has$1.call(Object.prototype, parent)) {
                if (!options.allowPrototypes) {
                    return;
                }
            }

            keys.push(parent);
        }

        // Loop through children appending to the array until we hit depth

        var i = 0;
        while ((segment = child.exec(key)) !== null && i < options.depth) {
            i += 1;
            if (!options.plainObjects && has$1.call(Object.prototype, segment[1].slice(1, -1))) {
                if (!options.allowPrototypes) {
                    return;
                }
            }
            keys.push(segment[1]);
        }

        // If there's a remainder, just add whatever is left

        if (segment) {
            keys.push('[' + key.slice(segment.index) + ']');
        }

        return parseObject(keys, val, options);
    };

    var parse$1 = function (str, opts) {
        var options = opts ? utils.assign({}, opts) : {};

        if (options.decoder !== null && options.decoder !== undefined && typeof options.decoder !== 'function') {
            throw new TypeError('Decoder has to be a function.');
        }

        options.ignoreQueryPrefix = options.ignoreQueryPrefix === true;
        options.delimiter = typeof options.delimiter === 'string' || utils.isRegExp(options.delimiter) ? options.delimiter : defaults$1.delimiter;
        options.depth = typeof options.depth === 'number' ? options.depth : defaults$1.depth;
        options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : defaults$1.arrayLimit;
        options.parseArrays = options.parseArrays !== false;
        options.decoder = typeof options.decoder === 'function' ? options.decoder : defaults$1.decoder;
        options.allowDots = typeof options.allowDots === 'boolean' ? options.allowDots : defaults$1.allowDots;
        options.plainObjects = typeof options.plainObjects === 'boolean' ? options.plainObjects : defaults$1.plainObjects;
        options.allowPrototypes = typeof options.allowPrototypes === 'boolean' ? options.allowPrototypes : defaults$1.allowPrototypes;
        options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : defaults$1.parameterLimit;
        options.strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults$1.strictNullHandling;

        if (str === '' || str === null || typeof str === 'undefined') {
            return options.plainObjects ? Object.create(null) : {};
        }

        var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
        var obj = options.plainObjects ? Object.create(null) : {};

        // Iterate over the keys and setup the new object

        var keys = Object.keys(tempObj);
        for (var i = 0; i < keys.length; ++i) {
            var key = keys[i];
            var newObj = parseKeys(key, tempObj[key], options);
            obj = utils.merge(obj, newObj, options);
        }

        return utils.compact(obj);
    };

    var lib = {
        formats: formats,
        parse: parse$1,
        stringify: stringify_1
    };

    /* src/app/pages/login/loginForm.partial.svelte generated by Svelte v3.32.1 */
    const file$a = "src/app/pages/login/loginForm.partial.svelte";

    // (33:8) <Button type="reset" style="border-radius:10px;margin-bottom:1em;margin-right:1em;box-sizing: border-box;" backgroundColor="white"  width="calc(50% - 0.5em);" on:click={()=>{ loginWith('google') }}>
    function create_default_slot_1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "img/google.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "google");
    			attr_dev(img, "class", "svelte-1aerpdi");
    			add_location(img, file$a, 32, 206, 1268);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(33:8) <Button type=\\\"reset\\\" style=\\\"border-radius:10px;margin-bottom:1em;margin-right:1em;box-sizing: border-box;\\\" backgroundColor=\\\"white\\\"  width=\\\"calc(50% - 0.5em);\\\" on:click={()=>{ loginWith('google') }}>",
    		ctx
    	});

    	return block;
    }

    // (34:8) <Button type="reset" style="border-radius:10px;margin-bottom:1em;box-sizing: border-box;" backgroundColor="black"  width="calc(50% - 0.5em);"  on:click={()=>{ loginWith('github') }}>
    function create_default_slot(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "img/github.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "github");
    			attr_dev(img, "class", "svelte-1aerpdi");
    			add_location(img, file$a, 33, 190, 1509);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(34:8) <Button type=\\\"reset\\\" style=\\\"border-radius:10px;margin-bottom:1em;box-sizing: border-box;\\\" backgroundColor=\\\"black\\\"  width=\\\"calc(50% - 0.5em);\\\"  on:click={()=>{ loginWith('github') }}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let form;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let div;
    	let button0;
    	let t4;
    	let button1;
    	let current;

    	button0 = new Button$1({
    			props: {
    				type: "reset",
    				style: "border-radius:10px;margin-bottom:1em;margin-right:1em;box-sizing: border-box;",
    				backgroundColor: "white",
    				width: "calc(50% - 0.5em);",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*click_handler*/ ctx[2]);

    	button1 = new Button$1({
    			props: {
    				type: "reset",
    				style: "border-radius:10px;margin-bottom:1em;box-sizing: border-box;",
    				backgroundColor: "black",
    				width: "calc(50% - 0.5em);",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler_1*/ ctx[3]);

    	const block = {
    		c: function create() {
    			form = element("form");
    			h1 = element("h1");
    			h1.textContent = "Instantcode";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Sign in with your social account";
    			t3 = space();
    			div = element("div");
    			create_component(button0.$$.fragment);
    			t4 = space();
    			create_component(button1.$$.fragment);
    			attr_dev(h1, "class", "svelte-1aerpdi");
    			add_location(h1, file$a, 26, 4, 670);
    			attr_dev(p, "class", "svelte-1aerpdi");
    			add_location(p, file$a, 27, 4, 696);
    			attr_dev(div, "class", "socialLogin svelte-1aerpdi");
    			add_location(div, file$a, 31, 4, 1035);
    			attr_dev(form, "class", "loginForm svelte-1aerpdi");
    			add_location(form, file$a, 25, 0, 640);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, h1);
    			append_dev(form, t1);
    			append_dev(form, p);
    			append_dev(form, t3);
    			append_dev(form, div);
    			mount_component(button0, div, null);
    			append_dev(div, t4);
    			mount_component(button1, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_component(button0);
    			destroy_component(button1);
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
    	let $querystring;
    	validate_store(querystring, "querystring");
    	component_subscribe($$self, querystring, $$value => $$invalidate(4, $querystring = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LoginForm_partial", slots, []);
    	const { session } = getContext("services");
    	let { user } = $$props;

    	const loginWith = provider => {
    		location.replace(`http://localhost:3001/auth/${provider}`, self, "");
    		return false;
    	};

    	onMount(() => {
    		if (lib.parse($querystring).token) {
    			session.setSession({ id_token: lib.parse($querystring).token });
    			push("/app");
    		}
    	});

    	const writable_props = ["user"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LoginForm_partial> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		loginWith("google");
    	};

    	const click_handler_1 = () => {
    		loginWith("github");
    	};

    	$$self.$$set = $$props => {
    		if ("user" in $$props) $$invalidate(1, user = $$props.user);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		qs: lib,
    		push,
    		querystring,
    		Input: Input$1,
    		Button: Button$1,
    		session,
    		user,
    		loginWith,
    		$querystring
    	});

    	$$self.$inject_state = $$props => {
    		if ("user" in $$props) $$invalidate(1, user = $$props.user);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [loginWith, user, click_handler, click_handler_1];
    }

    class LoginForm_partial extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { user: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LoginForm_partial",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*user*/ ctx[1] === undefined && !("user" in props)) {
    			console.warn("<LoginForm_partial> was created without expected prop 'user'");
    		}
    	}

    	get user() {
    		throw new Error("<LoginForm_partial>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set user(value) {
    		throw new Error("<LoginForm_partial>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/app/pages/login/login.page.svelte generated by Svelte v3.32.1 */

    // (31:0) <Auth>
    function create_default_slot$1(ctx) {
    	let loginform;
    	let current;

    	loginform = new LoginForm_partial({
    			props: { user: /*user*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(loginform.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loginform, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loginform.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loginform.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loginform, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(31:0) <Auth>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let auth;
    	let current;

    	auth = new Auth$1({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(auth.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(auth, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const auth_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				auth_changes.$$scope = { dirty, ctx };
    			}

    			auth.$set(auth_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(auth.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(auth.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(auth, detaching);
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

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Login_page", slots, []);
    	const { client, session } = getContext("services");

    	// Model
    	let user = { username: "", password: "" };

    	let userSession;

    	// Methods
    	const login = async () => {
    		try {
    			userSession = await client.auth.signIn(user);
    			session.setSession(userSession);
    			push("/app");
    		} catch(err) {
    			alert("login failed");
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Login_page> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		Auth: Auth$1,
    		Input: Input$1,
    		push,
    		querystring,
    		client,
    		session,
    		LoginForm: LoginForm_partial,
    		user,
    		userSession,
    		login
    	});

    	$$self.$inject_state = $$props => {
    		if ("user" in $$props) $$invalidate(0, user = $$props.user);
    		if ("userSession" in $$props) userSession = $$props.userSession;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [user];
    }

    class Login_page extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login_page",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/app/pages/user/datatable.partial.svelte generated by Svelte v3.32.1 */
    const file$b = "src/app/pages/user/datatable.partial.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	child_ctx[24] = i;
    	return child_ctx;
    }

    // (79:4) {#if data.length}
    function create_if_block$3(ctx) {
    	let table;
    	let current;

    	table = new Table$1({
    			props: {
    				options: /*settings*/ ctx[4],
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};

    			if (dirty & /*$$scope, data, modal, selectedUser*/ 33554445) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(79:4) {#if data.length}",
    		ctx
    	});

    	return block;
    }

    // (83:4) <Button backgroundColor="var(--theme-secondary)" width="12em" outline on:click={()=>{ modal.create = true;  }}>
    function create_default_slot_12(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("New User");
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
    		id: create_default_slot_12.name,
    		type: "slot",
    		source: "(83:4) <Button backgroundColor=\\\"var(--theme-secondary)\\\" width=\\\"12em\\\" outline on:click={()=>{ modal.create = true;  }}>",
    		ctx
    	});

    	return block;
    }

    // (99:28) <Button width="8em" outline on:click={()=>{ modal.update = true; selectedUser = row }}>
    function create_default_slot_11(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Update");
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
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(99:28) <Button width=\\\"8em\\\" outline on:click={()=>{ modal.update = true; selectedUser = row }}>",
    		ctx
    	});

    	return block;
    }

    // (100:28) <Button width="8em" outline on:click={()=>{ modal.delete = true;  modal.target = i; selectedUser = row }} }}>
    function create_default_slot_10(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Delete");
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
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(100:28) <Button width=\\\"8em\\\" outline on:click={()=>{ modal.delete = true;  modal.target = i; selectedUser = row }} }}>",
    		ctx
    	});

    	return block;
    }

    // (95:4) {#each data as row, i}
    function create_each_block$1(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*row*/ ctx[22].email + "";
    	let t0;
    	let t1;
    	let td1;
    	let button0;
    	let t2;
    	let td2;
    	let button1;
    	let t3;
    	let current;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[9](/*row*/ ctx[22]);
    	}

    	button0 = new Button$1({
    			props: {
    				width: "8em",
    				outline: true,
    				$$slots: { default: [create_default_slot_11] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", click_handler_1);

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[10](/*i*/ ctx[24], /*row*/ ctx[22]);
    	}

    	button1 = new Button$1({
    			props: {
    				width: "8em",
    				outline: true,
    				"}}": true,
    				$$slots: { default: [create_default_slot_10] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", click_handler_2);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			create_component(button0.$$.fragment);
    			t2 = space();
    			td2 = element("td");
    			create_component(button1.$$.fragment);
    			t3 = space();
    			attr_dev(td0, "class", "email");
    			add_location(td0, file$b, 96, 12, 2339);
    			attr_dev(td1, "width", "8em");
    			add_location(td1, file$b, 98, 12, 2398);
    			attr_dev(td2, "width", "8em");
    			add_location(td2, file$b, 99, 12, 2535);
    			add_location(tr, file$b, 95, 8, 2321);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(td0, t1);
    			append_dev(tr, td1);
    			mount_component(button0, td1, null);
    			append_dev(tr, t2);
    			append_dev(tr, td2);
    			mount_component(button1, td2, null);
    			append_dev(tr, t3);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*data*/ 1) && t0_value !== (t0_value = /*row*/ ctx[22].email + "")) set_data_dev(t0, t0_value);
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 33554432) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 33554432) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(95:4) {#each data as row, i}",
    		ctx
    	});

    	return block;
    }

    // (80:0) <Table  options={settings}>
    function create_default_slot_9(ctx) {
    	let div;
    	let input;
    	let t0;
    	let button;
    	let t1;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t3;
    	let th1;
    	let t5;
    	let th2;
    	let t7;
    	let tbody;
    	let current;

    	input = new Input$1({
    			props: {
    				search: true,
    				placeholder: "Search",
    				backgroundColor: "var(--theme-light-gray)",
    				foregroundColor: "var(--theme-dark-gray)",
    				style: "margin-right:2em;"
    			},
    			$$inline: true
    		});

    	button = new Button$1({
    			props: {
    				backgroundColor: "var(--theme-secondary)",
    				width: "12em",
    				outline: true,
    				$$slots: { default: [create_default_slot_12] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[8]);
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(input.$$.fragment);
    			t0 = space();
    			create_component(button.$$.fragment);
    			t1 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Email";
    			t3 = space();
    			th1 = element("th");
    			th1.textContent = "Update";
    			t5 = space();
    			th2 = element("th");
    			th2.textContent = "Delete";
    			t7 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "controls-container svelte-1mn61rz");
    			add_location(div, file$b, 80, 0, 1744);
    			attr_dev(th0, "class", "sort");
    			attr_dev(th0, "data-sort", "email");
    			add_location(th0, file$b, 87, 12, 2123);
    			add_location(th1, file$b, 88, 12, 2182);
    			add_location(th2, file$b, 89, 12, 2211);
    			add_location(tr, file$b, 86, 8, 2105);
    			add_location(thead, file$b, 85, 4, 2088);
    			attr_dev(tbody, "class", "list");
    			add_location(tbody, file$b, 92, 4, 2261);
    			add_location(table, file$b, 84, 0, 2074);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(input, div, null);
    			append_dev(div, t0);
    			mount_component(button, div, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t3);
    			append_dev(tr, th1);
    			append_dev(tr, t5);
    			append_dev(tr, th2);
    			append_dev(table, t7);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 33554432) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (dirty & /*modal, selectedUser, data*/ 13) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			transition_in(button.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(input);
    			destroy_component(button);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(80:0) <Table  options={settings}>",
    		ctx
    	});

    	return block;
    }

    // (112:8) <Button width="100%" backgroundColor="var(--theme-primary)" style="margin-right:2em;" on:click={handleCreate}>
    function create_default_slot_8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Create User");
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
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(112:8) <Button width=\\\"100%\\\" backgroundColor=\\\"var(--theme-primary)\\\" style=\\\"margin-right:2em;\\\" on:click={handleCreate}>",
    		ctx
    	});

    	return block;
    }

    // (113:8) <Button width="100%" outline on:click={()=>{ modal.hide() }}>
    function create_default_slot_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Cancel");
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
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(113:8) <Button width=\\\"100%\\\" outline on:click={()=>{ modal.hide() }}>",
    		ctx
    	});

    	return block;
    }

    // (108:0) <Modal bind:visible={modal.create} style="display:flex;flex-direction:column;width:40vw;min-width:280px;border-radius:0.5em;padding:4em">
    function create_default_slot_6(ctx) {
    	let h3;
    	let t1;
    	let input;
    	let updating_value;
    	let t2;
    	let div;
    	let button0;
    	let t3;
    	let button1;
    	let current;

    	function input_value_binding(value) {
    		/*input_value_binding*/ ctx[11].call(null, value);
    	}

    	let input_props = {
    		placeholder: "Email",
    		backgroundColor: "var(--theme-light-gray)",
    		foregroundColor: "var(--theme-dark-gray)",
    		style: "margin-right:2em;"
    	};

    	if (/*newUser*/ ctx[1].email !== void 0) {
    		input_props.value = /*newUser*/ ctx[1].email;
    	}

    	input = new Input$1({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding));

    	button0 = new Button$1({
    			props: {
    				width: "100%",
    				backgroundColor: "var(--theme-primary)",
    				style: "margin-right:2em;",
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*handleCreate*/ ctx[5]);

    	button1 = new Button$1({
    			props: {
    				width: "100%",
    				outline: true,
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler_3*/ ctx[12]);

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Create a new User";
    			t1 = space();
    			create_component(input.$$.fragment);
    			t2 = space();
    			div = element("div");
    			create_component(button0.$$.fragment);
    			t3 = space();
    			create_component(button1.$$.fragment);
    			attr_dev(h3, "class", "svelte-1mn61rz");
    			add_location(h3, file$b, 108, 4, 2900);
    			set_style(div, "display", "flex");
    			set_style(div, "flex-direction", "row");
    			set_style(div, "justify-content", "space-around");
    			add_location(div, file$b, 110, 4, 3103);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(input, target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(button0, div, null);
    			append_dev(div, t3);
    			mount_component(button1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_value && dirty & /*newUser*/ 2) {
    				updating_value = true;
    				input_changes.value = /*newUser*/ ctx[1].email;
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 33554432) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 33554432) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			destroy_component(input, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(108:0) <Modal bind:visible={modal.create} style=\\\"display:flex;flex-direction:column;width:40vw;min-width:280px;border-radius:0.5em;padding:4em\\\">",
    		ctx
    	});

    	return block;
    }

    // (121:8) <Button width="100%" backgroundColor="var(--theme-primary)" style="margin-right:2em;" on:click={handleUpdate}>
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Update User");
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
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(121:8) <Button width=\\\"100%\\\" backgroundColor=\\\"var(--theme-primary)\\\" style=\\\"margin-right:2em;\\\" on:click={handleUpdate}>",
    		ctx
    	});

    	return block;
    }

    // (122:8) <Button width="100%" outline on:click={()=>{ modal.hide() }}>
    function create_default_slot_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Cancel");
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
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(122:8) <Button width=\\\"100%\\\" outline on:click={()=>{ modal.hide() }}>",
    		ctx
    	});

    	return block;
    }

    // (117:0) <Modal bind:visible={modal.update} style="display:flex;flex-direction:column;width:40vw;min-width:280px;border-radius:0.5em;padding:4em">
    function create_default_slot_3(ctx) {
    	let h3;
    	let t1;
    	let input;
    	let updating_value;
    	let t2;
    	let div;
    	let button0;
    	let t3;
    	let button1;
    	let current;

    	function input_value_binding_1(value) {
    		/*input_value_binding_1*/ ctx[14].call(null, value);
    	}

    	let input_props = {
    		placeholder: "Email",
    		backgroundColor: "var(--theme-light-gray)",
    		foregroundColor: "var(--theme-dark-gray)",
    		style: "margin-right:2em;"
    	};

    	if (/*selectedUser*/ ctx[2].email !== void 0) {
    		input_props.value = /*selectedUser*/ ctx[2].email;
    	}

    	input = new Input$1({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding_1));

    	button0 = new Button$1({
    			props: {
    				width: "100%",
    				backgroundColor: "var(--theme-primary)",
    				style: "margin-right:2em;",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*handleUpdate*/ ctx[6]);

    	button1 = new Button$1({
    			props: {
    				width: "100%",
    				outline: true,
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler_4*/ ctx[15]);

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Update User";
    			t1 = space();
    			create_component(input.$$.fragment);
    			t2 = space();
    			div = element("div");
    			create_component(button0.$$.fragment);
    			t3 = space();
    			create_component(button1.$$.fragment);
    			attr_dev(h3, "class", "svelte-1mn61rz");
    			add_location(h3, file$b, 117, 4, 3573);
    			set_style(div, "display", "flex");
    			set_style(div, "flex-direction", "row");
    			set_style(div, "justify-content", "space-around");
    			add_location(div, file$b, 119, 4, 3775);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(input, target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(button0, div, null);
    			append_dev(div, t3);
    			mount_component(button1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_value && dirty & /*selectedUser*/ 4) {
    				updating_value = true;
    				input_changes.value = /*selectedUser*/ ctx[2].email;
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 33554432) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 33554432) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			destroy_component(input, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(117:0) <Modal bind:visible={modal.update} style=\\\"display:flex;flex-direction:column;width:40vw;min-width:280px;border-radius:0.5em;padding:4em\\\">",
    		ctx
    	});

    	return block;
    }

    // (129:8) <Button width="100%" backgroundColor="var(--theme-primary)" style="margin-right:2em;" on:click={handleDelete}>
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Delete User");
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
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(129:8) <Button width=\\\"100%\\\" backgroundColor=\\\"var(--theme-primary)\\\" style=\\\"margin-right:2em;\\\" on:click={handleDelete}>",
    		ctx
    	});

    	return block;
    }

    // (130:8) <Button width="100%" outline on:click={()=>{ modal.hide() }}>
    function create_default_slot_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Cancel");
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
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(130:8) <Button width=\\\"100%\\\" outline on:click={()=>{ modal.hide() }}>",
    		ctx
    	});

    	return block;
    }

    // (126:0) <Modal bind:visible={modal.delete} style="display:flex;flex-direction:column;width:40vw;min-width:280px;border-radius:0.5em;padding:4em">
    function create_default_slot$2(ctx) {
    	let h3;
    	let t1;
    	let div;
    	let button0;
    	let t2;
    	let button1;
    	let current;

    	button0 = new Button$1({
    			props: {
    				width: "100%",
    				backgroundColor: "var(--theme-primary)",
    				style: "margin-right:2em;",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*handleDelete*/ ctx[7]);

    	button1 = new Button$1({
    			props: {
    				width: "100%",
    				outline: true,
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler_5*/ ctx[17]);

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Delete User";
    			t1 = space();
    			div = element("div");
    			create_component(button0.$$.fragment);
    			t2 = space();
    			create_component(button1.$$.fragment);
    			attr_dev(h3, "class", "svelte-1mn61rz");
    			add_location(h3, file$b, 126, 4, 4245);
    			set_style(div, "display", "flex");
    			set_style(div, "flex-direction", "row");
    			set_style(div, "justify-content", "space-around");
    			add_location(div, file$b, 127, 4, 4271);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(button0, div, null);
    			append_dev(div, t2);
    			mount_component(button1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 33554432) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 33554432) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(126:0) <Modal bind:visible={modal.delete} style=\\\"display:flex;flex-direction:column;width:40vw;min-width:280px;border-radius:0.5em;padding:4em\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let t0;
    	let modal0;
    	let updating_visible;
    	let t1;
    	let modal1;
    	let updating_visible_1;
    	let t2;
    	let modal2;
    	let updating_visible_2;
    	let current;
    	let if_block = /*data*/ ctx[0].length && create_if_block$3(ctx);

    	function modal0_visible_binding(value) {
    		/*modal0_visible_binding*/ ctx[13].call(null, value);
    	}

    	let modal0_props = {
    		style: "display:flex;flex-direction:column;width:40vw;min-width:280px;border-radius:0.5em;padding:4em",
    		$$slots: { default: [create_default_slot_6] },
    		$$scope: { ctx }
    	};

    	if (/*modal*/ ctx[3].create !== void 0) {
    		modal0_props.visible = /*modal*/ ctx[3].create;
    	}

    	modal0 = new Modal$1({ props: modal0_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal0, "visible", modal0_visible_binding));

    	function modal1_visible_binding(value) {
    		/*modal1_visible_binding*/ ctx[16].call(null, value);
    	}

    	let modal1_props = {
    		style: "display:flex;flex-direction:column;width:40vw;min-width:280px;border-radius:0.5em;padding:4em",
    		$$slots: { default: [create_default_slot_3] },
    		$$scope: { ctx }
    	};

    	if (/*modal*/ ctx[3].update !== void 0) {
    		modal1_props.visible = /*modal*/ ctx[3].update;
    	}

    	modal1 = new Modal$1({ props: modal1_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal1, "visible", modal1_visible_binding));

    	function modal2_visible_binding(value) {
    		/*modal2_visible_binding*/ ctx[18].call(null, value);
    	}

    	let modal2_props = {
    		style: "display:flex;flex-direction:column;width:40vw;min-width:280px;border-radius:0.5em;padding:4em",
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	};

    	if (/*modal*/ ctx[3].delete !== void 0) {
    		modal2_props.visible = /*modal*/ ctx[3].delete;
    	}

    	modal2 = new Modal$1({ props: modal2_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal2, "visible", modal2_visible_binding));

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			create_component(modal0.$$.fragment);
    			t1 = space();
    			create_component(modal1.$$.fragment);
    			t2 = space();
    			create_component(modal2.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(modal0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(modal1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(modal2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*data*/ ctx[0].length) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*data*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const modal0_changes = {};

    			if (dirty & /*$$scope, modal, newUser*/ 33554442) {
    				modal0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible && dirty & /*modal*/ 8) {
    				updating_visible = true;
    				modal0_changes.visible = /*modal*/ ctx[3].create;
    				add_flush_callback(() => updating_visible = false);
    			}

    			modal0.$set(modal0_changes);
    			const modal1_changes = {};

    			if (dirty & /*$$scope, modal, selectedUser*/ 33554444) {
    				modal1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible_1 && dirty & /*modal*/ 8) {
    				updating_visible_1 = true;
    				modal1_changes.visible = /*modal*/ ctx[3].update;
    				add_flush_callback(() => updating_visible_1 = false);
    			}

    			modal1.$set(modal1_changes);
    			const modal2_changes = {};

    			if (dirty & /*$$scope, modal*/ 33554440) {
    				modal2_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible_2 && dirty & /*modal*/ 8) {
    				updating_visible_2 = true;
    				modal2_changes.visible = /*modal*/ ctx[3].delete;
    				add_flush_callback(() => updating_visible_2 = false);
    			}

    			modal2.$set(modal2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(modal0.$$.fragment, local);
    			transition_in(modal1.$$.fragment, local);
    			transition_in(modal2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(modal0.$$.fragment, local);
    			transition_out(modal1.$$.fragment, local);
    			transition_out(modal2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(modal0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(modal1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(modal2, detaching);
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

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Datatable_partial", slots, []);
    	const { client, session } = getContext("services");
    	let { data = [] } = $$props;
    	let newUser = { "email": "" };
    	let selectedUser;

    	const initialModal = {
    		create: false,
    		update: false,
    		delete: false,
    		hide: () => {
    			$$invalidate(3, modal = { ...initialModal });
    		}
    	};

    	let modal = { ...initialModal };
    	const settings = { valueNames: ["email"] };

    	onMount(async () => {
    		const res = await client.user.findMany();
    		$$invalidate(0, data = [...res]);
    	});

    	const handleCreate = async () => {
    		modal.hide();
    		let res = await client.user.create(newUser);

    		if (res.id) {
    			$$invalidate(0, data = []);
    			res = await client.user.findMany();
    			$$invalidate(0, data = [...res]);
    		}
    	};

    	const handleUpdate = async () => {
    		modal.hide();
    		let id = selectedApp.id;
    		delete selectedApp.id;
    		let res = await client.user.update(id, selectedUser);

    		if (res.id) {
    			$$invalidate(0, data = []);
    			res = await client.user.findMany();
    			$$invalidate(0, data = [...res]);
    		}
    	};

    	const handleDelete = async () => {
    		modal.hide();
    		let res = await client.user.delete(selectedUser.id);

    		if (res.id) {
    			$$invalidate(0, data = []);
    			res = await client.user.findMany();
    			$$invalidate(0, data = [...res]);
    		}
    	};

    	const writable_props = ["data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Datatable_partial> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(3, modal.create = true, modal);
    	};

    	const click_handler_1 = row => {
    		$$invalidate(3, modal.update = true, modal);
    		$$invalidate(2, selectedUser = row);
    	};

    	const click_handler_2 = (i, row) => {
    		$$invalidate(3, modal.delete = true, modal);
    		$$invalidate(3, modal.target = i, modal);
    		$$invalidate(2, selectedUser = row);
    	};

    	function input_value_binding(value) {
    		newUser.email = value;
    		$$invalidate(1, newUser);
    	}

    	const click_handler_3 = () => {
    		modal.hide();
    	};

    	function modal0_visible_binding(value) {
    		modal.create = value;
    		$$invalidate(3, modal);
    	}

    	function input_value_binding_1(value) {
    		selectedUser.email = value;
    		$$invalidate(2, selectedUser);
    	}

    	const click_handler_4 = () => {
    		modal.hide();
    	};

    	function modal1_visible_binding(value) {
    		modal.update = value;
    		$$invalidate(3, modal);
    	}

    	const click_handler_5 = () => {
    		modal.hide();
    	};

    	function modal2_visible_binding(value) {
    		modal.delete = value;
    		$$invalidate(3, modal);
    	}

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		Table: Table$1,
    		Button: Button$1,
    		Modal: Modal$1,
    		Input: Input$1,
    		getContext,
    		onMount,
    		client,
    		session,
    		data,
    		newUser,
    		selectedUser,
    		initialModal,
    		modal,
    		settings,
    		handleCreate,
    		handleUpdate,
    		handleDelete
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("newUser" in $$props) $$invalidate(1, newUser = $$props.newUser);
    		if ("selectedUser" in $$props) $$invalidate(2, selectedUser = $$props.selectedUser);
    		if ("modal" in $$props) $$invalidate(3, modal = $$props.modal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		data,
    		newUser,
    		selectedUser,
    		modal,
    		settings,
    		handleCreate,
    		handleUpdate,
    		handleDelete,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		input_value_binding,
    		click_handler_3,
    		modal0_visible_binding,
    		input_value_binding_1,
    		click_handler_4,
    		modal1_visible_binding,
    		click_handler_5,
    		modal2_visible_binding
    	];
    }

    class Datatable_partial extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Datatable_partial",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get data() {
    		throw new Error("<Datatable_partial>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Datatable_partial>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/app/pages/user/user.page.svelte generated by Svelte v3.32.1 */
    const file$c = "src/app/pages/user/user.page.svelte";

    // (37:1) <section slot="webnav">
    function create_webnav_slot(ctx) {
    	let section;
    	let webnav;
    	let current;
    	webnav = new Webnav$1({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(webnav.$$.fragment);
    			attr_dev(section, "slot", "webnav");
    			attr_dev(section, "class", "svelte-1yk66ci");
    			add_location(section, file$c, 36, 1, 645);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(webnav, section, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(webnav.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(webnav.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(webnav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_webnav_slot.name,
    		type: "slot",
    		source: "(37:1) <section slot=\\\"webnav\\\">",
    		ctx
    	});

    	return block;
    }

    // (41:1) <section slot="mobnav">
    function create_mobnav_slot(ctx) {
    	let section;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			section = element("section");
    			img = element("img");
    			if (img.src !== (img_src_value = "img/logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "app logo");
    			add_location(img, file$c, 41, 2, 729);
    			attr_dev(section, "slot", "mobnav");
    			add_location(section, file$c, 40, 1, 703);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_mobnav_slot.name,
    		type: "slot",
    		source: "(41:1) <section slot=\\\"mobnav\\\">",
    		ctx
    	});

    	return block;
    }

    // (45:1) <section slot="aside">
    function create_aside_slot(ctx) {
    	let section;
    	let aside;
    	let current;
    	aside = new Aside$1({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(aside.$$.fragment);
    			attr_dev(section, "slot", "aside");
    			add_location(section, file$c, 44, 1, 783);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(aside, section, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(aside.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(aside.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(aside);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_aside_slot.name,
    		type: "slot",
    		source: "(45:1) <section slot=\\\"aside\\\">",
    		ctx
    	});

    	return block;
    }

    // (49:1) <section slot="header">
    function create_header_slot(ctx) {
    	let section;

    	const block = {
    		c: function create() {
    			section = element("section");
    			section.textContent = "User";
    			attr_dev(section, "slot", "header");
    			attr_dev(section, "class", "svelte-1yk66ci");
    			add_location(section, file$c, 48, 1, 839);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_header_slot.name,
    		type: "slot",
    		source: "(49:1) <section slot=\\\"header\\\">",
    		ctx
    	});

    	return block;
    }

    // (53:1) <section slot="main" >
    function create_main_slot(ctx) {
    	let section;
    	let switch_instance;
    	let updating_data;
    	let current;

    	function switch_instance_data_binding(value) {
    		/*switch_instance_data_binding*/ ctx[1].call(null, value);
    	}

    	var switch_value = Datatable_partial;

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		if (/*records*/ ctx[0] !== void 0) {
    			switch_instance_props.data = /*records*/ ctx[0];
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		binding_callbacks.push(() => bind(switch_instance, "data", switch_instance_data_binding));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(section, "slot", "main");
    			add_location(section, file$c, 52, 1, 884);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, section, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};

    			if (!updating_data && dirty & /*records*/ 1) {
    				updating_data = true;
    				switch_instance_changes.data = /*records*/ ctx[0];
    				add_flush_callback(() => updating_data = false);
    			}

    			if (switch_value !== (switch_value = Datatable_partial)) {
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
    					binding_callbacks.push(() => bind(switch_instance, "data", switch_instance_data_binding));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, section, null);
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
    			if (detaching) detach_dev(section);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_main_slot.name,
    		type: "slot",
    		source: "(53:1) <section slot=\\\"main\\\" >",
    		ctx
    	});

    	return block;
    }

    // (35:0) <Module>
    function create_default_slot$3(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    			t2 = space();
    			t3 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(35:0) <Module>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let module;
    	let current;

    	module = new Module$1({
    			props: {
    				$$slots: {
    					default: [create_default_slot$3],
    					main: [create_main_slot],
    					header: [create_header_slot],
    					aside: [create_aside_slot],
    					mobnav: [create_mobnav_slot],
    					webnav: [create_webnav_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(module.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(module, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const module_changes = {};

    			if (dirty & /*$$scope, records*/ 17) {
    				module_changes.$$scope = { dirty, ctx };
    			}

    			module.$set(module_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(module.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(module.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(module, detaching);
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

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("User_page", slots, []);
    	const { client, session } = getContext("services");

    	// let firstname = session.getSession().user.name.split(' ')[0] || '🌄'
    	let records = [];

    	// Fetch 
    	onMount(async () => {
    		$$invalidate(0, records = await client.user.findMany());
    		$$invalidate(0, records = [...records]);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<User_page> was created with unknown prop '${key}'`);
    	});

    	function switch_instance_data_binding(value) {
    		records = value;
    		$$invalidate(0, records);
    	}

    	$$self.$capture_state = () => ({
    		formatDate,
    		Module: Module$1,
    		Webnav: Webnav$1,
    		Aside: Aside$1,
    		getContext,
    		onMount,
    		DatatablePartial: Datatable_partial,
    		client,
    		session,
    		records
    	});

    	$$self.$inject_state = $$props => {
    		if ("records" in $$props) $$invalidate(0, records = $$props.records);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [records, switch_instance_data_binding];
    }

    class User_page extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "User_page",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/app/pages/app/datatable.partial.svelte generated by Svelte v3.32.1 */
    const file$d = "src/app/pages/app/datatable.partial.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	child_ctx[28] = i;
    	return child_ctx;
    }

    // (84:4) {#if data.length}
    function create_if_block$4(ctx) {
    	let table;
    	let current;

    	table = new Table$1({
    			props: {
    				options: /*settings*/ ctx[4],
    				$$slots: { default: [create_default_slot_9$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};

    			if (dirty & /*$$scope, data, modal, selectedApp*/ 536870925) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(84:4) {#if data.length}",
    		ctx
    	});

    	return block;
    }

    // (88:4) <Button backgroundColor="var(--theme-secondary)" width="12em" outline on:click={()=>{ modal.create = true;  }}>
    function create_default_slot_12$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("New App");
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
    		id: create_default_slot_12$1.name,
    		type: "slot",
    		source: "(88:4) <Button backgroundColor=\\\"var(--theme-secondary)\\\" width=\\\"12em\\\" outline on:click={()=>{ modal.create = true;  }}>",
    		ctx
    	});

    	return block;
    }

    // (110:28) <Button width="8em" outline on:click={()=>{ modal.update = true; selectedApp = row }}>
    function create_default_slot_11$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Update");
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
    		id: create_default_slot_11$1.name,
    		type: "slot",
    		source: "(110:28) <Button width=\\\"8em\\\" outline on:click={()=>{ modal.update = true; selectedApp = row }}>",
    		ctx
    	});

    	return block;
    }

    // (111:28) <Button width="8em" outline on:click={()=>{ modal.delete = true;  modal.target = i; selectedApp = row }} }}>
    function create_default_slot_10$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Delete");
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
    		id: create_default_slot_10$1.name,
    		type: "slot",
    		source: "(111:28) <Button width=\\\"8em\\\" outline on:click={()=>{ modal.delete = true;  modal.target = i; selectedApp = row }} }}>",
    		ctx
    	});

    	return block;
    }

    // (102:4) {#each data as row, i}
    function create_each_block$2(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*row*/ ctx[26].text + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*row*/ ctx[26].isPublished + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*row*/ ctx[26].detail + "";
    	let t4;
    	let t5;
    	let td3;
    	let button0;
    	let t6;
    	let td4;
    	let button1;
    	let t7;
    	let current;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[9](/*row*/ ctx[26]);
    	}

    	button0 = new Button$1({
    			props: {
    				width: "8em",
    				outline: true,
    				$$slots: { default: [create_default_slot_11$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", click_handler_1);

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[10](/*i*/ ctx[28], /*row*/ ctx[26]);
    	}

    	button1 = new Button$1({
    			props: {
    				width: "8em",
    				outline: true,
    				"}}": true,
    				$$slots: { default: [create_default_slot_10$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", click_handler_2);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			create_component(button0.$$.fragment);
    			t6 = space();
    			td4 = element("td");
    			create_component(button1.$$.fragment);
    			t7 = space();
    			attr_dev(td0, "class", "text");
    			add_location(td0, file$d, 103, 12, 2644);
    			attr_dev(td1, "class", "isPublished");
    			add_location(td1, file$d, 105, 12, 2701);
    			attr_dev(td2, "class", "detail");
    			add_location(td2, file$d, 107, 12, 2772);
    			attr_dev(td3, "width", "8em");
    			add_location(td3, file$d, 109, 12, 2833);
    			attr_dev(td4, "width", "8em");
    			add_location(td4, file$d, 110, 12, 2969);
    			add_location(tr, file$d, 102, 8, 2626);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(td0, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(td1, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(td2, t5);
    			append_dev(tr, td3);
    			mount_component(button0, td3, null);
    			append_dev(tr, t6);
    			append_dev(tr, td4);
    			mount_component(button1, td4, null);
    			append_dev(tr, t7);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*data*/ 1) && t0_value !== (t0_value = /*row*/ ctx[26].text + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*data*/ 1) && t2_value !== (t2_value = /*row*/ ctx[26].isPublished + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*data*/ 1) && t4_value !== (t4_value = /*row*/ ctx[26].detail + "")) set_data_dev(t4, t4_value);
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 536870912) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 536870912) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(102:4) {#each data as row, i}",
    		ctx
    	});

    	return block;
    }

    // (85:0) <Table  options={settings}>
    function create_default_slot_9$1(ctx) {
    	let div;
    	let input;
    	let t0;
    	let button;
    	let t1;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t3;
    	let th1;
    	let t5;
    	let th2;
    	let t7;
    	let th3;
    	let t9;
    	let th4;
    	let t11;
    	let tbody;
    	let current;

    	input = new Input$1({
    			props: {
    				search: true,
    				placeholder: "Search",
    				backgroundColor: "var(--theme-light-gray)",
    				foregroundColor: "var(--theme-dark-gray)",
    				style: "margin-right:2em;"
    			},
    			$$inline: true
    		});

    	button = new Button$1({
    			props: {
    				backgroundColor: "var(--theme-secondary)",
    				width: "12em",
    				outline: true,
    				$$slots: { default: [create_default_slot_12$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[8]);
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(input.$$.fragment);
    			t0 = space();
    			create_component(button.$$.fragment);
    			t1 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Text";
    			t3 = space();
    			th1 = element("th");
    			th1.textContent = "IsPublished";
    			t5 = space();
    			th2 = element("th");
    			th2.textContent = "Detail";
    			t7 = space();
    			th3 = element("th");
    			th3.textContent = "Update";
    			t9 = space();
    			th4 = element("th");
    			th4.textContent = "Delete";
    			t11 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "controls-container svelte-1mn61rz");
    			add_location(div, file$d, 85, 0, 1920);
    			attr_dev(th0, "class", "sort");
    			attr_dev(th0, "data-sort", "text");
    			add_location(th0, file$d, 92, 12, 2298);
    			attr_dev(th1, "class", "sort");
    			attr_dev(th1, "data-sort", "isPublished");
    			add_location(th1, file$d, 93, 12, 2355);
    			attr_dev(th2, "class", "sort");
    			attr_dev(th2, "data-sort", "detail");
    			add_location(th2, file$d, 94, 12, 2426);
    			add_location(th3, file$d, 95, 12, 2487);
    			add_location(th4, file$d, 96, 12, 2516);
    			add_location(tr, file$d, 91, 8, 2280);
    			add_location(thead, file$d, 90, 4, 2263);
    			attr_dev(tbody, "class", "list");
    			add_location(tbody, file$d, 99, 4, 2566);
    			add_location(table, file$d, 89, 0, 2249);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(input, div, null);
    			append_dev(div, t0);
    			mount_component(button, div, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t3);
    			append_dev(tr, th1);
    			append_dev(tr, t5);
    			append_dev(tr, th2);
    			append_dev(tr, t7);
    			append_dev(tr, th3);
    			append_dev(tr, t9);
    			append_dev(tr, th4);
    			append_dev(table, t11);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 536870912) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (dirty & /*modal, selectedApp, data*/ 13) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			transition_in(button.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(input);
    			destroy_component(button);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9$1.name,
    		type: "slot",
    		source: "(85:0) <Table  options={settings}>",
    		ctx
    	});

    	return block;
    }

    // (125:8) <Button width="100%" backgroundColor="var(--theme-primary)" style="margin-right:2em;" on:click={handleCreate}>
    function create_default_slot_8$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Create App");
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
    		id: create_default_slot_8$1.name,
    		type: "slot",
    		source: "(125:8) <Button width=\\\"100%\\\" backgroundColor=\\\"var(--theme-primary)\\\" style=\\\"margin-right:2em;\\\" on:click={handleCreate}>",
    		ctx
    	});

    	return block;
    }

    // (126:8) <Button width="100%" outline on:click={()=>{ modal.hide() }}>
    function create_default_slot_7$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Cancel");
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
    		id: create_default_slot_7$1.name,
    		type: "slot",
    		source: "(126:8) <Button width=\\\"100%\\\" outline on:click={()=>{ modal.hide() }}>",
    		ctx
    	});

    	return block;
    }

    // (119:0) <Modal bind:visible={modal.create} style="display:flex;flex-direction:column;width:40vw;min-width:280px;border-radius:0.5em;padding:4em">
    function create_default_slot_6$1(ctx) {
    	let h3;
    	let t1;
    	let input0;
    	let updating_value;
    	let t2;
    	let input1;
    	let updating_value_1;
    	let t3;
    	let input2;
    	let updating_value_2;
    	let t4;
    	let div;
    	let button0;
    	let t5;
    	let button1;
    	let current;

    	function input0_value_binding(value) {
    		/*input0_value_binding*/ ctx[11].call(null, value);
    	}

    	let input0_props = {
    		placeholder: "Text",
    		backgroundColor: "var(--theme-light-gray)",
    		foregroundColor: "var(--theme-dark-gray)",
    		style: "margin-right:2em;"
    	};

    	if (/*newApp*/ ctx[1].text !== void 0) {
    		input0_props.value = /*newApp*/ ctx[1].text;
    	}

    	input0 = new Input$1({ props: input0_props, $$inline: true });
    	binding_callbacks.push(() => bind(input0, "value", input0_value_binding));

    	function input1_value_binding(value) {
    		/*input1_value_binding*/ ctx[12].call(null, value);
    	}

    	let input1_props = {
    		type: "checkbox",
    		placeholder: "IsPublished",
    		backgroundColor: "var(--theme-light-gray)",
    		foregroundColor: "var(--theme-dark-gray)",
    		style: "margin-right:2em;"
    	};

    	if (/*newApp*/ ctx[1].isPublished !== void 0) {
    		input1_props.value = /*newApp*/ ctx[1].isPublished;
    	}

    	input1 = new Input$1({ props: input1_props, $$inline: true });
    	binding_callbacks.push(() => bind(input1, "value", input1_value_binding));

    	function input2_value_binding(value) {
    		/*input2_value_binding*/ ctx[13].call(null, value);
    	}

    	let input2_props = {
    		placeholder: "Detail",
    		backgroundColor: "var(--theme-light-gray)",
    		foregroundColor: "var(--theme-dark-gray)",
    		style: "margin-right:2em;"
    	};

    	if (/*newApp*/ ctx[1].detail !== void 0) {
    		input2_props.value = /*newApp*/ ctx[1].detail;
    	}

    	input2 = new Input$1({ props: input2_props, $$inline: true });
    	binding_callbacks.push(() => bind(input2, "value", input2_value_binding));

    	button0 = new Button$1({
    			props: {
    				width: "100%",
    				backgroundColor: "var(--theme-primary)",
    				style: "margin-right:2em;",
    				$$slots: { default: [create_default_slot_8$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*handleCreate*/ ctx[5]);

    	button1 = new Button$1({
    			props: {
    				width: "100%",
    				outline: true,
    				$$slots: { default: [create_default_slot_7$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler_3*/ ctx[14]);

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Create a new App";
    			t1 = space();
    			create_component(input0.$$.fragment);
    			t2 = space();
    			create_component(input1.$$.fragment);
    			t3 = space();
    			create_component(input2.$$.fragment);
    			t4 = space();
    			div = element("div");
    			create_component(button0.$$.fragment);
    			t5 = space();
    			create_component(button1.$$.fragment);
    			attr_dev(h3, "class", "svelte-1mn61rz");
    			add_location(h3, file$d, 119, 4, 3333);
    			set_style(div, "display", "flex");
    			set_style(div, "flex-direction", "row");
    			set_style(div, "justify-content", "space-around");
    			add_location(div, file$d, 123, 4, 3902);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(input0, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(input1, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(input2, target, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(button0, div, null);
    			append_dev(div, t5);
    			mount_component(button1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input0_changes = {};

    			if (!updating_value && dirty & /*newApp*/ 2) {
    				updating_value = true;
    				input0_changes.value = /*newApp*/ ctx[1].text;
    				add_flush_callback(() => updating_value = false);
    			}

    			input0.$set(input0_changes);
    			const input1_changes = {};

    			if (!updating_value_1 && dirty & /*newApp*/ 2) {
    				updating_value_1 = true;
    				input1_changes.value = /*newApp*/ ctx[1].isPublished;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			input1.$set(input1_changes);
    			const input2_changes = {};

    			if (!updating_value_2 && dirty & /*newApp*/ 2) {
    				updating_value_2 = true;
    				input2_changes.value = /*newApp*/ ctx[1].detail;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			input2.$set(input2_changes);
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 536870912) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 536870912) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input0.$$.fragment, local);
    			transition_in(input1.$$.fragment, local);
    			transition_in(input2.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input0.$$.fragment, local);
    			transition_out(input1.$$.fragment, local);
    			transition_out(input2.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			destroy_component(input0, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(input1, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(input2, detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$1.name,
    		type: "slot",
    		source: "(119:0) <Modal bind:visible={modal.create} style=\\\"display:flex;flex-direction:column;width:40vw;min-width:280px;border-radius:0.5em;padding:4em\\\">",
    		ctx
    	});

    	return block;
    }

    // (136:8) <Button width="100%" backgroundColor="var(--theme-primary)" style="margin-right:2em;" on:click={handleUpdate}>
    function create_default_slot_5$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Update App");
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
    		id: create_default_slot_5$1.name,
    		type: "slot",
    		source: "(136:8) <Button width=\\\"100%\\\" backgroundColor=\\\"var(--theme-primary)\\\" style=\\\"margin-right:2em;\\\" on:click={handleUpdate}>",
    		ctx
    	});

    	return block;
    }

    // (137:8) <Button width="100%" outline on:click={()=>{ modal.hide() }}>
    function create_default_slot_4$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Cancel");
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
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(137:8) <Button width=\\\"100%\\\" outline on:click={()=>{ modal.hide() }}>",
    		ctx
    	});

    	return block;
    }

    // (130:0) <Modal bind:visible={modal.update} style="display:flex;flex-direction:column;width:40vw;min-width:280px;border-radius:0.5em;padding:4em">
    function create_default_slot_3$1(ctx) {
    	let h3;
    	let t1;
    	let input0;
    	let updating_value;
    	let t2;
    	let input1;
    	let updating_value_1;
    	let t3;
    	let input2;
    	let updating_value_2;
    	let t4;
    	let div;
    	let button0;
    	let t5;
    	let button1;
    	let current;

    	function input0_value_binding_1(value) {
    		/*input0_value_binding_1*/ ctx[16].call(null, value);
    	}

    	let input0_props = {
    		placeholder: "Text",
    		backgroundColor: "var(--theme-light-gray)",
    		foregroundColor: "var(--theme-dark-gray)",
    		style: "margin-right:2em;"
    	};

    	if (/*selectedApp*/ ctx[2].text !== void 0) {
    		input0_props.value = /*selectedApp*/ ctx[2].text;
    	}

    	input0 = new Input$1({ props: input0_props, $$inline: true });
    	binding_callbacks.push(() => bind(input0, "value", input0_value_binding_1));

    	function input1_value_binding_1(value) {
    		/*input1_value_binding_1*/ ctx[17].call(null, value);
    	}

    	let input1_props = {
    		type: "checkbox",
    		placeholder: "IsPublished",
    		backgroundColor: "var(--theme-light-gray)",
    		foregroundColor: "var(--theme-dark-gray)",
    		style: "margin-right:2em;"
    	};

    	if (/*selectedApp*/ ctx[2].isPublished !== void 0) {
    		input1_props.value = /*selectedApp*/ ctx[2].isPublished;
    	}

    	input1 = new Input$1({ props: input1_props, $$inline: true });
    	binding_callbacks.push(() => bind(input1, "value", input1_value_binding_1));

    	function input2_value_binding_1(value) {
    		/*input2_value_binding_1*/ ctx[18].call(null, value);
    	}

    	let input2_props = {
    		placeholder: "Detail",
    		backgroundColor: "var(--theme-light-gray)",
    		foregroundColor: "var(--theme-dark-gray)",
    		style: "margin-right:2em;"
    	};

    	if (/*selectedApp*/ ctx[2].detail !== void 0) {
    		input2_props.value = /*selectedApp*/ ctx[2].detail;
    	}

    	input2 = new Input$1({ props: input2_props, $$inline: true });
    	binding_callbacks.push(() => bind(input2, "value", input2_value_binding_1));

    	button0 = new Button$1({
    			props: {
    				width: "100%",
    				backgroundColor: "var(--theme-primary)",
    				style: "margin-right:2em;",
    				$$slots: { default: [create_default_slot_5$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*handleUpdate*/ ctx[6]);

    	button1 = new Button$1({
    			props: {
    				width: "100%",
    				outline: true,
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler_4*/ ctx[19]);

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Update App";
    			t1 = space();
    			create_component(input0.$$.fragment);
    			t2 = space();
    			create_component(input1.$$.fragment);
    			t3 = space();
    			create_component(input2.$$.fragment);
    			t4 = space();
    			div = element("div");
    			create_component(button0.$$.fragment);
    			t5 = space();
    			create_component(button1.$$.fragment);
    			attr_dev(h3, "class", "svelte-1mn61rz");
    			add_location(h3, file$d, 130, 4, 4371);
    			set_style(div, "display", "flex");
    			set_style(div, "flex-direction", "row");
    			set_style(div, "justify-content", "space-around");
    			add_location(div, file$d, 134, 4, 4949);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(input0, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(input1, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(input2, target, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(button0, div, null);
    			append_dev(div, t5);
    			mount_component(button1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input0_changes = {};

    			if (!updating_value && dirty & /*selectedApp*/ 4) {
    				updating_value = true;
    				input0_changes.value = /*selectedApp*/ ctx[2].text;
    				add_flush_callback(() => updating_value = false);
    			}

    			input0.$set(input0_changes);
    			const input1_changes = {};

    			if (!updating_value_1 && dirty & /*selectedApp*/ 4) {
    				updating_value_1 = true;
    				input1_changes.value = /*selectedApp*/ ctx[2].isPublished;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			input1.$set(input1_changes);
    			const input2_changes = {};

    			if (!updating_value_2 && dirty & /*selectedApp*/ 4) {
    				updating_value_2 = true;
    				input2_changes.value = /*selectedApp*/ ctx[2].detail;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			input2.$set(input2_changes);
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 536870912) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 536870912) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input0.$$.fragment, local);
    			transition_in(input1.$$.fragment, local);
    			transition_in(input2.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input0.$$.fragment, local);
    			transition_out(input1.$$.fragment, local);
    			transition_out(input2.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			destroy_component(input0, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(input1, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(input2, detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(130:0) <Modal bind:visible={modal.update} style=\\\"display:flex;flex-direction:column;width:40vw;min-width:280px;border-radius:0.5em;padding:4em\\\">",
    		ctx
    	});

    	return block;
    }

    // (144:8) <Button width="100%" backgroundColor="var(--theme-primary)" style="margin-right:2em;" on:click={handleDelete}>
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Delete App");
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
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(144:8) <Button width=\\\"100%\\\" backgroundColor=\\\"var(--theme-primary)\\\" style=\\\"margin-right:2em;\\\" on:click={handleDelete}>",
    		ctx
    	});

    	return block;
    }

    // (145:8) <Button width="100%" outline on:click={()=>{ modal.hide() }}>
    function create_default_slot_1$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Cancel");
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
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(145:8) <Button width=\\\"100%\\\" outline on:click={()=>{ modal.hide() }}>",
    		ctx
    	});

    	return block;
    }

    // (141:0) <Modal bind:visible={modal.delete} style="display:flex;flex-direction:column;width:40vw;min-width:280px;border-radius:0.5em;padding:4em">
    function create_default_slot$4(ctx) {
    	let h3;
    	let t1;
    	let div;
    	let button0;
    	let t2;
    	let button1;
    	let current;

    	button0 = new Button$1({
    			props: {
    				width: "100%",
    				backgroundColor: "var(--theme-primary)",
    				style: "margin-right:2em;",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*handleDelete*/ ctx[7]);

    	button1 = new Button$1({
    			props: {
    				width: "100%",
    				outline: true,
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler_5*/ ctx[21]);

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Delete App";
    			t1 = space();
    			div = element("div");
    			create_component(button0.$$.fragment);
    			t2 = space();
    			create_component(button1.$$.fragment);
    			attr_dev(h3, "class", "svelte-1mn61rz");
    			add_location(h3, file$d, 141, 4, 5418);
    			set_style(div, "display", "flex");
    			set_style(div, "flex-direction", "row");
    			set_style(div, "justify-content", "space-around");
    			add_location(div, file$d, 142, 4, 5443);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(button0, div, null);
    			append_dev(div, t2);
    			mount_component(button1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 536870912) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 536870912) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(141:0) <Modal bind:visible={modal.delete} style=\\\"display:flex;flex-direction:column;width:40vw;min-width:280px;border-radius:0.5em;padding:4em\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let t0;
    	let modal0;
    	let updating_visible;
    	let t1;
    	let modal1;
    	let updating_visible_1;
    	let t2;
    	let modal2;
    	let updating_visible_2;
    	let current;
    	let if_block = /*data*/ ctx[0].length && create_if_block$4(ctx);

    	function modal0_visible_binding(value) {
    		/*modal0_visible_binding*/ ctx[15].call(null, value);
    	}

    	let modal0_props = {
    		style: "display:flex;flex-direction:column;width:40vw;min-width:280px;border-radius:0.5em;padding:4em",
    		$$slots: { default: [create_default_slot_6$1] },
    		$$scope: { ctx }
    	};

    	if (/*modal*/ ctx[3].create !== void 0) {
    		modal0_props.visible = /*modal*/ ctx[3].create;
    	}

    	modal0 = new Modal$1({ props: modal0_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal0, "visible", modal0_visible_binding));

    	function modal1_visible_binding(value) {
    		/*modal1_visible_binding*/ ctx[20].call(null, value);
    	}

    	let modal1_props = {
    		style: "display:flex;flex-direction:column;width:40vw;min-width:280px;border-radius:0.5em;padding:4em",
    		$$slots: { default: [create_default_slot_3$1] },
    		$$scope: { ctx }
    	};

    	if (/*modal*/ ctx[3].update !== void 0) {
    		modal1_props.visible = /*modal*/ ctx[3].update;
    	}

    	modal1 = new Modal$1({ props: modal1_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal1, "visible", modal1_visible_binding));

    	function modal2_visible_binding(value) {
    		/*modal2_visible_binding*/ ctx[22].call(null, value);
    	}

    	let modal2_props = {
    		style: "display:flex;flex-direction:column;width:40vw;min-width:280px;border-radius:0.5em;padding:4em",
    		$$slots: { default: [create_default_slot$4] },
    		$$scope: { ctx }
    	};

    	if (/*modal*/ ctx[3].delete !== void 0) {
    		modal2_props.visible = /*modal*/ ctx[3].delete;
    	}

    	modal2 = new Modal$1({ props: modal2_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal2, "visible", modal2_visible_binding));

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			create_component(modal0.$$.fragment);
    			t1 = space();
    			create_component(modal1.$$.fragment);
    			t2 = space();
    			create_component(modal2.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(modal0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(modal1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(modal2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*data*/ ctx[0].length) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*data*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const modal0_changes = {};

    			if (dirty & /*$$scope, modal, newApp*/ 536870922) {
    				modal0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible && dirty & /*modal*/ 8) {
    				updating_visible = true;
    				modal0_changes.visible = /*modal*/ ctx[3].create;
    				add_flush_callback(() => updating_visible = false);
    			}

    			modal0.$set(modal0_changes);
    			const modal1_changes = {};

    			if (dirty & /*$$scope, modal, selectedApp*/ 536870924) {
    				modal1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible_1 && dirty & /*modal*/ 8) {
    				updating_visible_1 = true;
    				modal1_changes.visible = /*modal*/ ctx[3].update;
    				add_flush_callback(() => updating_visible_1 = false);
    			}

    			modal1.$set(modal1_changes);
    			const modal2_changes = {};

    			if (dirty & /*$$scope, modal*/ 536870920) {
    				modal2_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible_2 && dirty & /*modal*/ 8) {
    				updating_visible_2 = true;
    				modal2_changes.visible = /*modal*/ ctx[3].delete;
    				add_flush_callback(() => updating_visible_2 = false);
    			}

    			modal2.$set(modal2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(modal0.$$.fragment, local);
    			transition_in(modal1.$$.fragment, local);
    			transition_in(modal2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(modal0.$$.fragment, local);
    			transition_out(modal1.$$.fragment, local);
    			transition_out(modal2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(modal0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(modal1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(modal2, detaching);
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

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Datatable_partial", slots, []);
    	const { client, session } = getContext("services");
    	let { data = [] } = $$props;

    	let newApp = {
    		"userId": session.getSession().user.id,
    		"text": "",
    		"isPublished": "",
    		"detail": ""
    	};

    	let selectedApp;

    	const initialModal = {
    		create: false,
    		update: false,
    		delete: false,
    		hide: () => {
    			$$invalidate(3, modal = { ...initialModal });
    		}
    	};

    	let modal = { ...initialModal };

    	const settings = {
    		valueNames: ["text", "isPublished", "detail"]
    	};

    	onMount(async () => {
    		const res = await client.app.findMany();
    		$$invalidate(0, data = [...res]);
    	});

    	const handleCreate = async () => {
    		modal.hide();
    		let res = await client.app.create(newApp);

    		if (res.id) {
    			$$invalidate(0, data = []);
    			res = await client.app.findMany();
    			$$invalidate(0, data = [...res]);
    		}
    	};

    	const handleUpdate = async () => {
    		modal.hide();
    		let id = selectedApp.id;
    		delete selectedApp.id;
    		let res = await client.app.update(id, selectedApp);

    		if (res.id) {
    			$$invalidate(0, data = []);
    			res = await client.app.findMany();
    			$$invalidate(0, data = [...res]);
    		}
    	};

    	const handleDelete = async () => {
    		modal.hide();
    		let res = await client.app.delete(selectedApp.id);

    		if (res.id) {
    			$$invalidate(0, data = []);
    			res = await client.app.findMany();
    			$$invalidate(0, data = [...res]);
    		}
    	};

    	const writable_props = ["data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Datatable_partial> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(3, modal.create = true, modal);
    	};

    	const click_handler_1 = row => {
    		$$invalidate(3, modal.update = true, modal);
    		$$invalidate(2, selectedApp = row);
    	};

    	const click_handler_2 = (i, row) => {
    		$$invalidate(3, modal.delete = true, modal);
    		$$invalidate(3, modal.target = i, modal);
    		$$invalidate(2, selectedApp = row);
    	};

    	function input0_value_binding(value) {
    		newApp.text = value;
    		$$invalidate(1, newApp);
    	}

    	function input1_value_binding(value) {
    		newApp.isPublished = value;
    		$$invalidate(1, newApp);
    	}

    	function input2_value_binding(value) {
    		newApp.detail = value;
    		$$invalidate(1, newApp);
    	}

    	const click_handler_3 = () => {
    		modal.hide();
    	};

    	function modal0_visible_binding(value) {
    		modal.create = value;
    		$$invalidate(3, modal);
    	}

    	function input0_value_binding_1(value) {
    		selectedApp.text = value;
    		$$invalidate(2, selectedApp);
    	}

    	function input1_value_binding_1(value) {
    		selectedApp.isPublished = value;
    		$$invalidate(2, selectedApp);
    	}

    	function input2_value_binding_1(value) {
    		selectedApp.detail = value;
    		$$invalidate(2, selectedApp);
    	}

    	const click_handler_4 = () => {
    		modal.hide();
    	};

    	function modal1_visible_binding(value) {
    		modal.update = value;
    		$$invalidate(3, modal);
    	}

    	const click_handler_5 = () => {
    		modal.hide();
    	};

    	function modal2_visible_binding(value) {
    		modal.delete = value;
    		$$invalidate(3, modal);
    	}

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		Table: Table$1,
    		Button: Button$1,
    		Modal: Modal$1,
    		Input: Input$1,
    		getContext,
    		onMount,
    		client,
    		session,
    		data,
    		newApp,
    		selectedApp,
    		initialModal,
    		modal,
    		settings,
    		handleCreate,
    		handleUpdate,
    		handleDelete
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("newApp" in $$props) $$invalidate(1, newApp = $$props.newApp);
    		if ("selectedApp" in $$props) $$invalidate(2, selectedApp = $$props.selectedApp);
    		if ("modal" in $$props) $$invalidate(3, modal = $$props.modal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		data,
    		newApp,
    		selectedApp,
    		modal,
    		settings,
    		handleCreate,
    		handleUpdate,
    		handleDelete,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		input0_value_binding,
    		input1_value_binding,
    		input2_value_binding,
    		click_handler_3,
    		modal0_visible_binding,
    		input0_value_binding_1,
    		input1_value_binding_1,
    		input2_value_binding_1,
    		click_handler_4,
    		modal1_visible_binding,
    		click_handler_5,
    		modal2_visible_binding
    	];
    }

    class Datatable_partial$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Datatable_partial",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get data() {
    		throw new Error("<Datatable_partial>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Datatable_partial>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/app/pages/app/app.page.svelte generated by Svelte v3.32.1 */
    const file$e = "src/app/pages/app/app.page.svelte";

    // (37:1) <section slot="webnav">
    function create_webnav_slot$1(ctx) {
    	let section;
    	let webnav;
    	let current;
    	webnav = new Webnav$1({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(webnav.$$.fragment);
    			attr_dev(section, "slot", "webnav");
    			attr_dev(section, "class", "svelte-1yk66ci");
    			add_location(section, file$e, 36, 1, 644);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(webnav, section, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(webnav.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(webnav.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(webnav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_webnav_slot$1.name,
    		type: "slot",
    		source: "(37:1) <section slot=\\\"webnav\\\">",
    		ctx
    	});

    	return block;
    }

    // (41:1) <section slot="mobnav">
    function create_mobnav_slot$1(ctx) {
    	let section;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			section = element("section");
    			img = element("img");
    			if (img.src !== (img_src_value = "img/logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "app logo");
    			add_location(img, file$e, 41, 2, 728);
    			attr_dev(section, "slot", "mobnav");
    			add_location(section, file$e, 40, 1, 702);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_mobnav_slot$1.name,
    		type: "slot",
    		source: "(41:1) <section slot=\\\"mobnav\\\">",
    		ctx
    	});

    	return block;
    }

    // (45:1) <section slot="aside">
    function create_aside_slot$1(ctx) {
    	let section;
    	let aside;
    	let current;
    	aside = new Aside$1({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(aside.$$.fragment);
    			attr_dev(section, "slot", "aside");
    			add_location(section, file$e, 44, 1, 782);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(aside, section, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(aside.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(aside.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(aside);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_aside_slot$1.name,
    		type: "slot",
    		source: "(45:1) <section slot=\\\"aside\\\">",
    		ctx
    	});

    	return block;
    }

    // (49:1) <section slot="header">
    function create_header_slot$1(ctx) {
    	let section;

    	const block = {
    		c: function create() {
    			section = element("section");
    			section.textContent = "App";
    			attr_dev(section, "slot", "header");
    			attr_dev(section, "class", "svelte-1yk66ci");
    			add_location(section, file$e, 48, 1, 838);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_header_slot$1.name,
    		type: "slot",
    		source: "(49:1) <section slot=\\\"header\\\">",
    		ctx
    	});

    	return block;
    }

    // (53:1) <section slot="main" >
    function create_main_slot$1(ctx) {
    	let section;
    	let switch_instance;
    	let updating_data;
    	let current;

    	function switch_instance_data_binding(value) {
    		/*switch_instance_data_binding*/ ctx[1].call(null, value);
    	}

    	var switch_value = Datatable_partial$1;

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		if (/*records*/ ctx[0] !== void 0) {
    			switch_instance_props.data = /*records*/ ctx[0];
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		binding_callbacks.push(() => bind(switch_instance, "data", switch_instance_data_binding));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(section, "slot", "main");
    			add_location(section, file$e, 52, 1, 882);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, section, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};

    			if (!updating_data && dirty & /*records*/ 1) {
    				updating_data = true;
    				switch_instance_changes.data = /*records*/ ctx[0];
    				add_flush_callback(() => updating_data = false);
    			}

    			if (switch_value !== (switch_value = Datatable_partial$1)) {
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
    					binding_callbacks.push(() => bind(switch_instance, "data", switch_instance_data_binding));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, section, null);
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
    			if (detaching) detach_dev(section);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_main_slot$1.name,
    		type: "slot",
    		source: "(53:1) <section slot=\\\"main\\\" >",
    		ctx
    	});

    	return block;
    }

    // (35:0) <Module>
    function create_default_slot$5(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    			t2 = space();
    			t3 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(35:0) <Module>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let module;
    	let current;

    	module = new Module$1({
    			props: {
    				$$slots: {
    					default: [create_default_slot$5],
    					main: [create_main_slot$1],
    					header: [create_header_slot$1],
    					aside: [create_aside_slot$1],
    					mobnav: [create_mobnav_slot$1],
    					webnav: [create_webnav_slot$1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(module.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(module, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const module_changes = {};

    			if (dirty & /*$$scope, records*/ 17) {
    				module_changes.$$scope = { dirty, ctx };
    			}

    			module.$set(module_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(module.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(module.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(module, detaching);
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

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App_page", slots, []);
    	const { client, session } = getContext("services");

    	// let firstname = session.getSession().user.name.split(' ')[0] || '🌄'
    	let records = [];

    	// Fetch 
    	onMount(async () => {
    		$$invalidate(0, records = await client.app.findMany());
    		$$invalidate(0, records = [...records]);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App_page> was created with unknown prop '${key}'`);
    	});

    	function switch_instance_data_binding(value) {
    		records = value;
    		$$invalidate(0, records);
    	}

    	$$self.$capture_state = () => ({
    		formatDate,
    		Module: Module$1,
    		Webnav: Webnav$1,
    		Aside: Aside$1,
    		getContext,
    		onMount,
    		DatatablePartial: Datatable_partial$1,
    		client,
    		session,
    		records
    	});

    	$$self.$inject_state = $$props => {
    		if ("records" in $$props) $$invalidate(0, records = $$props.records);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [records, switch_instance_data_binding];
    }

    class App_page extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App_page",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    // imports

    // export
    var pageIndex = {
    	Landing : Landing_page,
    	Login : Login_page,
    	User : User_page,
    	App : App_page
    };

    var bind$2 = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    /*global toString:true*/

    // utils is a library of generic helper functions non-specific to axios

    var toString$1 = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray$1(val) {
      return toString$1.call(val) === '[object Array]';
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer$1(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString$1.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return (typeof FormData !== 'undefined') && (val instanceof FormData);
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a plain Object
     *
     * @param {Object} val The value to test
     * @return {boolean} True if value is a plain Object, otherwise false
     */
    function isPlainObject(val) {
      if (toString$1.call(val) !== '[object Object]') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString$1.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString$1.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString$1.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString$1.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.replace(/^\s*/, '').replace(/\s*$/, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray$1(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge$1(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge$1(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge$1({}, val);
        } else if (isArray$1(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend$1(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind$2(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     * @return {string} content value without BOM
     */
    function stripBOM(content) {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    }

    var utils$1 = {
      isArray: isArray$1,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer$1,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge$1,
      extend: extend$1,
      trim: trim,
      stripBOM: stripBOM
    };

    function encode$1(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils$1.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils$1.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils$1.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils$1.forEach(val, function parseValue(v) {
            if (utils$1.isDate(v)) {
              v = v.toISOString();
            } else if (utils$1.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode$1(key) + '=' + encode$1(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils$1.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      /*eslint no-param-reassign:0*/
      utils$1.forEach(fns, function transform(fn) {
        data = fn(data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils$1.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code
        };
      };
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    var cookies = (
      utils$1.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils$1.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils$1.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils$1.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils$1.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils$1.trim(line.substr(0, i)).toLowerCase();
        val = utils$1.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils$1.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils$1.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;

        if (utils$1.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        // Listen for ready state
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }

          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(resolve, reject, response);

          // Clean up request
          request = null;
        };

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils$1.isStandardBrowserEnv()) {
          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils$1.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils$1.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (config.responseType) {
          try {
            request.responseType = config.responseType;
          } catch (e) {
            // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
            // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
            if (config.responseType !== 'json') {
              throw e;
            }
          }
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken) {
          // Handle cancellation
          config.cancelToken.promise.then(function onCanceled(cancel) {
            if (!request) {
              return;
            }

            request.abort();
            reject(cancel);
            // Clean up request
            request = null;
          });
        }

        if (!requestData) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils$1.isUndefined(headers) && utils$1.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    var defaults$2 = {
      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');
        if (utils$1.isFormData(data) ||
          utils$1.isArrayBuffer(data) ||
          utils$1.isBuffer(data) ||
          utils$1.isStream(data) ||
          utils$1.isFile(data) ||
          utils$1.isBlob(data)
        ) {
          return data;
        }
        if (utils$1.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils$1.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils$1.isObject(data)) {
          setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
          return JSON.stringify(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        /*eslint no-param-reassign:0*/
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) { /* Ignore */ }
        }
        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      }
    };

    defaults$2.headers = {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    };

    utils$1.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults$2.headers[method] = {};
    });

    utils$1.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults$2.headers[method] = utils$1.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults$2;

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData(
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils$1.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils$1.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData(
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData(
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      var valueFromConfig2Keys = ['url', 'method', 'data'];
      var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
      var defaultToConfig2Keys = [
        'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
        'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
        'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
        'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
        'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
      ];
      var directMergeKeys = ['validateStatus'];

      function getMergedValue(target, source) {
        if (utils$1.isPlainObject(target) && utils$1.isPlainObject(source)) {
          return utils$1.merge(target, source);
        } else if (utils$1.isPlainObject(source)) {
          return utils$1.merge({}, source);
        } else if (utils$1.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      function mergeDeepProperties(prop) {
        if (!utils$1.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (!utils$1.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      }

      utils$1.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
        if (!utils$1.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        }
      });

      utils$1.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

      utils$1.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
        if (!utils$1.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        } else if (!utils$1.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      utils$1.forEach(directMergeKeys, function merge(prop) {
        if (prop in config2) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      var axiosKeys = valueFromConfig2Keys
        .concat(mergeDeepPropertiesKeys)
        .concat(defaultToConfig2Keys)
        .concat(directMergeKeys);

      var otherKeys = Object
        .keys(config1)
        .concat(Object.keys(config2))
        .filter(function filterAxiosKeys(key) {
          return axiosKeys.indexOf(key) === -1;
        });

      utils$1.forEach(otherKeys, mergeDeepProperties);

      return config;
    };

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      // Hook up interceptors middleware
      var chain = [dispatchRequest, undefined];
      var promise = Promise.resolve(config);

      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });

      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils$1.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: (config || {}).data
        }));
      };
    });

    utils$1.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;
      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    var isAxiosError = function isAxiosError(payload) {
      return (typeof payload === 'object') && (payload.isAxiosError === true);
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind$2(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils$1.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils$1.extend(instance, context);

      return instance;
    }

    // Create the default instance to be exported
    var axios = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios.Axios = Axios_1;

    // Factory for creating new instances
    axios.create = function create(instanceConfig) {
      return createInstance(mergeConfig(axios.defaults, instanceConfig));
    };

    // Expose Cancel & CancelToken
    axios.Cancel = Cancel_1;
    axios.CancelToken = CancelToken_1;
    axios.isCancel = isCancel;

    // Expose all/spread
    axios.all = function all(promises) {
      return Promise.all(promises);
    };
    axios.spread = spread;

    // Expose isAxiosError
    axios.isAxiosError = isAxiosError;

    var axios_1 = axios;

    // Allow use of default import syntax in TypeScript
    var _default = axios;
    axios_1.default = _default;

    var axios$1 = axios_1;

    const client = axios$1.create({
        // baseURL: 'http://localhost:3002/',
        // timeout: 1000
    });

    const apiRequest = async (method, url, request)=>{
        console.log(`http://localhost:3001/${url}`);
        return await client({
            method,
            url : `http://localhost:3001/${url}`,
            data : request
        })
    };

    const get = async(url, request) => apiRequest("get", url, request);
    const post = async(url, request) => apiRequest("post", url, request);
    const put = async(url, request) => apiRequest("put", url, request);
    const deleteRequest = async(url, request) => apiRequest("delete", url, request);

    const API = {
        instance : client,
        get,
        post,
        put,
        delete : deleteRequest
    };

    const signIn = async (data, config)=>{
        return await API.post(`auth/signIn`, data, config)
    };

    const forgotPassword = async (data, config)=>{
        return await API.post(`auth/reset`, data, config)
    };

    const confirmPassword = async (data, config)=>{
        return await API.put(`auth/reset`, data, config)
    };

    const self$1 = async (config)=>{
        return await API.get(`auth/self`, config)
    };

    const createService = async (data, query = {}, config) => {
        return await API.post(`api/user?${lib.stringify(query)}`, data, config)
    };

    const deleteService = async (resource = "undefined", query, config) => {
        
            return await API.delete(`api/user/${resource}?${lib.stringify(query)}`, config)
        
    };

    const updateService = async (resource = "undefined", data, query = {}, config) => {
        return await API.put(`api/user/${resource}?${lib.stringify(query)}`, data, config)
    };

    const findManyService = async (query = {}, config) => {
        return await API.get(`api/user?${lib.stringify(query)}`, config)
    };

    const findOneService = async (resource = "undefined", query, config) => {
        return await API.get(`api/user/${resource}?${lib.stringify(query)}`, config)
    };

    var user = {
        create: createService,
        delete: deleteService,
        update: updateService,
        findMany: findManyService,
        findOne: findOneService
    };

    const createService$1 = async (data, query = {}, config) => {
        return await API.post(`api/app?${lib.stringify(query)}`, data, config)
    };

    const deleteService$1 = async (resource = "undefined", query, config) => {
        
            return await API.delete(`api/app/${resource}?${lib.stringify(query)}`, config)
        
    };

    const updateService$1 = async (resource = "undefined", data, query = {}, config) => {
        return await API.put(`api/app/${resource}?${lib.stringify(query)}`, data, config)
    };

    const findManyService$1 = async (query = {}, config) => {
        return await API.get(`api/app?${lib.stringify(query)}`, config)
    };

    const findOneService$1 = async (resource = "undefined", query, config) => {
        return await API.get(`api/app/${resource}?${lib.stringify(query)}`, config)
    };

    var app = {
        create: createService$1,
        delete: deleteService$1,
        update: updateService$1,
        findMany: findManyService$1,
        findOne: findOneService$1
    };

    var client$1 = {
        instance : API.instance,
        auth : {
            confirmPassword,
            forgotPassword,
            signIn,
            self: self$1
        },
        user,
        app
    };

    const setSessionService = (session)=>{
        localStorage.setItem('session', JSON.stringify(session));
    };

    const getSessionService = ()=>{
        return JSON.parse(localStorage.getItem('session'))
    };

    var session = {
        getSession : getSessionService,
        setSession : setSessionService
    };

    var serviceIndex = {
        client: client$1,
        session
    };

    // imports

    // export
    var app$1 = {
    	components : componentIndex,
    	helpers : helperIndex,
    	interceptors : interceptorIndex,
    	pages : pageIndex,
    	services : serviceIndex
    };
    const pages = pageIndex;

    var authGuard = (detail)=>{
        const hasSession = localStorage.getItem('session') ? true : false ;
        if(hasSession && detail.location == '/login'){
            return false
        }
        if(!hasSession && detail.location == '/login'){
            return true 
        }
        return hasSession
    };

    const routes = {
      // Unguarded routes
      // '/' : modules.PublicModule.Landing, // prod
      '/' : pages.Login,
      '/login' : pages.Login,
      '/user' : wrap({ 
        component : pages.User,
        conditions : [authGuard]
      }),
      '/app' : wrap({ 
        component : pages.App,
        conditions : [authGuard]
      })
      
      // // Guarded routes
      // "/home": wrap({
      //   component: modules.HomeModule.Home,
      //   conditions: [authGuard]
      // })

    };

    /* src/app/App.svelte generated by Svelte v3.32.1 */

    const { console: console_1$3 } = globals;
    const file$f = "src/app/App.svelte";

    function create_fragment$h(ctx) {
    	let link;
    	let t;
    	let router;
    	let current;
    	router = new Router({ props: { routes }, $$inline: true });
    	router.$on("conditionsFailed", /*conditionsFailed*/ ctx[0]);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t = space();
    			create_component(router.$$.fragment);
    			attr_dev(link, "href", "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600;1,700&family=Nunito+Sans:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600;1,700&display=swap");
    			attr_dev(link, "rel", "stylesheet");
    			add_location(link, file$f, 59, 2, 1352);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			insert_dev(target, t, anchor);
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t);
    			destroy_component(router, detaching);
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

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { env } = $$props;

    	// set env
    	setContext("env", env);

    	// set services
    	setContext("services", app$1.services);

    	// set helpers
    	setContext("helpers", app$1.helpers);

    	// config requests
    	const { client } = app$1.services;

    	client.instance.defaults.baseURL = env.apiURL;
    	client.instance.interceptors.response.use(app$1.interceptors.parseResponse);
    	client.instance.interceptors.request.use(app$1.interceptors.authorizeRequest);

    	const validateSession = async () => {
    		console.log("hey");
    		let session = app$1.services.session.getSession();

    		if (!session.user) {
    			const userData = await client.auth.self();
    			console.log(userData);

    			app$1.services.session.setSession({
    				user: userData,
    				id_token: session.id_token
    			});
    		}

    		return true;
    	};

    	validateSession();

    	function conditionsFailed(event) {
    		if (event.detail.location != "/login") {
    			push("/login");
    		} else {
    			push("/home");
    		}
    	}

    	const writable_props = ["env"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("env" in $$props) $$invalidate(1, env = $$props.env);
    	};

    	$$self.$capture_state = () => ({
    		env,
    		app: app$1,
    		setContext,
    		client,
    		validateSession,
    		Router,
    		location: location$1,
    		push,
    		routes,
    		conditionsFailed
    	});

    	$$self.$inject_state = $$props => {
    		if ("env" in $$props) $$invalidate(1, env = $$props.env);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [conditionsFailed, env];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { env: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*env*/ ctx[1] === undefined && !("env" in props)) {
    			console_1$3.warn("<App> was created without expected prop 'env'");
    		}
    	}

    	get env() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set env(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app$2 = new App({
    	target: document.body,
    	props: {
    		env : local
    	}
    });

    return app$2;

}());
//# sourceMappingURL=bundle.js.map

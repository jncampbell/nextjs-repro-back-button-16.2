# Next.js 16.2.x back-button regression repro

Minimal reproduction of a regression where the browser **Back** button skips
the previous route after `router.push` is called inside a `useActionState`
action body, when middleware emits a `Set-Cookie` header.

## Reproduction

```bash
npm install
npm run build
npm start
```

1. Open <http://localhost:3000> in a fresh browser tab.
2. Click the link to `/account`.
3. Click **Submit**. URL becomes `/dob`.
4. Click the browser **Back** button.

### Expected

You return to `/account`.

### Actual

You land on the new-tab page (the entry before `/account`). `/account` has been
clobbered out of history — `replaceState` was used instead of `pushState`.

## Versions

| Version          | Behavior |
| ---------------- | -------- |
| `16.1.7`         | works    |
| `16.2.0`         | broken   |
| `16.2.1`         | broken   |
| `16.2.3`         | broken   |
| `16.2.4`         | broken   |
| `16.3.0-canary.2`| broken (still) |

Reproduces only in production mode (`next start`); `next dev` navigates correctly.

## Minimal trigger

Bisected to three required ingredients (everything else — Arkose-style async,
explicit `startTransition`, server-action cookie writes, random cookie values
— is incidental):

1. **Middleware that calls `response.cookies.set(...)`** on the response.
   Any cookie, any value, any path.
2. **`<form action={formAction}>`** where `formAction` is the dispatcher
   returned by `useActionState`.
3. **`router.push(...)` inside the `useActionState` action body**, after an
   `await` (i.e. while the transition is suspended).

Remove any one of these and the bug disappears.

## Mechanism

This is the same class of regression as
[#90513](https://github.com/vercel/next.js/issues/90513), partially fixed by
[#90533](https://github.com/vercel/next.js/pull/90533). The likely
introducing PR is
[#90400](https://github.com/vercel/next.js/pull/90400) (`16.2.0-canary.60`).

Suspected mechanism: the `Set-Cookie` header from middleware causes Next.js to
treat the navigation response as having a different route-tree key than the
client cached, triggering a server-patch retry. The retry uses `replace`
semantics. Because the original `router.push` transition is still suspended
(the action body is awaiting), `pushState` never ran — so `replaceState`
overwrites the *previous* history entry instead of creating a new one.

## Workaround

See the `workaround` branch. It moves `router.push` out of the action body
into a `useEffect` watching the returned state, so navigation runs after the
transition commits. The bug does not occur on that branch with all other
ingredients identical.

```diff
-  const [, formAction] = useActionState(async (prev, fd) => {
-    const result = await submitAccountAction(prev, fd);
-    if (result?.redirectPath) router.push(result.redirectPath);  // bug
-    return result;
-  }, null);
+  const [state, formAction] = useActionState(submitAccountAction, null);
+  useEffect(() => {
+    if (state?.redirectPath) router.push(state.redirectPath);    // works
+  }, [state, router]);
```

A `setTimeout(() => router.push(path), 0)` from inside the action body also
works — both approaches let the transition commit before navigation begins.

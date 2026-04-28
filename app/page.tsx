import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>Next.js 16.2.x back-button regression repro</h1>
      <ol>
        <li>
          Open <Link href='/account'>/account</Link> in a fresh tab (so the only entry in browser
          history is this page).
        </li>
        <li>Click <strong>Submit</strong>. You will land on <code>/dob</code>.</li>
        <li>Click the browser <strong>Back</strong> button.</li>
        <li>
          <strong>Bug:</strong> you land on the new-tab page (i.e. <code>/account</code> is missing
          from history). <br />
          <strong>Expected:</strong> you land on <code>/account</code>.
        </li>
      </ol>
      <p>
        Reproduces in production mode (<code>next build &amp;&amp; next start</code>) on{' '}
        <code>next@16.2.0</code>, <code>16.2.1</code>, and <code>16.2.3</code>. Works correctly on{' '}
        <code>16.1.7</code>.
      </p>
      <p>
        See <code>workaround</code> branch for the same app with <code>router.push</code> moved
        into a <code>useEffect</code> — the bug does not occur on that branch.
      </p>
    </main>
  );
}

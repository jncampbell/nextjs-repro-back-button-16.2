'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';

import { submitAccountAction, type ActionState } from '../actions';

// Minimal trigger:
//   1. <form action={formAction}> where formAction is from useActionState
//   2. The action body awaits before resolving (suspends the transition)
//   3. `router.push` is called from inside the action body, while the
//      transition is still suspended
// Combined with the middleware that emits a Set-Cookie header on every
// response, this trips the server-patch retry path with `replace`
// semantics, which clobbers the source route's history entry.
export default function AccountForm() {
  const router = useRouter();

  const [, formAction, isPending] = useActionState<ActionState, FormData>(async (prev, formData) => {
    const result = await submitAccountAction(prev, formData);
    if (result?.redirectPath) {
      router.push(result.redirectPath);
    }
    return result;
  }, null);

  return (
    <form action={formAction}>
      <input type='hidden' name='dummy' value='1' />
      <button type='submit' disabled={isPending}>
        {isPending ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  );
}

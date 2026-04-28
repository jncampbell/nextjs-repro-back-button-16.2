'use server';

export type ActionState = { redirectPath?: string } | null;

export async function submitAccountAction(_prev: ActionState, _formData: FormData): Promise<ActionState> {
  // Any await inside the action body suspends the transition.
  await new Promise((r) => setTimeout(r, 50));
  return { redirectPath: '/dob' };
}

export type PublicFormSubmission = {
  data: Record<string, unknown>;
  consent?: Record<string, boolean>;
  metadata?: Record<string, unknown>;
  honeypot?: string;
  idempotencyKey: string;
};

export class PublicFormConfigurationError extends Error {}

export function createFormAttemptKey(kind: string): string {
  return `nestcraft-${kind}-${crypto.randomUUID()}`;
}

function segment(value: string | undefined, label: string): string {
  const normalized = value?.trim();
  if (!normalized) {
    throw new PublicFormConfigurationError(
      `${label} is not configured. Select the form in Kalp Admin and publish its binding before accepting submissions.`,
    );
  }
  return encodeURIComponent(normalized);
}

export async function submitPublicForm(input: {
  tenantSlug?: string;
  formId?: string;
  submission: PublicFormSubmission;
}) {
  const tenantSlug = segment(input.tenantSlug, "Business tenant slug");
  const formId = segment(input.formId, "Public form ID");
  const response = await fetch(
    `/api/forms/public/${tenantSlug}/${formId}/submissions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input.submission),
    },
  );
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.success === false) {
    throw new Error(
      body?.detail || body?.message || "The form could not be submitted.",
    );
  }
  return body?.data ?? body;
}

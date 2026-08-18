export type FieldDraftInput = {
  pageSlug: string;
  pageId?: string | null;
  sectionId: string;
  fieldPath: string;
  value: string;
  expectedPageUpdatedAt?: string | null;
};

export type MutationAdapter<TInput, TResult = unknown> = {
  save(input: TInput): Promise<TResult>;
};

export type SiteStudioCapability = "content" | "media" | "catalog" | "pricing";

export type CapabilityDeclaration = {
  enabled: boolean;
  endpoint?: string;
  mode?: "read" | "draft" | "review" | "publish";
};

export type FieldBinding = {
  sectionId: string;
  fieldPath: string;
  valueType: "text" | "rich-text" | "media-ref" | "money" | "catalog-ref";
};

export type SiteStudioManifest = {
  schemaVersion: "kalp.site-studio.v1";
  siteId: string;
  capabilities: Partial<Record<SiteStudioCapability, CapabilityDeclaration>>;
  fields?: Record<string, FieldBinding>;
};

export function defineSiteStudioManifest(manifest: SiteStudioManifest): SiteStudioManifest {
  if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(manifest.siteId)) {
    throw new KalpEditorError("siteId must be a lowercase, filesystem-safe identifier");
  }
  if (!manifest.capabilities.content?.enabled) {
    throw new KalpEditorError("The content capability must be explicitly enabled");
  }
  return Object.freeze(manifest);
}

export type FieldDraftResult = {
  success: boolean;
  data?: {
    draftId?: string;
    revision?: number;
    status?: string;
    publicationAllowed?: boolean;
  };
};

export class KalpEditorError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "KalpEditorError";
  }
}

export function createFieldDraftAdapter(options: {
  endpoint?: string;
  fetch?: typeof globalThis.fetch;
} = {}): MutationAdapter<FieldDraftInput, FieldDraftResult> {
  const endpoint = options.endpoint ?? "/api/publishing/page-drafts/field-changes";
  const request = options.fetch ?? globalThis.fetch;

  return {
    async save(input) {
      const response = await request(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(input),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const detail = payload?.detail || payload?.message || payload?.error;
        throw new KalpEditorError(
          typeof detail === "string" ? detail : "Draft save was rejected",
          response.status,
        );
      }
      return payload as FieldDraftResult;
    },
  };
}

export const fieldDraftAdapter = createFieldDraftAdapter();

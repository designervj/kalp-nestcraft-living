# Kalp Developer Toolkit — Site Studio

Site Studio is a small, site- and industry-agnostic integration toolkit for
saving inline Page edits from any Kalp-connected website to Kalp Business Core
as reviewable field drafts. It is reusable across compatible sites and contains
no tenant, vertical, catalog, or pricing defaults.

## Install in a Kalp-connected site

Copy this directory to `packages/kalp-site-studio-toolkit`, import
`fieldDraftAdapter` from `@kalp/site-studio-toolkit` (or the local source path),
and call `fieldDraftAdapter.save()` with `pageSlug`, `sectionId`, `fieldPath`,
and `value`. The site must proxy
`/api/publishing/page-drafts/field-changes` to Business Core while forwarding
the authenticated cookie/authorization and tenant scope.

Use `createFieldDraftAdapter({ endpoint })` when a host exposes the proxy at a
different same-origin path. The generic `MutationAdapter` is the extension
point for later pricing or catalog draft adapters; those domains must use their
own verified backend contracts rather than Page field drafts.

The host site owns optimistic UI and rollback. A rejected save throws
`KalpEditorError` with the HTTP status and a safe backend message when present.
Site Studio does not publish or mutate the public Page.

Host-specific integration notes belong under `examples/<site>` and are not
part of the public toolkit contract.

## What is included

- A typed, tested content field-draft adapter with injectable transport.
- A neutral `SiteStudioManifest` for declaring a site's capabilities and field
  bindings without importing that site's data or schema.
- Optional capability declarations for `media`, `catalog`, and `pricing`.
  Declaring them does not implement them; each requires its own verified adapter.
- Typed failures for authentication, authorization, validation, and transport
  responses.
- A `patterns/` folder for reviewed, versioned, tenant-safe setup patterns and
  synthetic test evidence. Patterns are portable references, not automatic
  learning or model training.

## Reliable today

Authorized operators can save text or rich-text field changes as tenant-scoped,
revisioned, non-publishing Business Core drafts. The host can optimistically
render the value and restore its prior state if the request fails.

Site Studio does not yet apply, publish, roll back, or display draft history.
It does not upload media or mutate pricing/catalog records. Those capabilities
must remain disabled until a site supplies and verifies the corresponding
Business Core adapter; a manifest declaration alone is not evidence that they
work.

## Adapt a new commerce site

1. Create a neutral manifest with a unique `siteId`, enable `content`, and map
   UI field keys to Page `sectionId`/`fieldPath` bindings.
2. Install the same-origin authenticated Business Core proxy and verify 201,
   401, and 403 responses for the site's tenant.
3. Wire inline components to the content field-draft adapter and show pending,
   success, and failure states.
4. Add media, catalog, or pricing only as separate typed adapters backed by
   their domain contracts and validation. Never encode products or money as
   Page text drafts.
5. Verify draft persistence and tenant isolation before enabling Edit Mode;
   keep Publish unavailable until the review and permission flow exists.

## Plain-language glossary

| Name | Meaning |
|---|---|
| Setup | Connect a site, declare capabilities, and map its fields. |
| Edit | Change a mapped field in the page context. |
| Save draft | Store a reviewable change without changing the public page. |
| Preview | View proposed changes before publication. Not implemented yet. |
| Publish | Make an approved version public. Not implemented by this toolkit yet. |
| History | View and restore earlier versions. Not implemented yet. |
| Patterns | Reviewed, reusable setup knowledge and synthetic test evidence. |

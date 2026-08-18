# Site Studio Patterns

Patterns are explicit, reviewable bundles of reusable setup knowledge and test
evidence. They are documentation and fixtures, not model training, runtime
memory, telemetry ingestion, or self-modifying code. A person or approved
workflow must create, review, version, and adopt every pattern.

## Versioned layout

```text
patterns/
  <neutral-pattern-id>/
    <semver>/
      manifest.json
      mappings/
      adapters/
      fixtures/
      results/
      MIGRATION.md
      OBSERVATIONS.md
```

`manifest.json` is required and must validate against `pattern.schema.json`.
Other directories are optional. Adapter files are
reference patterns until independently integrated and tested by the receiving
site.

## Governance and retention

- Include only neutral schemas, mappings, redacted fixtures, validation
  results, migration notes, and evidence-labeled observations.
- Never include credentials, tokens, cookies, database names, personal data,
  unpublished customer content, order/customer records, or proprietary media.
- Use synthetic fixtures. Record provenance and distinguish `confirmed`,
  `partial`, `broken`, and `unverified` observations.
- Pin semantic versions and checksums. Adoption never follows `latest`
  implicitly and never overwrites a site's manifest or adapter.
- Review tenant safety, license/provenance, and compatibility before promotion.
- Retain superseded packs only while needed for migration/rollback evidence;
  mark them deprecated and record a removal date. Delete sensitive material
  immediately rather than preserving it for history.
- Pattern publication and removal are deliberate repository/release actions.
  The toolkit does not scrape sites, generate patterns in the background, or send pattern
  content to a model.

# NestCraft adaptation record

- Repository: `work/sites/kalp-nestcraft-living`
- GitHub: `https://github.com/hideepakrai/kalp-nestcraft-living`
- Current repository checkpoint: `f6c94749ae39328ee59d9368cb24564118aba64a`
- Historical calibration source commit: `63a0556dd76fa09d7bfb296e7d9d335cbc572d1e`
- Analyzer: `1.0.3`; ruleset: `ecommerce@1.1.0`
- Candidate result: `67/100`, `BLOCKED`, repeatable, overlay valid
- Report checksum: `sha256:ac7edbc6f15c78963685dc610a110e08d8bf2419ee624046d2946befed6b3096`
- Legacy repository: `https://github.com/hideepakrai/nestcraft-live`
- Repository policy: fresh local Git history in the private canonical remote;
  runtime deployment remains separately approved
- Integration mode: Business Core data foundation connected locally through a
  same-origin server adapter; production activation remains deferred
- Design policy: preserve recognizable visual language and useful interactions,
  while allowing component and layout redesign

## Current adaptation state

SiteBridge declarations exist. Kalp Adapt has analyzed and mapped the site.
The first bounded transformation is now active in this repository: the
same-origin commerce proxy resolves the canonical Business Core `/commerce`
paths and uses server-configured database authority.

Studio compatibility is now a required SiteBridge output. The machine-readable
handoff is stored in `.kalp/authored/studio-adaptation.json`. It records the
canonical published page selector, the exact fourteen-section homepage order,
renderer selectors, editable fields and data-authority boundaries. Its status
is deliberately `PREPARED_NOT_CONNECTED`: the website has described what
Studio must preserve, but no Admin, Business Core or KCP runtime change is
claimed by this repository.

Kalp Studio must preview the storefront-owned renderer. A generic Studio
template is not valid parity evidence and must not replace NestCraft's page
structure, typography, spacing, imagery, motion or responsive behavior.

## Business data authority

- Business Core tenant: `nestcraft`
- Runtime MongoDB database: `kp_nestcraft`
- Catalog state verified 2026-08-01: 26 products and 96 variants
- Local inspection route: `http://localhost:5182/shop`
- Production deployment pointer: preserved; this candidate is not activated
- Secrets: externally supplied at runtime and never stored in this repository

## Core repository boundary

Keep the Next.js application, public design assets, package-lock authority,
tests, `.env.example`, and `.kalp` declarations/evidence. Remove generated
build output, dependency copies, scratch database utilities, stale compiler
logs, unrelated dog-diaper/pivot material, surplus website exports and generic
prompt/reference packs that do not execute as part of NestCraft.

The redesign may now build on the verified catalog boundary while preserving
the recognizable NestCraft visual language. Pricing, cart, checkout and order
authority still require their separately governed Business Core checkpoints.

## Next bounded work

1. Execute the separate Studio parity workstream using the authored Studio
   adaptation handoff; resolve duplicate page identity before enabling edits.
2. Replace the stale provider-contract test path with a repository-owned
   contract snapshot or explicitly configured provider reference.
3. Regenerate cart and checkout evidence with provenance matching the current
   repository commit and checksum.
4. Add executed accessibility evidence.
5. Resolve the missing privacy route and independent lint evidence.
6. Rerun twice under the pinned Node 22 execution policy before considering a
   candidate baseline.

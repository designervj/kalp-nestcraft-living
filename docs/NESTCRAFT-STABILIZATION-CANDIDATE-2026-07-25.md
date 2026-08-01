# NestCraft stabilization candidate

Date: 2026-07-25
Branch: `fix/nestcraft-stabilization`
Recorded HEAD: `0e598e07ca35ec83b581787cf0e74334ccf79e88`
Outcome: `CANDIDATE_BLOCKED`

## Scope

This checkpoint advances authentication-independent stabilization work. It does
not bypass or replace authentication, workload identity, credential rotation,
provider authorization or tenant enforcement.

## Verification

The accumulated stabilization tree was verified with Node `22.23.1` and npm
`11.11.1`, with application credentials absent:

- clean npm installation: passed;
- dependency tree: Next.js `15.5.21`, React `19.2.6`, React DOM `19.2.6`;
- typecheck: passed;
- tests: 12 files and 75 tests passed;
- secret scan: passed with zero current-tree findings;
- production build: passed;
- `git diff --check`: passed.

No MongoDB, Business Core or other application service was contacted by the
test suite. The test network guard remained active.

## Additional stabilization

- Corrected a single-language middleware loop in which `/` rewrote to `/en/`
  and `/en` redirected to `/`.
- Added deterministic middleware tests for the public root, clean public paths,
  explicit locale redirects and internal localized rewrites.
- Added and validated the five authored SiteBridge declarations under
  `.kalp/authored/`.
- Recorded current integration reality as `standalone`; no governed
  compatibility or publication authority is claimed.
- Added strict executed cart and checkout integrity evidence. The evidence
  deliberately records confirmed failures instead of converting
  characterization tests into false passes.

## Kalp Adapt candidate

Analyzer: `1.0.2`
Ruleset: `ecommerce@1.1.0`
Ruleset checksum:
`sha256:f749a45c2792ab0358516f56788118f679ca030445a9332e9b371c6f38b3764b`
Target source checksum:
`sha256:dacdd673ab8857b35f9f5e3e0cf745739b2ccad02efc32273589f67b0fdd1dfe`
Canonical report checksum:
`sha256:2140b30afe9ab61c22e9d1f43c86041f00e251d7275e942c7b660293f3d450f6`
Score: `67/100`
Decision: `BLOCKED`

Two executions produced the same canonical checksum while their execution
envelopes differed.

This is a candidate report against a dirty working tree. It is not an accepted
baseline and does not replace the historical `35/100` or calibrated `25/100`
artifacts.

## Remaining blockers

1. `EA-ECOM-003`: confirmed cart-integrity failures.
2. `EA-ECOM-004`: confirmed checkout-integrity failures.
3. `EA-PRIV-001`: canonical privacy-policy route is absent.
4. `EA-A11Y-001`: runtime accessibility evidence is absent.
5. Independent lint coverage is absent, although this is not a hard gate.

The commerce failures require the approved Business Core provider and adapter;
they must not be repaired by trusting client prices, weakening tenant
authority, or bypassing authentication.

## Next safe sequence

1. Review and preserve the accumulated changes as bounded local commits.
2. Obtain owner-approved privacy-policy content before creating its canonical
   route.
3. Establish a credential-free fixture boundary for visual and accessibility
   testing without weakening fail-closed runtime configuration.
4. Add the responsive design-preservation harness and accessibility evidence.
5. Continue Business Core provider work only when its identity and safe-data
   prerequisites are authorized.
6. Re-run Adapt on a clean committed revision before considering a baseline.

No commit, push, deployment, baseline replacement or external authorization
was performed by this checkpoint.

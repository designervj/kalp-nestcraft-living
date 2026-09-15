# Setup launcher

The distribution ZIP places `Setup.cmd`, `Site Launcher.cmd`, and
`SiteLauncher.ps1` at its root. Extract the complete ZIP into a target site
root and double-click either command wrapper. It runs
in the foreground, keeps that terminal open, installs dependencies with the
detected package manager, and starts the site's development script. Or run:

```powershell
.\SiteLauncher.ps1 -Mode Start -ApiProfile Local -NonInteractive -SiteId example-site
```

Setup detects pnpm, Yarn, Bun, or npm from the site's lockfile. Setup supports
Next.js, React/Vite, Remix, and Astro projects. It copies the
bundled toolkit to `packages/kalp-site-studio-toolkit`, creates neutral files
under `.kalp/`, checks `<KalpServiceUrl>/health/live` with `/health` as a
compatibility fallback, and prints the root, service
URL, local URL, next command, stop instruction, and re-run command. It never
asks for, reads, or prints credentials. Existing differing toolkit files stop the run unless an
operator explicitly supplies `-Force`; matching reruns are no-ops.

Modes are `Configure` (do not start), `Start` (install and run the development
script), and `Build` (run the site's real build script, then start if it passed).
Setup never labels a failed or unavailable build as production-ready. Exit code
`10` in Configure mode means local setup completed but the service check still
needs attention. Other non-zero codes explain the blocking error. `-SkipInstall`
exists for controlled test harnesses; ordinary users should not need it.

`-ApiProfile Local` uses an explicitly supplied URL or defaults to
`http://127.0.0.1:8000`. `-ApiProfile Live` requires an explicit HTTPS/HTTP
service URL. Profiles never contain or select credentials.

## Launcher responsibilities

The **Site Launcher** configures and runs one developer-owned website, selects
its Local or Live Kalp API URL, verifies that API's health, and keeps the site
process/logs in the foreground. The separate **Kalp OS Launcher** owns the full
platform stack and its services. It is not included, invoked, or reimplemented
by this toolkit.

## Doctor and bundle checks

Run `Doctor.ps1` for read-only setup and service diagnostics. Add
`-JsonReport .kalp/site-studio-doctor.json` for a machine-readable report.
Doctor separates installed/configured checks from API readiness and does not
start the site. It detects the package manager from lockfiles/configuration,
verifies the real executable (using Corepack for pnpm/Yarn when needed), checks
the install syntax without installing, and probes package-store writability.
If a shared pnpm store is unavailable it prints one verified command using a
project-specific temporary store. Project, environment, and service findings
are reported separately; Doctor never presents an unverified install command.
Site Launcher verifies every bundled package file against the
root `CHECKSUMS.sha256` before copying it. `PROVENANCE.json` identifies the
product, version, source revision, and build time without containing secrets.

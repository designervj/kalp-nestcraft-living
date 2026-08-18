import { afterEach, describe, expect, it } from "vitest";
import { chmodSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";

const doctor = resolve("packages/kalp-site-studio-toolkit/setup/Doctor.ps1");
const powershell = process.platform === "win32"
  ? join(process.env.SystemRoot ?? "C:\\Windows", "System32", "WindowsPowerShell", "v1.0", "powershell.exe")
  : "/usr/bin/pwsh";
const probe = spawnSync(powershell, ["-NoProfile", "-Command", "$PSVersionTable.PSVersion.ToString()"], { encoding: "utf8" });
const describePowerShell = probe.status === 0 ? describe : describe.skip;
const roots: string[] = [];

function fixture(name: string) {
  const root = join(tmpdir(), `kalp-doctor-${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  roots.push(root);
  mkdirSync(root, { recursive: true });
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "fixture", private: true }));
  writeFileSync(join(root, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");
  return root;
}

function fakeCorepack(bin: string, store: string) {
  mkdirSync(bin, { recursive: true });
  if (process.platform === "win32") {
    writeFileSync(join(bin, "corepack.cmd"), `@echo off\r\nif "%2"=="--version" (echo 9.15.0& exit /b 0)\r\nif "%2"=="install" if "%3"=="--help" (echo Usage: pnpm install --frozen-lockfile& exit /b 0)\r\nif "%2"=="store" if "%3"=="path" (echo ${store}& exit /b 0)\r\nexit /b 2\r\n`);
  } else {
    const shim = join(bin, "corepack");
    writeFileSync(shim, `#!/bin/sh\n[ "$2" = "--version" ] && { echo 9.15.0; exit 0; }\n[ "$2" = "install" ] && [ "$3" = "--help" ] && { echo 'Usage: pnpm install --frozen-lockfile'; exit 0; }\n[ "$2" = "store" ] && [ "$3" = "path" ] && { echo '${store}'; exit 0; }\nexit 2\n`);
    chmodSync(shim, 0o755);
  }
}

function runDoctor(root: string, path: string) {
  const report = join(root, "doctor.json");
  const result = spawnSync(powershell, ["-NoLogo", "-NoProfile", "-File", doctor, "-SiteRoot", root, "-JsonReport", report], {
    encoding: "utf8",
    env: { ...process.env, PATH: path, Path: path, KALP_SERVICE_URL: "" },
  });
  return { result, report: JSON.parse(readFileSync(report, "utf8").replace(/^\uFEFF/, "")) };
}

afterEach(() => { while (roots.length) rmSync(roots.pop()!, { recursive: true, force: true }); });

describePowerShell("Site Studio Doctor package-manager preflight", () => {
  it("uses Corepack when pnpm is absent from PATH and verifies the real invocation", () => {
    const root = fixture("corepack");
    const bin = join(root, "bin");
    const store = join(root, "writable-store");
    mkdirSync(store);
    fakeCorepack(bin, store);

    const { report } = runDoctor(root, bin);
    expect(report.project.packageManager).toBe("pnpm");
    expect(report.environment.invocation).toBe("corepack");
    expect(report.environment.versionAvailable).toBe(true);
    expect(report.environment.installSyntaxValid).toBe(true);
    expect(report.recommendation.verifiedInstallCommand).toContain("corepack");
    expect(report.recommendation.verifiedInstallCommand).toContain("pnpm install --frozen-lockfile");
  });

  it("recommends a project-specific temporary pnpm store when the shared store is not writable", () => {
    const root = fixture("store");
    const bin = join(root, "bin");
    const blockedStore = join(root, "store-is-a-file");
    writeFileSync(blockedStore, "not a directory");
    fakeCorepack(bin, blockedStore);

    const { report } = runDoctor(root, bin);
    expect(report.environment.storeWritable).toBe(false);
    expect(report.environment.recommendedStorePath).toContain("kalp-pnpm-store-");
    expect(report.recommendation.verifiedInstallCommand).toContain("--store-dir");
    expect(report.recommendation.verifiedInstallCommand).toContain(report.environment.recommendedStorePath);
  });
});

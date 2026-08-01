import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const supportedExtensions = new Set([
  "",
  ".cjs",
  ".env",
  ".example",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);

const excludedNames = new Set([
  "package-lock.json",
  "pnpm-lock.yaml",
  "skills-lock.json",
  "tsconfig.tsbuildinfo",
]);

const patterns = [
  {
    category: "CREDENTIAL_BEARING_MONGODB_URI",
    expression:
      /mongodb(?:\+srv)?:\/\/[^\s"'`/:]+:[^\s"'`/@]+@[^\s"'`]+/i,
  },
  {
    category: "SECRET_ENV_FALLBACK_LITERAL",
    expression:
      /process\.env\.(?:[A-Z0-9_]*_)?(?:SECRET|TOKEN|PASSWORD|API_KEY)\s*\|\|\s*["'`][^"'`]+["'`]/,
  },
  {
    category: "SECRET_ASSIGNMENT_LITERAL",
    expression:
      /\b(?:[A-Z0-9_]*_)?(?:SECRET|PASSWORD|API_KEY|ACCESS_TOKEN)\s*(?:=|:)\s*["'`][^"'`\s]{6,}["'`]/,
  },
  {
    category: "SECRET_ENV_ASSIGNMENT_VALUE",
    expression:
      /^\s*(?:[A-Z0-9_]*_)?(?:SECRET|PASSWORD|API_KEY|ACCESS_TOKEN)\s*=\s*\S+/,
  },
  {
    category: "JWT_LIKE_LITERAL",
    expression:
      /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/,
  },
  {
    category: "PRIVATE_KEY_LITERAL",
    expression: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  },
];

function listCandidateFiles() {
  const output = execFileSync(
    "git",
    ["ls-files", "-co", "--exclude-standard", "-z"],
    { encoding: "utf8" },
  );

  return [...new Set(output.split("\0").filter(Boolean))]
    .filter((file) => !file.startsWith("node_modules/"))
    .filter((file) => !file.startsWith(".next/"))
    .filter((file) => !excludedNames.has(path.basename(file)))
    .filter((file) => supportedExtensions.has(path.extname(file)))
    .filter((file) => fs.existsSync(file) && fs.statSync(file).isFile())
    .sort();
}

const findings = [];

for (const file of listCandidateFiles()) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const pattern of patterns) {
      if (pattern.expression.test(line)) {
        findings.push({
          category: pattern.category,
          file,
          line: index + 1,
        });
      }
    }
  });
}

if (findings.length === 0) {
  console.log("SECRET_SCAN_RESULT=PASS findings=0");
  process.exit(0);
}

console.error(`SECRET_SCAN_RESULT=FAIL findings=${findings.length}`);
for (const finding of findings) {
  console.error(
    `${finding.category}\t${finding.file}:${finding.line}\tVALUE_REDACTED`,
  );
}
process.exit(1);

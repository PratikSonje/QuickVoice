import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import { constants } from "node:fs";
import { test } from "node:test";

async function text(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

async function isExecutable(path) {
  const file = new URL(`../${path}`, import.meta.url);
  await access(file, constants.X_OK);
  const info = await stat(file);
  return info.isFile();
}

test("Taskfile exposes one-command dev orchestration", async () => {
  const taskfile = await text("Taskfile.yml");

  for (const taskName of [
    "doctor:",
    "env:dev:",
    "deps:node:",
    "deps:python:",
    "docker:up:",
    "db:migrate:",
    "up:dev:",
    "dev:",
  ]) {
    assert.match(taskfile, new RegExp(`^\\s{2}${taskName}`, "m"));
  }

  assert.match(taskfile, /docker-compose\.dev\.yml/);
  assert.match(taskfile, /scripts\/dev-node-deps\.sh/);
  assert.match(taskfile, /scripts\/dev-up\.sh/);
  assert.match(taskfile, /DOTENV_CONFIG_PATH/);
});

test("Docker Compose provides local development dependencies", async () => {
  const compose = await text("docker-compose.dev.yml");

  assert.match(compose, /^\s{2}postgres:/m);
  assert.match(compose, /postgres:16/);
  assert.match(compose, /5432:5432/);
  assert.match(compose, /healthcheck:/);
  assert.match(compose, /quickvoice-dev/);
});

test("development env templates exist for every runnable service", async () => {
  const templates = [
    ".env.dev.example",
    "apps/server/.env.dev.example",
    "apps/console/.env.dev.example",
    "apps/web/.env.dev.example",
    "apps/ai/.env.dev.example",
  ];

  for (const path of templates) {
    const body = await text(path);
    assert.ok(body.length > 0, `${path} should not be empty`);
    assert.doesNotMatch(body, /sk_live_|whsec_live_|AKIA[0-9A-Z]{16}/);
    if (path === "apps/server/.env.dev.example") {
      assert.match(body, /BETTER_AUTH_URL=http:\/\/localhost:5000/);
      assert.match(body, /TWILIO_ACCOUNT_SID=AC[0-9a-f]{32}/);
    }
  }
});

test("helper scripts are executable and wired for local dev", async () => {
  for (const path of [
    "scripts/dev-doctor.sh",
    "scripts/dev-env.sh",
    "scripts/dev-node-deps.sh",
    "scripts/dev-up.sh",
  ]) {
    assert.equal(await isExecutable(path), true, `${path} should be executable`);
  }

  const up = await text("scripts/dev-up.sh");
  assert.match(up, /pnpm dev/);
  assert.match(up, /CONSOLE_PORT/);
  assert.match(up, /WEB_PORT/);
  assert.doesNotMatch(up, /pnpm dev -- -p/);
  assert.match(up, /AI_API_ENABLED/);
});

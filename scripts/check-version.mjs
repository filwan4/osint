import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

const [cargo, packageJson, tauriConfig] = await Promise.all([
  read("../Cargo.toml"),
  read("../apps/desktop/package.json"),
  read("../apps/desktop/src-tauri/tauri.conf.json"),
]);

const workspacePackage = cargo.match(/\[workspace\.package\]([\s\S]*?)(?=\n\[|$)/)?.[1];
const cargoVersion = workspacePackage?.match(/^version\s*=\s*"([^"]+)"/m)?.[1];
const npmVersion = JSON.parse(packageJson).version;
const tauriVersion = JSON.parse(tauriConfig).version;

const versions = {
  "Cargo workspace": cargoVersion,
  "npm package": npmVersion,
  "Tauri config": tauriVersion,
};

if (Object.values(versions).some((version) => !version)) {
  console.error("Could not read every application version:", versions);
  process.exit(1);
}

if (new Set(Object.values(versions)).size !== 1) {
  console.error("Application version mismatch:", versions);
  process.exit(1);
}

const version = cargoVersion;
const refName = process.env.GITHUB_REF_NAME ?? "";
if (refName.startsWith("v") && refName.slice(1) !== version) {
  console.error(`Release tag ${refName} does not match configured version ${version}.`);
  process.exit(1);
}

console.log(`Fieldwork version metadata is consistent: ${version}`);

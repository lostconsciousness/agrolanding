import { rm } from "node:fs/promises";

const localBuildSecrets = new URL("../dist/server/.dev.vars", import.meta.url);

await rm(localBuildSecrets, { force: true });

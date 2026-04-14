/**
 * CIVITAS Channel Manager — Process Execution Environment Marker
 *
 * Sets a well-known environment variable (`CIVITAS_CLI=1`) on the process so
 * that child processes, plugins, and subagents can reliably detect that they
 * are running inside a CIVITAS Channel Manager invocation.
 *
 * Also maintains backward compatibility with the OpenClaw exec marker so that
 * bundled channel plugins that check `OPENCLAW_CLI` continue to work during
 * the transition period.
 */

/** Environment variable name used to identify a CIVITAS CLI process. */
export const CIVITAS_CLI_ENV_VAR = "CIVITAS_CLI";

/** The value set on the environment variable when running inside CIVITAS CLI. */
export const CIVITAS_CLI_ENV_VALUE = "1";

/**
 * Inject the CIVITAS exec marker into an arbitrary environment object.
 * Returns the mutated (same reference) object so callers can use it fluently.
 *
 * @param env - An environment key/value map (e.g. `process.env` or a
 *              `SpawnOptions.env` object).
 * @returns The same `env` object with the marker injected.
 *
 * @example
 * const childEnv = markCivitasExecEnv({ ...process.env });
 * spawn("node", ["script.js"], { env: childEnv });
 */
export function markCivitasExecEnv<T extends Record<string, string | undefined>>(env: T): T {
  return {
    ...env,
    [CIVITAS_CLI_ENV_VAR]: CIVITAS_CLI_ENV_VALUE,
  };
}

/**
 * Ensure the CIVITAS exec marker is set on `process.env` (or the supplied
 * environment object). Unlike `markCivitasExecEnv` this mutates the object
 * in-place rather than returning a shallow copy.
 *
 * Called once during process startup so that all child processes spawned by
 * this invocation inherit the marker automatically.
 *
 * @param env - The environment to mark (defaults to `process.env`).
 * @returns The same `env` reference.
 */
export function ensureCivitasExecMarkerOnProcess(
  env: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  env[CIVITAS_CLI_ENV_VAR] = CIVITAS_CLI_ENV_VALUE;
  return env;
}

/**
 * Returns `true` if the current process was launched by the CIVITAS CLI.
 * Useful for conditional behaviour in plugins that want to differentiate
 * between a direct invocation and being loaded as a library.
 *
 * @param env - The environment to check (defaults to `process.env`).
 */
export function isCivitasCliProcess(env: NodeJS.ProcessEnv = process.env): boolean {
  return env[CIVITAS_CLI_ENV_VAR] === CIVITAS_CLI_ENV_VALUE;
}

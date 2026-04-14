import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

/**
 * Creates a sanitized environment for nested npm installs by removing npm config variables
 * @param {Record<string, string>} env - Current environment variables
 * @returns {Record<string, string>} - Sanitized environment
 */
export function createNestedNpmInstallEnv(env) {
  const sanitized = { ...env };
  
  // Remove npm-specific configuration variables that could affect nested installs
  const npmConfigVars = Object.keys(sanitized).filter(key => key.startsWith('npm_config_'));
  for (const key of npmConfigVars) {
    delete sanitized[key];
  }
  
  return sanitized;
}

/**
 * Discovers bundled plugin runtime dependencies from extension manifests
 * @param {Object} params - Parameters object
 * @param {string} params.extensionsDir - Path to extensions directory
 * @returns {Array} - Array of dependency objects with name, version, pluginIds, and sentinelPath
 */
export async function discoverBundledPluginRuntimeDeps({ extensionsDir }) {
  const deps = new Map();
  
  try {
    const pluginDirs = await fs.readdir(extensionsDir, { withFileTypes: true });
    
    for (const pluginDir of pluginDirs) {
      if (!pluginDir.isDirectory()) continue;
      
      const pluginPath = path.join(extensionsDir, pluginDir.name);
      const packageJsonPath = path.join(pluginPath, 'package.json');
      
      try {
        const packageContent = await fs.readFile(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(packageContent);
        
        if (packageJson.dependencies) {
          for (const [name, version] of Object.entries(packageJson.dependencies)) {
            if (!deps.has(name)) {
              deps.set(name, {
                name,
                version,
                pluginIds: [],
                sentinelPath: path.join('node_modules', ...name.split('/'), 'package.json')
              });
            }
            deps.get(name).pluginIds.push(pluginDir.name);
          }
        }
      } catch (error) {
        // Skip plugins that don't have valid package.json files
        continue;
      }
    }
  } catch (error) {
    // If extensions directory doesn't exist or can't be read, return empty array
    return [];
  }
  
  return Array.from(deps.values());
}

/**
 * Checks if a dependency sentinel file exists
 * @param {string} packageRoot - Root package directory
 * @param {string} sentinelPath - Path to sentinel file relative to packageRoot
 * @returns {Promise<boolean>} - True if sentinel exists
 */
async function checkSentinelExists(packageRoot, sentinelPath) {
  try {
    await fs.access(path.join(packageRoot, sentinelPath));
    return true;
  } catch {
    return false;
  }
}

/**
 * Runs the bundled plugin postinstall process
 * @param {Object} params - Parameters object
 * @param {Record<string, string>} params.env - Environment variables
 * @param {string} params.extensionsDir - Path to extensions directory  
 * @param {string} params.packageRoot - Root package directory
 * @param {Object} params.npmRunner - NPM runner configuration
 * @param {Function} params.spawnSync - Spawn sync function (for testing)
 * @param {Object} params.log - Logger object with log and warn methods
 */
export async function runBundledPluginPostinstall({
  env,
  extensionsDir,
  packageRoot,
  npmRunner,
  spawnSync: spawnSyncFn = spawnSync,
  log = console
}) {
  try {
    // Check if extensions directory exists
    try {
      await fs.access(extensionsDir);
    } catch {
      log.log('Extensions directory not found, skipping bundled plugin postinstall');
      return;
    }
    
    // Discover bundled plugin dependencies
    const bundledDeps = await discoverBundledPluginRuntimeDeps({ extensionsDir });
    
    if (bundledDeps.length === 0) {
      log.log('No bundled plugin dependencies found');
      return;
    }
    
    // Filter for missing dependencies
    const missingDeps = [];
    for (const dep of bundledDeps) {
      const exists = await checkSentinelExists(packageRoot, dep.sentinelPath);
      if (!exists) {
        missingDeps.push(dep);
      }
    }
    
    if (missingDeps.length === 0) {
      log.log('All bundled plugin dependencies are already installed');
      return;
    }
    
    // Prepare npm install arguments for missing dependencies
    const npmArgs = [
      'install',
      '--omit=dev',
      '--no-save',
      '--package-lock=false',
      ...missingDeps.map(dep => `${dep.name}@${dep.version}`)
    ];
    
    // Create sanitized environment
    const sanitizedEnv = createNestedNpmInstallEnv(env);
    
    log.log(`Installing ${missingDeps.length} bundled plugin dependencies: ${missingDeps.map(d => d.name).join(', ')}`);
    
    // Run npm install
    const result = spawnSyncFn(npmRunner.command, npmArgs, {
      cwd: packageRoot,
      env: { ...sanitizedEnv, PATH: env.PATH },
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    if (result.status !== 0) {
      log.warn(`Failed to install bundled plugin dependencies: ${result.stderr}`);
      throw new Error(`Bundled plugin postinstall failed with status ${result.status}`);
    }
    
    log.log('Successfully installed bundled plugin dependencies');
    
  } catch (error) {
    log.warn('Bundled plugin postinstall failed:', error.message);
    // Don't throw the error to avoid breaking the main install process
  }
}

// Main execution when run as a script
if (import.meta.url === `file://${process.argv[1]}`) {
  const packageRoot = process.cwd();
  const extensionsDir = path.join(packageRoot, 'dist', 'extensions');
  
  await runBundledPluginPostinstall({
    env: process.env,
    extensionsDir,
    packageRoot,
    npmRunner: {
      command: 'npm',
      args: []
    }
  });
}

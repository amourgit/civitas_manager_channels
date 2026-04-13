import { vi } from "vitest";
import { installChromeUserDataDirHooks } from "./chrome-user-data-dir.test-harness.js";

const chromeUserDataDir = { dir: "/tmp/civitas" };
installChromeUserDataDirHooks(chromeUserDataDir);

vi.mock("./chrome.js", () => ({
  isChromeCdpReady: vi.fn(async () => true),
  isChromeReachable: vi.fn(async () => true),
  launchCIVITASChrome: vi.fn(async () => {
    throw new Error("unexpected launch");
  }),
  resolveCIVITASUserDataDir: vi.fn(() => chromeUserDataDir.dir),
  stopCIVITASChrome: vi.fn(async () => {}),
}));

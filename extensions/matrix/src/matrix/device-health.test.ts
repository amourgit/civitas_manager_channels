import { describe, expect, it } from "vitest";
import { isCIVITASManagedMatrixDevice, summarizeMatrixDeviceHealth } from "./device-health.js";

describe("matrix device health", () => {
  it("detects CIVITAS-managed device names", () => {
    expect(isCIVITASManagedMatrixDevice("CIVITAS Gateway")).toBe(true);
    expect(isCIVITASManagedMatrixDevice("CIVITAS Debug")).toBe(true);
    expect(isCIVITASManagedMatrixDevice("Element iPhone")).toBe(false);
    expect(isCIVITASManagedMatrixDevice(null)).toBe(false);
  });

  it("summarizes stale CIVITAS-managed devices separately from the current device", () => {
    const summary = summarizeMatrixDeviceHealth([
      {
        deviceId: "du314Zpw3A",
        displayName: "CIVITAS Gateway",
        current: true,
      },
      {
        deviceId: "BritdXC6iL",
        displayName: "CIVITAS Gateway",
        current: false,
      },
      {
        deviceId: "G6NJU9cTgs",
        displayName: "CIVITAS Debug",
        current: false,
      },
      {
        deviceId: "phone123",
        displayName: "Element iPhone",
        current: false,
      },
    ]);

    expect(summary.currentDeviceId).toBe("du314Zpw3A");
    expect(summary.currentCIVITASDevices).toEqual([
      expect.objectContaining({ deviceId: "du314Zpw3A" }),
    ]);
    expect(summary.staleCIVITASDevices).toEqual([
      expect.objectContaining({ deviceId: "BritdXC6iL" }),
      expect.objectContaining({ deviceId: "G6NJU9cTgs" }),
    ]);
  });
});

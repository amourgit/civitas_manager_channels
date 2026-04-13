export type MatrixManagedDeviceInfo = {
  deviceId: string;
  displayName: string | null;
  current: boolean;
};

export type MatrixDeviceHealthSummary = {
  currentDeviceId: string | null;
  staleCIVITASDevices: MatrixManagedDeviceInfo[];
  currentCIVITASDevices: MatrixManagedDeviceInfo[];
};

const CIVITAS_DEVICE_NAME_PREFIX = "CIVITAS ";

export function isCIVITASManagedMatrixDevice(displayName: string | null | undefined): boolean {
  return displayName?.startsWith(CIVITAS_DEVICE_NAME_PREFIX) === true;
}

export function summarizeMatrixDeviceHealth(
  devices: MatrixManagedDeviceInfo[],
): MatrixDeviceHealthSummary {
  const currentDeviceId = devices.find((device) => device.current)?.deviceId ?? null;
  const CIVITASDevices = devices.filter((device) =>
    isCIVITASManagedMatrixDevice(device.displayName),
  );
  return {
    currentDeviceId,
    staleCIVITASDevices: CIVITASDevices.filter((device) => !device.current),
    currentCIVITASDevices: CIVITASDevices.filter((device) => device.current),
  };
}

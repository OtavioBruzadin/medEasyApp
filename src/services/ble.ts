import { decode as decodeBase64 } from 'base-64';
import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device, State, Subscription } from 'react-native-ble-plx';

export const GONIOMETER_NAME = 'Goniometro-ESP32';
export const GONIOMETER_SERVICE_UUID = '7f510001-1b15-4f8e-9a77-3c7b9e4d1000';
export const GONIOMETER_MEASUREMENT_UUID = '7f510002-1b15-4f8e-9a77-3c7b9e4d1000';
export const GONIOMETER_CAPTURE_UUID = '7f510003-1b15-4f8e-9a77-3c7b9e4d1000';

export type GoniometerMeasurement = {
  voltage: number;
  percent: number;
};

const manager = new BleManager();

export async function requestBlePermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  if (Number(Platform.Version) >= 31) {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
    ]);

    return (
      result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
      result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED
    );
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export async function ensureBluetoothReady(): Promise<void> {
  const currentState = await manager.state();
  if (currentState === State.PoweredOn) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    let subscription: Subscription | undefined;
    const timeout = setTimeout(() => {
      subscription?.remove();
      reject(new Error('Ative o Bluetooth do celular e tente novamente.'));
    }, 10000);

    subscription = manager.onStateChange(state => {
      if (state === State.PoweredOn) {
        clearTimeout(timeout);
        subscription?.remove();
        resolve();
      }
    }, true);
  });
}

export function scanForGoniometer(
  onFound: (device: Device) => void,
  onError: (message: string) => void
): () => void {
  manager.startDeviceScan([GONIOMETER_SERVICE_UUID], null, (error, device) => {
    if (error) {
      manager.stopDeviceScan();
      onError(error.message);
      return;
    }

    if (device && (device.name === GONIOMETER_NAME || device.localName === GONIOMETER_NAME)) {
      manager.stopDeviceScan();
      onFound(device);
    }
  });

  return () => manager.stopDeviceScan();
}

export async function connectToGoniometer(device: Device): Promise<Device> {
  const connected = await device.connect({ timeout: 10000 });
  return connected.discoverAllServicesAndCharacteristics();
}

export function monitorMeasurements(
  device: Device,
  onMeasurement: (measurement: GoniometerMeasurement) => void,
  onError: (message: string) => void
): Subscription {
  return device.monitorCharacteristicForService(
    GONIOMETER_SERVICE_UUID,
    GONIOMETER_MEASUREMENT_UUID,
    (error, characteristic) => {
      if (error) {
        onError(error.message);
        return;
      }

      if (!characteristic?.value) {
        return;
      }

      try {
        const decoded = decodeBase64(characteristic.value);
        const measurement = decoded.startsWith('{')
          ? JSON.parse(decoded)
          : (() => {
              const [voltage, percent] = decoded.split(',').map(Number);
              return { voltage, percent };
            })();
        if (typeof measurement.voltage === 'number' && typeof measurement.percent === 'number') {
          if (!Number.isFinite(measurement.voltage) || !Number.isFinite(measurement.percent)) {
            throw new Error('Medição não numérica');
          }
          onMeasurement(measurement);
        }
      } catch {
        onError('O dispositivo enviou uma medição inválida.');
      }
    }
  );
}

export function monitorCaptures(
  device: Device,
  onCapture: (measurement: GoniometerMeasurement) => void,
  onError: (message: string) => void
): Subscription {
  return device.monitorCharacteristicForService(
    GONIOMETER_SERVICE_UUID,
    GONIOMETER_CAPTURE_UUID,
    (error, characteristic) => {
      if (error) {
        onError(error.message);
        return;
      }
      if (!characteristic?.value) return;

      try {
        const [voltage, percent] = decodeBase64(characteristic.value).split(',').map(Number);
        if (!Number.isFinite(voltage) || !Number.isFinite(percent)) {
          throw new Error('Medição não numérica');
        }
        onCapture({ voltage, percent });
      } catch {
        onError('O dispositivo enviou uma captura inválida.');
      }
    }
  );
}

export async function disconnectGoniometer(device: Device): Promise<void> {
  if (await device.isConnected()) {
    await device.cancelConnection();
  }
}

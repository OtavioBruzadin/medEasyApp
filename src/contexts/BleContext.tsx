import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Device, Subscription } from 'react-native-ble-plx';

import {
  connectToGoniometer,
  disconnectGoniometer,
  ensureBluetoothReady,
  GoniometerMeasurement,
  monitorCaptures,
  monitorMeasurements,
  requestBlePermissions,
  scanForGoniometer
} from '../services/ble';

export type BleConnectionState = 'idle' | 'scanning' | 'connecting' | 'connected';
type CaptureEvent = { id: number; measurement: GoniometerMeasurement };

type BleContextValue = {
  connectionState: BleConnectionState;
  measurement: GoniometerMeasurement | null;
  captureEvent: CaptureEvent | null;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  clearError: () => void;
};

const BleContext = createContext<BleContextValue | null>(null);

export function BleProvider({ children }: { children: ReactNode }) {
  const [connectionState, setConnectionState] = useState<BleConnectionState>('idle');
  const [measurement, setMeasurement] = useState<GoniometerMeasurement | null>(null);
  const [captureEvent, setCaptureEvent] = useState<CaptureEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const deviceRef = useRef<Device | null>(null);
  const stopScanRef = useRef<(() => void) | null>(null);
  const subscriptionsRef = useRef<Subscription[]>([]);
  const captureIdRef = useRef(0);

  function removeSubscriptions() {
    subscriptionsRef.current.forEach(subscription => subscription.remove());
    subscriptionsRef.current = [];
  }

  function resetConnection(message?: string) {
    stopScanRef.current?.();
    stopScanRef.current = null;
    removeSubscriptions();
    deviceRef.current = null;
    setConnectionState('idle');
    setMeasurement(null);
    if (message) setError(message);
  }

  useEffect(() => () => {
    stopScanRef.current?.();
    removeSubscriptions();
  }, []);

  async function connect() {
    if (connectionState !== 'idle') return;
    setError(null);
    const hasPermission = await requestBlePermissions();
    if (!hasPermission) {
      setError('A permissão de dispositivos próximos é necessária para localizar o goniômetro.');
      return;
    }

    try {
      await ensureBluetoothReady();
      setConnectionState('scanning');
      stopScanRef.current = scanForGoniometer(async foundDevice => {
        stopScanRef.current = null;
        try {
          setConnectionState('connecting');
          const connectedDevice = await connectToGoniometer(foundDevice);
          deviceRef.current = connectedDevice;
          setConnectionState('connected');
          subscriptionsRef.current = [
            monitorMeasurements(connectedDevice, setMeasurement, message => setError(message)),
            monitorCaptures(connectedDevice, captured => {
              captureIdRef.current += 1;
              setCaptureEvent({ id: captureIdRef.current, measurement: captured });
            }, message => setError(message)),
            connectedDevice.onDisconnected(() => resetConnection())
          ];
        } catch (connectionError) {
          resetConnection(connectionError instanceof Error ? connectionError.message : 'Não foi possível conectar.');
        }
      }, message => resetConnection(message));

      setTimeout(() => {
        if (stopScanRef.current) {
          resetConnection('Dispositivo não encontrado. Segure o Botão 2 por 5 segundos e tente novamente.');
        }
      }, 15000);
    } catch (bluetoothError) {
      resetConnection(bluetoothError instanceof Error ? bluetoothError.message : 'Falha ao iniciar o Bluetooth.');
    }
  }

  async function disconnect() {
    const device = deviceRef.current;
    removeSubscriptions();
    deviceRef.current = null;
    if (device) await disconnectGoniometer(device);
    setConnectionState('idle');
    setMeasurement(null);
  }

  return (
    <BleContext.Provider value={{
      connectionState,
      measurement,
      captureEvent,
      error,
      connect,
      disconnect,
      clearError: () => setError(null)
    }}>
      {children}
    </BleContext.Provider>
  );
}

export function useBle() {
  const value = useContext(BleContext);
  if (!value) throw new Error('useBle deve ser usado dentro de BleProvider');
  return value;
}

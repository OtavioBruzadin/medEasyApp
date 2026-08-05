import React from 'react';
import AuthNavigator from './src/navigation/AuthNavigator';
import { BleProvider } from './src/contexts/BleContext';

export default function App() {
  return <BleProvider><AuthNavigator /></BleProvider>;
}

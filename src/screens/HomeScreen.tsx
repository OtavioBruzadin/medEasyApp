import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

export default function HomeScreen({ navigation }: any) {
  async function handleLogout() {
    await AsyncStorage.removeItem('accessToken');
    navigation.replace('Login');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MedEasy</Text>
      <Text style={styles.subtitle}>O que deseja fazer?</Text>

      <TouchableOpacity style={styles.examsButton} onPress={() => navigation.navigate('Exams')}>
        <Text style={styles.buttonTitle}>Exames</Text>
        <Text style={styles.buttonDescription}>Consultar o histórico de exames</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.measureButton} onPress={() => navigation.navigate('Bluetooth')}>
        <Text style={styles.buttonTitle}>Aferir</Text>
        <Text style={styles.buttonDescription}>Iniciar uma nova goniometria</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f6f8fb'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#152238'
  },
  subtitle: { fontSize: 17, color: '#607d8b', marginBottom: 28 },
  examsButton: { backgroundColor: '#1565c0', padding: 22, borderRadius: 14, marginBottom: 14 },
  measureButton: { backgroundColor: '#2e7d32', padding: 22, borderRadius: 14, marginBottom: 28 },
  logoutButton: {
    backgroundColor: '#555',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20
  },
  buttonTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  buttonDescription: { color: '#fff', fontSize: 14, opacity: 0.9 },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});

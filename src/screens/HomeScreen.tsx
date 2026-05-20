import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity
} from 'react-native';

import { getExames } from '../services/api';

export default function HomeScreen({ navigation }: any) {
  const [exames, setExames] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadExames();
    }, [])
  );

  async function loadExames() {
    const data = await getExames();
    setExames(data);
  }

  async function handleLogout() {
    await AsyncStorage.removeItem('accessToken');
    navigation.replace('Login');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exames</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddExam')}>
        <Text style={styles.buttonText}>Adicionar exame</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>

      <FlatList
        data={exames}
        keyExtractor={(item, index) => String(item.id || index)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ExamDetails', { exame: item })}
          >
            <Text style={styles.patient}>{item.nomePaciente}</Text>
            <Text>{item.tipoExame}</Text>
            <Text>{item.dataExame}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20
  },
  button: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10
  },
  logoutButton: {
    backgroundColor: '#555',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12
  },
  patient: {
    fontSize: 18,
    fontWeight: 'bold'
  }
});
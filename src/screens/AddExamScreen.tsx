import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';

import { createExame } from '../services/api';

export default function AddExamScreen({ navigation }: any) {
  const [dataExame, setDataExame] = useState('');
  const [cpfPaciente, setCpfPaciente] = useState('');
  const [nomePaciente, setNomePaciente] = useState('');
  const [tipoExame, setTipoExame] = useState('');
  const [hemoglobina, setHemoglobina] = useState('');
  const [hematocrito, setHematocrito] = useState('');
  const [plaquetas, setPlaquetas] = useState('');

  async function handleCreateExam() {
    try {
      await createExame({
        dataExame,
        cpfPaciente,
        nomePaciente,
        tipoExame,
        resultados: {
          hemoglobina: Number(hemoglobina),
          hematocrito: Number(hematocrito),
          plaquetas: Number(plaquetas)
        }
      });

      Alert.alert('Sucesso', 'Exame criado com sucesso');
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar o exame');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Novo exame</Text>

      <TextInput placeholder="Data do exame YYYY-MM-DD" value={dataExame} onChangeText={setDataExame} style={styles.input} />
      <TextInput placeholder="CPF do paciente" value={cpfPaciente} onChangeText={setCpfPaciente} style={styles.input} />
      <TextInput placeholder="Nome do paciente" value={nomePaciente} onChangeText={setNomePaciente} style={styles.input} />
      <TextInput placeholder="Tipo do exame" value={tipoExame} onChangeText={setTipoExame} style={styles.input} />

      <Text style={styles.subtitle}>Resultados</Text>

      <TextInput placeholder="Hemoglobina" value={hemoglobina} onChangeText={setHemoglobina} style={styles.input} keyboardType="numeric" />
      <TextInput placeholder="Hematócrito" value={hematocrito} onChangeText={setHematocrito} style={styles.input} keyboardType="numeric" />
      <TextInput placeholder="Plaquetas" value={plaquetas} onChangeText={setPlaquetas} style={styles.input} keyboardType="numeric" />

      <TouchableOpacity style={styles.button} onPress={handleCreateExam}>
        <Text style={styles.buttonText}>Salvar exame</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    marginBottom: 14
  },
  button: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});
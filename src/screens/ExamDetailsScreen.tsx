import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

export default function ExamDetailsScreen({ route }: any) {
  const { exame } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{exame.nomePaciente}</Text>

      <Text style={styles.label}>CPF</Text>
      <Text style={styles.value}>{exame.cpfPaciente}</Text>

      <Text style={styles.label}>Tipo do exame</Text>
      <Text style={styles.value}>{exame.tipoExame}</Text>

      <Text style={styles.label}>Data</Text>
      <Text style={styles.value}>{exame.dataExame}</Text>

      <Text style={styles.subtitle}>Resultados</Text>

      {Object.entries(exame.resultados || {}).map(([key, value]) => (
        <View key={key} style={styles.resultRow}>
          <Text style={styles.resultKey}>{key}</Text>
          <Text style={styles.resultValue}>{String(value)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 24
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12
  },
  value: {
    fontSize: 16,
    marginTop: 4
  },
  resultRow: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10
  },
  resultKey: {
    fontWeight: 'bold'
  },
  resultValue: {
    marginTop: 4
  }
});
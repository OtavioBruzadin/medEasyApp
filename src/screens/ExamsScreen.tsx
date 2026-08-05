import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getExames } from '../services/api';

export default function ExamsScreen({ navigation }: any) {
  const [exames, setExames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    getExames().then(setExames).finally(() => setLoading(false));
  }, []));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de exames</Text>
      {loading ? <ActivityIndicator size="large" color="#1565c0" /> : (
        <FlatList
          data={exames}
          keyExtractor={(item, index) => String(item.id || index)}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum exame encontrado.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ExamDetails', { exame: item })}>
              <Text style={styles.patient}>{item.nomePaciente}</Text>
              <Text style={styles.detail}>{item.tipoExame}</Text>
              <Text style={styles.date}>{item.dataExame}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f6f8fb' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#152238', marginBottom: 20 },
  empty: { textAlign: 'center', color: '#607d8b', marginTop: 40, fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 18, marginBottom: 12 },
  patient: { fontSize: 18, fontWeight: 'bold', color: '#152238', marginBottom: 5 },
  detail: { color: '#37474f', fontSize: 15 },
  date: { color: '#78909c', marginTop: 5 }
});

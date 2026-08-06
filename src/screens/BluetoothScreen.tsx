import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { GoniometerMeasurement } from '../services/ble';
import { createExame } from '../services/api';
import { useBle } from '../contexts/BleContext';

type MeasureField = { name: string; value: number | null };
type ExamStep = 'connection' | 'patient' | 'measurements';

export default function BluetoothScreen({ navigation }: any) {
  const { connectionState, measurement, captureEvent, error, connect, disconnect, clearError } = useBle();
  const [step, setStep] = useState<ExamStep>('connection');
  const [dataExame, setDataExame] = useState(new Date().toISOString().slice(0, 10));
  const [cpfPaciente, setCpfPaciente] = useState('');
  const [nomePaciente, setNomePaciente] = useState('');
  const [tipoExame, setTipoExame] = useState('Goniometria');
  const [newFieldName, setNewFieldName] = useState('');
  const [fields, setFields] = useState<MeasureField[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const activeIndexRef = useRef<number | null>(null);
  const fieldsRef = useRef<MeasureField[]>([]);
  const allowExitRef = useRef(false);

  useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);
  useEffect(() => { fieldsRef.current = fields; }, [fields]);

  useEffect(() => {
    if (error) {
      Alert.alert('Bluetooth', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError]);

  useEffect(() => {
    if (captureEvent && step === 'measurements') recordCapture(captureEvent.measurement);
  }, [captureEvent]);

  useEffect(() => navigation.addListener('beforeRemove', (event: any) => {
    if (allowExitRef.current) return;
    event.preventDefault();
    confirmCancel(() => {
      allowExitRef.current = true;
      navigation.dispatch(event.data.action);
    });
  }), [navigation]);

  const isBusy = connectionState === 'scanning' || connectionState === 'connecting';

  function confirmCancel(onConfirm: () => void) {
    Alert.alert(
      'Cancelar exame?',
      'Tem certeza que quer cancelar o exame? Todos os dados aferidos serão perdidos.',
      [
        { text: 'Continuar exame', style: 'cancel' },
        { text: 'Sim, cancelar', style: 'destructive', onPress: onConfirm }
      ]
    );
  }

  function cancelExam() {
    confirmCancel(() => {
      allowExitRef.current = true;
      navigation.goBack();
    });
  }

  function continueToMeasurements() {
    if (!dataExame || !cpfPaciente.trim() || !nomePaciente.trim() || !tipoExame.trim()) {
      Alert.alert('Dados incompletos', 'Preencha data, CPF, paciente e tipo do exame.');
      return;
    }
    setStep('measurements');
  }

  function addField() {
    const name = newFieldName.trim();
    if (!name) return;
    if (fields.some(field => field.name.toLowerCase() === name.toLowerCase())) {
      Alert.alert('Campo duplicado', 'Escolha outro nome para a medida.');
      return;
    }
    const next = [...fields, { name, value: null }];
    setFields(next);
    setNewFieldName('');
    if (activeIndex === null) setActiveIndex(next.length - 1);
  }

  function recordCapture(captured: GoniometerMeasurement) {
    const index = activeIndexRef.current;
    const currentFields = fieldsRef.current;
    if (index === null || !currentFields[index]) {
      Alert.alert('Nenhum campo selecionado', 'Crie ou selecione uma medida antes de apertar o Botão 1.');
      return;
    }
    const updated = currentFields.map((field, position) =>
      position === index ? { ...field, value: captured.angle } : field
    );
    fieldsRef.current = updated;
    setFields(updated);
    const nextEmpty = updated.findIndex((field, position) => position > index && field.value === null);
    const nextIndex = nextEmpty >= 0 ? nextEmpty : null;
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
  }

  async function saveExam() {
    if (!dataExame || !cpfPaciente.trim() || !nomePaciente.trim() || !tipoExame.trim()) {
      Alert.alert('Dados incompletos', 'Preencha data, CPF, paciente e tipo do exame.');
      return;
    }
    if (!fields.length || fields.some(field => field.value === null)) {
      Alert.alert('Medidas incompletas', 'Registre todas as medidas antes de salvar.');
      return;
    }
    try {
      setSaving(true);
      const resultados = Object.fromEntries(fields.map(field => [field.name, field.value as number]));
      await createExame({ dataExame, cpfPaciente, nomePaciente, tipoExame, resultados });
      allowExitRef.current = true;
      Alert.alert('Sucesso', 'Exame de goniometria salvo.');
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível salvar o exame.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.stepLabel}>Etapa {step === 'connection' ? '1 de 3' : step === 'patient' ? '2 de 3' : '3 de 3'}</Text>
      <Text style={styles.title}>{step === 'connection' ? 'Conectar dispositivo' : step === 'patient' ? 'Dados do paciente' : 'Campos de medição'}</Text>

      {step === 'connection' && <>
      <Text style={styles.instructions}>
        Segure o Botão 2 por 5 segundos e conecte o goniômetro antes de iniciar o exame.
      </Text>

      <View style={styles.statusCard}>
        <Text style={styles.label}>Estado</Text>
        <Text style={styles.status}>
          {connectionState === 'idle' && 'Desconectado'}
          {connectionState === 'scanning' && 'Procurando dispositivo…'}
          {connectionState === 'connecting' && 'Conectando…'}
          {connectionState === 'connected' && 'Conectado'}
        </Text>
        {isBusy && <ActivityIndicator size="large" color="#1565c0" style={styles.loader} />}
      </View>
      {connectionState === 'connected' ? (
        <>
          <TouchableOpacity style={styles.nextButton} onPress={() => setStep('patient')}><Text style={styles.buttonText}>Continuar</Text></TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={disconnect}><Text style={styles.secondaryButtonText}>Desconectar dispositivo</Text></TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity style={[styles.connectButton, isBusy && styles.disabledButton]} onPress={connect} disabled={isBusy}>
          <Text style={styles.buttonText}>Conectar ao dispositivo</Text>
        </TouchableOpacity>
      )}
      </>}

      {step === 'measurements' && measurement && (
        <View style={styles.measurementCard}>
          <Text style={styles.label}>Medição em tempo real</Text>
          <Text style={styles.angle}>{measurement.angle.toFixed(1)}°</Text>
          <Text style={styles.voltage}>{measurement.voltage.toFixed(3)} V</Text>
        </View>
      )}

      {step === 'patient' && <>
      <TextInput placeholder="Data YYYY-MM-DD" placeholderTextColor="#000" value={dataExame} onChangeText={setDataExame} style={styles.input} />
      <TextInput placeholder="CPF do paciente" placeholderTextColor="#000" value={cpfPaciente} onChangeText={setCpfPaciente} style={styles.input} />
      <TextInput placeholder="Nome do paciente" placeholderTextColor="#000" value={nomePaciente} onChangeText={setNomePaciente} style={styles.input} />
      <TextInput placeholder="Tipo do exame" placeholderTextColor="#000" value={tipoExame} onChangeText={setTipoExame} style={styles.input} />
      <TouchableOpacity style={styles.nextButton} onPress={continueToMeasurements}><Text style={styles.buttonText}>Continuar para medições</Text></TouchableOpacity>
      </>}

      {step === 'measurements' && <>
      <Text style={styles.measureHelp}>Dê nome aos campos. O campo azul receberá a próxima captura do Botão 1.</Text>
      <View style={styles.addRow}>
        <TextInput placeholder="Ex.: Flexão do joelho" placeholderTextColor="#000" value={newFieldName} onChangeText={setNewFieldName} style={[styles.input, styles.fieldNameInput]} onSubmitEditing={addField} />
        <TouchableOpacity style={styles.addButton} onPress={addField}><Text style={styles.buttonText}>Adicionar</Text></TouchableOpacity>
      </View>
      {fields.map((field, index) => (
        <TouchableOpacity
          key={`${field.name}-${index}`}
          style={[styles.measureRow, activeIndex === index && styles.activeMeasureRow]}
          onPress={() => setActiveIndex(index)}
        >
          <Text style={styles.measureName}>{field.name}</Text>
          <Text style={styles.measureValue}>{field.value === null ? 'Aguardando' : `${field.value}°`}</Text>
        </TouchableOpacity>
      ))}
      {fields.length > 0 && activeIndex === null && <Text style={styles.finishedText}>Todas preenchidas. Toque em uma medida para alterá-la.</Text>}

        <TouchableOpacity style={[styles.saveButton, saving && styles.disabledButton]} onPress={saveExam} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? 'Salvando…' : 'Concluir exame'}</Text>
        </TouchableOpacity>
      </>}

      <TouchableOpacity style={styles.cancelButton} onPress={cancelExam}>
        <Text style={styles.cancelButtonText}>Cancelar exame</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#f6f8fb' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 12, color: '#152238' },
  stepLabel: { color: '#1565c0', fontWeight: 'bold', marginBottom: 5 },
  instructions: { fontSize: 16, lineHeight: 23, color: '#52606d', marginBottom: 24 },
  statusCard: { backgroundColor: '#fff', borderRadius: 14, padding: 20, marginBottom: 16 },
  measurementCard: { backgroundColor: '#e3f2fd', borderRadius: 14, padding: 24, alignItems: 'center', marginBottom: 20 },
  label: { fontSize: 14, color: '#607d8b', marginBottom: 6 },
  status: { fontSize: 20, fontWeight: '600', color: '#152238' },
  loader: { marginTop: 16 },
  angle: { fontSize: 52, fontWeight: 'bold', color: '#1565c0' },
  voltage: { fontSize: 20, color: '#37474f', marginTop: 4 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#152238', marginTop: 10, marginBottom: 12 },
  measureHelp: { color: '#52606d', lineHeight: 20, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#b0bec5', color: '#000', backgroundColor: '#fff', borderRadius: 8, padding: 13, marginBottom: 12 },
  addRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  fieldNameInput: { flex: 1 },
  addButton: { backgroundColor: '#455a64', paddingHorizontal: 13, paddingVertical: 14, borderRadius: 8 },
  measureRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderWidth: 2, borderColor: 'transparent', borderRadius: 10, padding: 16, marginBottom: 9 },
  activeMeasureRow: { borderColor: '#1565c0', backgroundColor: '#e3f2fd' },
  measureName: { flex: 1, fontSize: 16, color: '#152238', fontWeight: '600' },
  measureValue: { fontSize: 17, color: '#1565c0', fontWeight: 'bold' },
  finishedText: { color: '#2e7d32', marginBottom: 14 },
  saveButton: { backgroundColor: '#2e7d32', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 12, marginBottom: 10 },
  nextButton: { backgroundColor: '#1565c0', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 8, marginBottom: 10 },
  secondaryButton: { padding: 14, alignItems: 'center', marginBottom: 8 },
  secondaryButtonText: { color: '#1565c0', fontWeight: '600' },
  cancelButton: { borderWidth: 1, borderColor: '#c62828', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 8, marginBottom: 20 },
  cancelButtonText: { color: '#c62828', fontWeight: 'bold', fontSize: 16 },
  connectButton: { backgroundColor: '#1565c0', padding: 16, borderRadius: 10, alignItems: 'center' },
  disconnectButton: { backgroundColor: '#c62828', padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  disabledButton: { opacity: 0.55 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

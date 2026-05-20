import React, { useState } from 'react';
import { login } from '../services/api';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';

import { AuthStackParamList } from '../navigation/AuthNavigator';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'Login'
>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    try {
      const data = await login(email, password);

      await AsyncStorage.setItem(
        'accessToken',
        data.accessToken
      );

      navigation.replace('Home');

      console.log('Login success:', data);
    } catch (error) {
      console.log('Login error:', error);

      Alert.alert(
        'Erro',
        'Email ou senha inválidos'
      );
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>
          Entrar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
onPress={() => navigation.navigate('Register' as never)}      >
        <Text style={styles.registerText}>
          Não possui conta? Cadastre-se
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff'
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16
  },

  button: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },

  registerText: {
    textAlign: 'center',
    color: '#007AFF',
    fontWeight: '600'
  }
});
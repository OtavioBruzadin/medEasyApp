// Durante o desenvolvimento em um celular USB, o ADB encaminha esta porta
// para a API Spring Boot que está rodando no computador.
const API_URL = 'http://127.0.0.1:8090';
import AsyncStorage from '@react-native-async-storage/async-storage';



export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
}

export async function signup(
  name: string,
  email: string,
  password: string
) {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      email,
      password
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Signup failed');
  }

  return data;
}

export async function getExames() {
  const token = await AsyncStorage.getItem('accessToken');

  const response = await fetch(`${API_URL}/api/exames`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  return data;
}

export async function createExame(exame: {
  dataExame: string;
  cpfPaciente: string;
  nomePaciente: string;
  tipoExame: string;
  resultados: Record<string, number>;
}) {
  const token = await AsyncStorage.getItem('accessToken');

  const response = await fetch(`${API_URL}/api/exames`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(exame)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao criar exame');
  }

  return data;
}

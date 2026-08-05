import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import AddExamScreen from '../screens/AddExamScreen';
import ExamDetailsScreen from '../screens/ExamDetailsScreen';
import BluetoothScreen from '../screens/BluetoothScreen';
import ExamsScreen from '../screens/ExamsScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  AddExam: undefined;
  Bluetooth: undefined;
  Exams: undefined;
  ExamDetails: {
    exame: any;
  };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  const [initialRoute, setInitialRoute] = useState<keyof AuthStackParamList | null>(null);

  useEffect(() => {
    checkToken();
  }, []);

  async function checkToken() {
    const token = await AsyncStorage.getItem('accessToken');
    setInitialRoute(token ? 'Home' : 'Login');
  }

  if (!initialRoute) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Cadastro' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Menu principal', headerBackVisible: false }} />
        <Stack.Screen name="Exams" component={ExamsScreen} options={{ title: 'Exames' }} />
        <Stack.Screen name="AddExam" component={AddExamScreen} options={{ title: 'Adicionar exame' }} />
        <Stack.Screen name="Bluetooth" component={BluetoothScreen} options={{ title: 'Aferir' }} />
        <Stack.Screen name="ExamDetails" component={ExamDetailsScreen} options={{ title: 'Detalhes do exame' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

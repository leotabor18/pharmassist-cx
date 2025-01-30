import { Link, router, Stack } from 'expo-router';
import { Image, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, NavigationContainer, ThemeProvider } from '@react-navigation/native';
import { Surface } from '@react-native-material/core';
import { useState } from 'react';
import TextField from '@/components/TextField';
import Spinner from 'react-native-loading-spinner-overlay';
import Loading from '@/components/Spinner';
import { API_METHOD, request } from '@/services/request';
import api from '@/services/api';
import { OTPParamsProps } from './otp-register';
import { useLocalSearchParams } from 'expo-router';


const NewPassword = () => {
  const colorScheme = useColorScheme();
  const [confirmPassword, setConfirmPassword] = useState('');
  const [password, setPassword] = useState('');
  const [spinner, setSpinner] = useState(false);
  const [error, setError] = useState('');
  
  const item: OTPParamsProps = useLocalSearchParams();

  const onChangeNumber = () => {

  }

  const handleSubmit = async () => {
    if (!password) {
      setError('Invalid inputs')
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return;
    }
    setError('')
    setSpinner(true);
    try {
      await request({
        url: api.NEW_PASSWORD_CX,
        method: API_METHOD.POST,
        data: {
          newPassword: password,
          userId: item.userId  ? parseInt(item.userId) : null
        },
      })

      setSpinner(false);
      router.replace('/login');
      showToast();
    } catch(err) {
      console.log('Err', err)
      setError('Username already exists')
      setSpinner(false);
    }
  }

  const handleCancel = () => {
    router.replace('/login')
  }

  const showToast = () => {
    ToastAndroid.show('Password has been updated successfully', ToastAndroid.SHORT);
  };

  return (
    <>
      <Stack.Screen options={{headerShown: false}} />
      <ThemeProvider  value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Surface style={styles.container} >
          <Image
            style={styles.logo}
            source={require('../assets/images/logo.png')}
          />
           <ThemedText style={[styles.text, {color: '#000'}]} type="title">New password</ThemedText>
           <TextField onChange={setPassword} value={password} name='Password' />
           <TextField onChange={setConfirmPassword} value={confirmPassword} name='Confirm Password' />
           {
              error ?
                <ThemedText style={{color: '#972B21', fontStyle: 'italic', fontSize: 14, marginTop: 4}} type="default">
                    {error}
                </ThemedText>
              :
              <></>
            }
          <View style={styles.actionButton}>
            <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text> Cancel </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.actionButtonText}> Submit </Text>
            </TouchableOpacity>
          </View>
        </Surface>
        <Loading spinner={spinner}/>
      </ThemeProvider>
    </>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'relative'
  },
  text: {
    marginTop: 16,
    fontSize: 24,
    marginBottom: 16
  },
  logo: {
    width: 150,
    height: 100,
  },
  actionButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    gap: 16,
    width: '100%',
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    width: 150,
    // width: '100%'
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#136192',
    padding: 10,
    width: 150
  },
  actionButtonText: {
    color: '#ffff',
  },
  link: {
    textDecorationLine: 'underline'
  }
});

export default NewPassword
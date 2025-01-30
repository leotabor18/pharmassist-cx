import { Link, router, Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';

import Loading from '@/components/Spinner';
import TextField from '@/components/TextField';
import TextInputIcon from '@/components/TextInputIcon';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import api from '@/services/api';
import { API_METHOD, request } from '@/services/request';
import { Surface } from '@react-native-material/core';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useState } from 'react';
import { OTPParamsProps } from './otp-register';

const Signup = () => {
  const colorScheme = useColorScheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [spinner, setSpinner] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');

  const [view, setView] = useState(false);
  const [view2, setView2] = useState(false);

  const item: OTPParamsProps = useLocalSearchParams();
  
  const initialValues = {
    firstName,
    lastName,
    email: username,
    phoneNumber: item.phoneNumber
  }

  const handleSubmit = async () => {
    if (!firstName || !lastName || !username) {
      setError('Invalid Inputs')
      return;
    }

    if (password !== password2) {
      setError('Passwords do not match')
      return;
    }

    setError('')
    setSpinner(true);
    const newValues = {
      ...initialValues,
      role: 'CUSTOMER',
      password: password
    }


    try {
      const response = await request({
        url: api.USER_API +'/create-cx',
        method: API_METHOD.POST,
        data: newValues,
      })

      setSpinner(false);
      router.replace('/login');
      showToast();
    } catch(err) {
      console.log('Err', err)
      setError('Username already exists')
      setSpinner(false);
    }
  };

  const showToast = () => {
    ToastAndroid.show('Account has been created', ToastAndroid.SHORT);
  };

  const handleView = () => {
    setView(prev => !prev);
  };

  const handleView2 = () => {
    setView2(prev => !prev);
  };

  const onChangeFormattedText = (code: string) => {
    setFormattedPhoneNumber(code);
  }

  return (
    <>
      <Stack.Screen options={{headerShown: false}} />
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Surface style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <ThemedText style={styles.text} type="title">Create an account</ThemedText>
            <TextField onChange={setFirstName} value={firstName} name='First name' />
            <TextField onChange={setLastName} value={lastName} name='Last name' />
            <TextField onChange={setUsername} value={username} name='Email Address' />
            <TextInputIcon 
              withLabel={true} 
              secureTextEntry={!view} 
              onChange={setPassword} 
              value={password} 
              name='Password' 
              icon={view ? 'eye-sharp' : 'eye-off'} 
              handleClickIcon={handleView}
            />
            <TextInputIcon 
              withLabel={true} 
              secureTextEntry={!view2} 
              onChange={setPassword2} 
              value={password2} 
              name='Confirm Password' 
              icon={view2 ? 'eye-sharp' : 'eye-off'} 
              handleClickIcon={handleView2}
            />
            {
              error ?
                <ThemedText style={{color: '#972B21', fontStyle: 'italic', fontSize: 14, marginTop: 4}} type="default">
                    {error}
                </ThemedText>
              :
              <></>
            }
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.actionButtonText}> Submit </Text>
            </TouchableOpacity>
            
            <View style={styles.signUpContainer}>
              <ThemedText style={styles.signUp} type="title">Already have an account?</ThemedText>
              <Link href={'/login'} style={styles.link}>Sign in</Link>
            </View>
          </ScrollView>
        </Surface>
        <Loading spinner={spinner}/>
      </ThemeProvider>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 16,
    fontSize: 24,
    marginBottom: 16,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#136192',
    padding: 14,
    width: '100%',
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#ffff',
    fontSize: 16,
  },
  signUpContainer: {
    marginTop: 16,
    bottom: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexDirection: 'row',
  },
  signUp: {
    fontSize: 16,
    fontWeight: '400',
  },
  link: {
    textDecorationLine: 'underline',
  },
  input: {
    borderRadius: 8,
    marginLeft: 0,
    borderWidth: 1,
    borderColor: '#4545',
    width: '100%',
  },
});

export default Signup;

import { Link, Redirect, router, Stack } from 'expo-router';
import { BackHandler, Image, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';

import Loading from '@/components/Spinner';
import TextField from '@/components/TextField';
import TextInputIcon from '@/components/TextInputIcon';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Surface } from '@react-native-material/core';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '@/context/AuthContext';
import { AuthAction } from '@/reducer/AuthReducer';
import { API_METHOD, request } from '@/services/request';
import api from '@/services/api';
import { BEARER } from '@/services/axios';
import { Role, User } from '@/util/types';

import { useIsFocused } from '@react-navigation/native';
import { setLocalStorageItem } from '@/util';

const Login = () => {
  const { control, handleSubmit, formState: { errors } } = useForm();
  const colorScheme = useColorScheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [spinner, setSpinner] = useState(false);
  const [view, setView] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [error, setErrors] = useState('');
  const isFocused = useIsFocused();

  const { state, dispatch } = useContext(AuthContext);

  useEffect(() => {
    const backAction = () => {
      return isFocused;
    }

    console.log('isFocused', isFocused)
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isFocused]);

  const onSubmit = async () => {
    if (!username) {
      setErrors('Username is required!')
      return;
    } else if (!password) {
      setErrors('Password is required!')
      return;
    }
    
    setErrors('');
    setLocalStorageItem('token',null)
    setLocalStorageItem('user',null)

    setSpinner(true);
    try {
      const response = await request({
        url   : api.LOGIN,
        method: API_METHOD.POST,
        data  : { email: username, password: password }
      });
      
      const { data } = response;
      const userResponse = await getUserByToken(data.accessToken);
      const { data: userData } = userResponse;
      
      const roleResponse = await request({
        url: `${api.USER_API}/role/${userResponse.data.userId}`,
        method: API_METHOD.GET,
        headers: { Authorization: BEARER + data.accessToken }
      });
      const roleData = roleResponse.data;
      if (roleData.name !== 'CUSTOMER') {
        throw new Error('Invalid role');
      }

      dispatch({ type: AuthAction.LOGIN, payload: { token: data.accessToken, user: userData }});
      setLocalStorageItem('token',data.accessToken)
      setLocalStorageItem('user',userData)
      setTimeout(() => {
        setSpinner(false);
        router.replace('/(tabs)/(index)');
      }, 1000);
    } catch(e: any) {
      setErrors('Invalid email or password.');
    } finally {
      setSpinner(false);
    }
  };

  const getUserByToken = async (token: string) => {
    return request({
      url: api.USERS_BY_TOKEN,
      method: API_METHOD.GET,
      headers: { Authorization: BEARER + token }
    });
  };

  const handleView = () => setView(prev => !prev);

  return (
    <>
      <Stack.Screen options={{headerShown: false}} />
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Surface style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Image style={styles.logo} source={require('../assets/images/logo.png')} />
            <ThemedText style={styles.text} type="title">Login</ThemedText>
            <TextField 
              onChange={setUsername} 
              value={username} 
              name='Username'
              helperText='This field is required' 
              control={control} 
              isSubmit={isSubmit}
              errors={Boolean(errors.username)}
            />
            <TextInputIcon 
              withLabel={true} 
              secureTextEntry={!view} 
              onChange={setPassword} 
              value={password} 
              name='Password' 
              icon={view ? 'eye-sharp' : 'eye-off'} 
              handleClickIcon={handleView}
              />
            {
              error?
                <Text style={{color: '#972B21'}}>{error}</Text>
              :
              <></>
            }
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit(onSubmit)}>
              <Text style={styles.actionButtonText}>Submit</Text>
            </TouchableOpacity>
            <View>
              <Link href={'/forgot-password'} style={styles.link}>Forgot Password</Link>
            </View>
            <View style={styles.signUpContainer}>
              <ThemedText style={styles.signUp} type="title">Don't have an account?</ThemedText>
              <Link href={'/sign-up-otp'} style={styles.link}>Sign up</Link>
            </View>
          </ScrollView>
        </Surface>
        <Loading spinner={spinner}/>
      </ThemeProvider>
    </>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    position: 'relative',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 16,
    fontSize: 24,
    marginBottom: 16,
  },
  logo: {
    width: 150,
    height: 100,
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
    marginTop: 80,
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
});

export default Login;

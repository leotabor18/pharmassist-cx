import { Link, router, Stack } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View, ScrollView, ToastAndroid } from 'react-native';

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
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import StackScreen from '@/components/StackScreen';
import { API_METHOD, request } from '@/services/request';
import api from '@/services/api';
import { setLocalStorageItem } from '@/util';

const Profile = () => {
  const { control, handleSubmit, formState: { errors } } = useForm();

  const colorScheme = useColorScheme();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [spinner, setSpinner] = useState(false);

  const [view, setView] = useState(false);
  const [view2, setView2] = useState(false);

  const [isSubmit, setIsSubmit] = useState(false);

  const { state, dispatch } = useContext(AuthContext);

  const onSubmit = () => {
    setSpinner(true);
    setTimeout(() => {
      setSpinner(false);
      // dispatch({ type: AuthAction.LOGOUT})
      setLocalStorageItem('token',null)
      setLocalStorageItem('user',null)
      router.replace('/(tabs)/(index)/')
    }, 1000)
  }

  const handleView = () => {
    setView(prev => !prev);
  }

  const handleUpdate = async () => {
    setSpinner(true);
    try {
      const response = await request({
        url: api.USERS_API +'/' + state.user?.userId,
        method: API_METHOD.PATCH,
        data: {
          firstName,
          lastName
        },
      })
      dispatch({ type: AuthAction.UPDATE_ACCOUNT, payload: { user: { ...state.user, firstName, lastName } }});
      ToastAndroid.show('User has been successfully updated', ToastAndroid.SHORT )
    } catch {

    }
    setSpinner(false);
  }

  const handleView2 = () => {
    setView2(prev => !prev);
  }

  useEffect(() => {
    setFirstName(state.user?.firstName)
    setLastName(state.user?.lastName)
  }, []);

  return (
    <>
      <StackScreen title="Profile" animation="slide_from_right" headerBackVisible={false} />

      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Surface style={styles.container}>
          <ScrollView style={{    width: '100%', padding: 16}} contentContainerStyle={styles.scrollContent}>
            <TabBarIcon style={{fontSize: 70}} color={'#136192'} name={'person-circle-sharp'}/>
            <Text > Hi, {state.user?.firstName} {state.user?.lastName} </Text>
            <TextField onChange={setFirstName} value={firstName} name='First name' />
            <TextField onChange={setLastName} value={lastName} name='Last name' />
            {/* <TextInputIcon withLabel={true} secureTextEntry={!view} onChange={setPassword} value={password} name='Password' icon={view ? 'eye-sharp' : 'eye-off'} handleClickIcon={handleView}/>
            <TextInputIcon withLabel={true} secureTextEntry={!view2} onChange={setPassword2} value={password2} name='Confirm Password' icon={view2 ? 'eye-sharp' : 'eye-off'} handleClickIcon={handleView2}/> */}
            <TouchableOpacity style={styles.submitButton} onPress={handleUpdate}>
              <Text style={styles.actionButtonText}> Submit </Text>
            </TouchableOpacity>
            <View style={styles.underline}></View>
            <TouchableOpacity style={styles.logout} onPress={handleSubmit(onSubmit)}>
              <Text style={styles.actionButtonText}> Logout </Text>
            </TouchableOpacity>
          </ScrollView>
        </Surface>
        <Loading spinner={spinner}/>
      </ThemeProvider>
    </>
  )
}

const styles = StyleSheet.create({
  underline: {
    height: 1,
    width: '100%',
    backgroundColor: '#136192',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    margin: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
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
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#136192',
    padding: 14,
    width: '100%',
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 8
  },
  logout: {
    alignItems: 'center',
    backgroundColor: '#E40C0C',
    padding: 14,
    width: '100%',
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 8
  },
  actionButtonText: {
    color: '#ffff',
    fontSize: 16
  },
  signUpContainer: {
    position: 'absolute',
    bottom: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexDirection: 'row'
  },
  signUp: {
    fontSize: 16,
    fontWeight: '400'
  },
  link: {
    textDecorationLine: 'underline'
  }
});

export default Profile;

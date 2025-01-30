import { Link, router, Stack } from 'expo-router';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, NavigationContainer, ThemeProvider } from '@react-navigation/native';
import { Surface } from '@react-native-material/core';
import { useRef, useState } from 'react';
import TextField from '@/components/TextField';
import Spinner from 'react-native-loading-spinner-overlay';
import PhoneInput from 'react-native-phone-number-input';
import Loading from '@/components/Spinner';
import { API_METHOD, request } from '@/services/request';
import api from '@/services/api';


const SignUp = () => {
  const colorScheme = useColorScheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [spinner, setSpinner] = useState(false);
  const phoneInput = useRef(null)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const onChangeNumber = () => {

  }

  const isValidPhoneNumber = () => {
    return formattedPhoneNumber.startsWith("+639") && formattedPhoneNumber.length === 13;
  }

  const onChangeFormattedText = (code: string) => {
    setFormattedPhoneNumber(code);
  }

  const handleSubmit = async() => {
    setSpinner(true);

    if (!isValidPhoneNumber()) {
      setError('Invalid Phone number.');
      setSpinner(false);
      return;
    }

    try {
      const response = await request({
        url:  api.OTP_VERIFY,
        method: API_METHOD.POST,
        data: {
          number: formattedPhoneNumber
        }
      });

      if (!response.data.code) {
        setError('Phone number already exist');
        setSpinner(false);
        return;
      }

      console.log('response', response.data.code)
      router.replace({pathname: '/otp-register', params: {code : response.data.code, phoneNumber:  response.data.number } })
    } catch {

    }
    setSpinner(false);
  }

  return (
    <>
      <Stack.Screen options={{headerShown: false}} />
      <ThemeProvider  value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Surface style={styles.container} >
          <Image
            style={styles.logo}
            source={require('../assets/images/logo.png')}
          />
           <ThemedText style={styles.text} type="title">Create an account</ThemedText>
           <PhoneInput
              ref={phoneInput}
              defaultValue={phoneNumber}
              defaultCode={"PH"}
              layout="first"
              value={phoneNumber}
              onChangeText={onChangeNumber}
              onChangeFormattedText={onChangeFormattedText}
              withDarkTheme
              withShadow
              autoFocus
              textContainerStyle={styles.input}
              // textInputStyle={{ padding: 0, margin: 0}}
              containerStyle={{ padding: 0, margin: 0, width: '100%'}}
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
              <Text style={styles.actionButtonText}> Next </Text>
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
          <ThemedText style={styles.signUp} type="title">Already have an accoun?</ThemedText>
          <Link href={'/login'} style={styles.link}>Sign in</Link>
          </View>
          {/* <ThemedText type="title">Search Medicine</ThemedText> */}
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
  spinnerTextStyle: {
    color: '#fff'
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
  actionButtonText : {
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
    fontWeight: 400
  },
  link: {
    textDecorationLine: 'underline'
  },
  input: {
    borderRadius: 8,
    marginLeft: 0,
    width: '100%',
  },
});

export default SignUp
import { router, Stack } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Loading from '@/components/Spinner';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Surface } from '@react-native-material/core';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useRef, useState } from 'react';
import PhoneInput from 'react-native-phone-number-input';
import api from '@/services/api';
import { API_METHOD, request } from '@/services/request';

const ForgotPassword = () => {
  const colorScheme = useColorScheme();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');

  const [error, setError] = useState('');
  const [spinner, setSpinner] = useState(false);
  const phoneInput = useRef(null)
  const onChangeNumber = (code: string) => {
    setPhoneNumber(code);
  }

  const onChangeFormattedText = (code: string) => {
    setFormattedPhoneNumber(code);
  }


  const isValidPhoneNumber = () => {
    return formattedPhoneNumber.startsWith("+639") && formattedPhoneNumber.length === 13;
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
        url:  api.OTP_FORGOT,
        method: API_METHOD.POST,
        data: {
          number: formattedPhoneNumber
        }
      });
      if (!response.data.code) {
        setError('Invalid Phone number.');
        setSpinner(false);
        return;
      }

      console.log('response', response.data.userId)
      router.replace({pathname: '/otp', params: {code : response.data.code, phoneNumber:  response.data.number, userId: response.data.userId } })
    } catch {

    }
    setSpinner(false);
  }

  const handleCancel = () => {
    router.replace('/login')
  }

  return (
    <>
      <Stack.Screen options={{headerShown: false}} />
      <ThemeProvider  value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Surface style={styles.mainContainer} >
          <Image
            style={styles.logo}
            source={require('../assets/images/logo.png')}
          />
           <ThemedText style={[styles.text, {color: '#000'}]} type="title">Forgot Password</ThemedText>
            <View style={styles.container}>
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
                textContainerStyle={styles.input2}
                // textInputStyle={{ padding: 0, margin: 0}}
                containerStyle={{ padding: 0, margin: 0, width: '100%'}}
              />
            </View>
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
            <Loading spinner={spinner}/>
        </Surface>
      </ThemeProvider>
    </>
  )
}
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  focusStick: {
    borderColor: '#136192'
  },
  activePinCodeContainer: {
    borderColor: '#136192'
  },
  pinCodeContainer: {
    // borderColor: '#136192'
  },
  containerStyle: {
    width: 250
  },
  container: {
  },
  text: {
    marginTop: 16,
    fontSize: 24,
    marginBottom: 16
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  logo: {
    width: 150,
    height: 100,
  },
  input: {
    borderRadius: 8,
    marginLeft: 0,
    borderWidth: 1,
    borderColor: '#4545',
    padding: 10,
  },
  actionButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
    width: '100%',
    padding: 16
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    width: 150
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
  input2: {
    borderRadius: 8,
    marginLeft: 0,
    width: '100%',
  },
});

export default ForgotPassword
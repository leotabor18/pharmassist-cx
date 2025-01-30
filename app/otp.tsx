import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet, ToastAndroid, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Surface } from '@react-native-material/core';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useState } from 'react';
import { OtpInput } from 'react-native-otp-entry';
import Loading from '@/components/Spinner';
import { OTPParamsProps } from './otp-register';


const Otp = () => {
  const colorScheme = useColorScheme();
  const [code, setCode] = useState('');
  const [spinner, setSpinner] = useState(false);
  const [error, setError] = useState(false);

  const item: OTPParamsProps = useLocalSearchParams();

  const onSubmitOtp = (code: string) => {
    setSpinner(true);
    setTimeout(() => {
      if (code === item.code?.toString()) {
        router.push({pathname: '/new-password', params: { userId: item.userId }})
        ToastAndroid.show("Phone number Verified!", ToastAndroid.SHORT)
      } else {
        setError(true)
      }
      setSpinner(false);
    }, 1000)
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
           <ThemedText style={styles.text} type="title">Forgot Password</ThemedText>
           <ThemedText style={styles.description} type='subtitle'>OTP is sent to your registered mobile number</ThemedText>
           <View style={styles.container}>
            {/* <OtpInputs
                handleChange={onChangeNumber}
                numberOfInputs={6}
                autofillFromClipboard={false}
                /> */}
              <OtpInput
                numberOfDigits={6}
                focusColor="green"
                focusStickBlinkingDuration={500}
                onTextChange={setCode}
                onFilled={onSubmitOtp}
                textInputProps={{
                  accessibilityLabel: "One-Time Password",
                }}
                theme={{
                  containerStyle: styles.containerStyle,
                  pinCodeContainerStyle: styles.pinCodeContainer,
                  // pinCodeTextStyle: styles.pinCodeText,
                  focusStickStyle: styles.focusStick,
                  focusedPinCodeContainerStyle: styles.activePinCodeContainer,
                }}
              />
              <Loading spinner={spinner}/>
            </View>
            {
              error ?
                <ThemedText style={{color: '#972B21', fontStyle: 'italic', fontSize: 14, marginTop: 4}} type="default">
                    Invalid OTP
                </ThemedText>
              :
              <></>
            }
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
    margin: 4
    // borderColor: '#136192'
  },
  containerStyle: {
    width: 'auto'
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    gap: 16
  },
  description: {
    fontWeight: '400',
    fontSize: 16,
    marginBottom: 16
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
});

export default Otp
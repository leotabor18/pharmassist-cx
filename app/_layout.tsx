import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Link, Redirect, router, Stack, useRootNavigationState, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedView } from '@/components/ThemedView';
import { Surface } from '@react-native-material/core';
import { ThemedText } from '@/components/ThemedText';
import { Image, StyleSheet } from 'react-native';
import AuthContextProvider from '@/context/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 5000);
    }
  }, [loaded]);

  // if (!loaded) {
  //   return (
  //     <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
  //       <Surface style={styles.container} >
  //         <Image
  //           style={styles.logo}
  //           source={require('../assets/images/logo.png')}
  //         />
  //       </Surface>
  //     </ThemeProvider>
  //   );;
  // }

  return (
    <AuthContextProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ animation: 'default'}} >
          <Stack.Screen name='(tabs)' options={{ headerShown: false, animation: 'slide_from_left' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </AuthContextProvider>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 200,
    height: 150
  },
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '90%'
  }
});
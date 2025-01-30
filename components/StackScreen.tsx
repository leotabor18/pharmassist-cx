import { Stack } from 'expo-router';
import React, { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { StackAnimationTypes } from 'react-native-screens';

type StackScreenProps = {
  title?: string;
  animation: StackAnimationTypes;
  headerBackVisible: boolean;
  headerLeft?: () => ReactNode;
};

const StackScreen = (props: StackScreenProps) => {
  return (
    <Stack.Screen
      options={{
        animation: props.animation,
        headerShown: true,
        title: props.title,
        headerBackVisible: props.headerBackVisible,
        headerStyle: styles.appBar, // This only sets the background color
        headerTitleStyle: styles.headerTitle, // Title style with color
        headerLeft: props.headerLeft,
        headerTintColor: '#ffffff', // Fixed color for the back button/icon
      }}
    />
  );
};

const styles = StyleSheet.create({
  appBar: { 
    // padding: 16, 
    backgroundColor: '#136192' // Background color of the header
  },
  headerTitle: {
    color: '#ffffff', // Title color
  },
  headerBackTitleStyle: {
    color: '#ffffff', // Color for the back button text
  },
});

export default StackScreen;

import { Tabs } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { router, Stack } from 'expo-router'
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const { state } = useContext(AuthContext);
  const colorScheme = useColorScheme();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !state.token) {
      router.push('/login');
    }
  }, [state.token, isMounted]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarStyle: {paddingBottom: 5, height: 60}
      }}>
      <Tabs.Screen
        
        name="(index)"
        options={{
          href: '/(index)/',
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon style={{color: '#136192'}} name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(cart)"
        options={{
          href: '/(cart)/',
          title: 'My Items',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon style={{color: '#136192'}} name={focused ? 'cart' : 'cart-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(chats)"
        options={{
          href: '/(chats)/',
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon style={{color: '#136192'}} name={focused ? 'chatbox-ellipses' : 'chatbox-ellipses-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon style={{color: '#136192'}} name={focused ? 'person-circle-sharp' : 'person-circle-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

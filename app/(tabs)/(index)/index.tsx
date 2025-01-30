import { Alert, StyleSheet, ToastAndroid, TouchableHighlight, View } from 'react-native';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import Loading from '@/components/Spinner';
import StackScreen from '@/components/StackScreen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AuthContext } from '@/context/AuthContext';
import { Redirect, router } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { setLocalStorageItem } from '@/util';
import { AuthAction } from '@/reducer/AuthReducer';

const HomeScreen = () => {
  const [spinner, setSpinner] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const { state, dispatch } = useContext(AuthContext);

  const handlePharmacy = () => {
    setSpinner(true);
    setTimeout(() => {
      setSpinner(false);
    }, 1000)
    router.push('/(tabs)/(index)/pharmacies');
  }

  const handleReservation = () => {
    setSpinner(true);
    setTimeout(() => {
      setSpinner(false);
    }, 1000)
    router.push('/(tabs)/(index)/reservations');
  }
  
  const handleMedicine = () => {
    setSpinner(true);
    setTimeout(() => {
      setSpinner(false);
    }, 1000)
    router.push('/(tabs)/(index)/medicines');
  }

  useEffect(() => {
    async function getCurrentLocation() {
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        ToastAndroid.show('Permission to access location was denied', ToastAndroid.SHORT);
        setLocalStorageItem('user', null);
        setLocalStorageItem('token', null);

        router.push('/login')
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      const newLoc = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }
      dispatch({ type: AuthAction.UPDATE_ACCOUNT, payload: { user: { ...state.user, location: newLoc } }});
      
    }

    getCurrentLocation();
  }, []);

  return (
    <>
      <StackScreen title={`Welcome, ${state.user?.firstName} ${state.user?.lastName}`} animation='slide_from_left' headerBackVisible={false}/>
      <ThemedView style={styles.titleContainer}>
        <TouchableHighlight underlayColor='#E5F1FD' style={[styles.card, styles.shadowProp]} onPress={handlePharmacy}>
            <View style={styles.buttonTileContainer}>
              <TabBarIcon style={{color: '#136192'}}  name={'storefront'}/>
              <ThemedText style={styles.buttonText} type="title">Find Pharmacies</ThemedText>
            </View>
        </TouchableHighlight>
        <TouchableHighlight underlayColor='#E5F1FD' style={[styles.card, styles.shadowProp]} onPress={handleMedicine}>
            <View style={styles.buttonTileContainer}>
              <TabBarIcon style={{color: '#136192'}}  name={'medkit-sharp'}/>
              <ThemedText style={styles.buttonText} type="title">Search Medicine</ThemedText>
            </View>
        </TouchableHighlight>
        <TouchableHighlight underlayColor='#E5F1FD' style={[styles.card, styles.shadowProp]} onPress={handleReservation}>
            <View style={styles.buttonTileContainer}>
              <TabBarIcon style={{color: '#136192'}} name={'calendar'}/>
              <ThemedText style={styles.buttonText} type="title">My Reservations</ThemedText>
            </View>
        </TouchableHighlight>
        {/* <TouchableHighlight underlayColor='#E5F1FD' style={[styles.card, styles.shadowProp]} onPress={handleHospital}>
            <View style={styles.buttonTileContainer}>
              <TabBarIcon style={{color: '#136192'}}  name={'business-sharp'}/>
              <ThemedText style={styles.buttonText} type="title">Search Hospitals</ThemedText>
            </View>
        </TouchableHighlight> */}
        <Loading spinner={spinner}/>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  text: {
    color: '#ffff' 
  },
  buttonText: {
    color: '#136192' ,
    fontSize: 24
  },
  buttonTileContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#E5F1FD',
    height: '100%',
    gap: 8,
    padding: 32,
    borderRadius: 24
  },
  shadowProp: {
    elevation: 20,
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 24,
    paddingHorizontal: 25,
    width: '100%',
    marginVertical: 10,
  },
});

export default HomeScreen;

import Pharmacies from '@/components/Pharmacies';
import Loading from '@/components/Spinner';
import StackScreen from '@/components/StackScreen';
import TextInputIcon from '@/components/TextInputIcon';
import { ThemedView } from '@/components/ThemedView';
import { AuthContext } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import api from '@/services/api';
import { API_METHOD, request } from '@/services/request';
import { Surface } from '@react-native-material/core';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import moment from 'moment';
import { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { LatLng, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { SearchMedicinceProps } from './medicines';

// 15.041935013177062, 120.68319041108478

const initialRegion={
  latitudeDelta : 0.09,
  longitudeDelta : 0.09,
}

export type HrefProps = {
  href: string
}

export type LinkProps = {
  self: HrefProps
  store: HrefProps
  products: HrefProps
  user: HrefProps
}

type StoreProps = {
  storeId: number
  name: string
  isReservationActivated: number
  firstAddress: string
  secondAddress: string
  city: string
  state: string
  phoneNumber: number
  pinLocation: string
  isOpen: number
  _links: LinkProps
}

export type OpeningHoursProps = {
  storeId: number,
  day: string,
  fromHour: string,
  fromMinute: string,
  untilHour: string,
  untilMinute: string,
}

export type MarkersProp = {
  title: string
  description: string
  latLng: LatLng
}

const FindPharmacy = () => {
  const colorScheme = useColorScheme();
  const [spinner, setSpinner] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [onMapPress, setOnMapPress] = useState(false);
  const [data, setData] = useState<StoreProps[]>([]);

  const [markers, setMarkers] = useState<MarkersProp[]>([])

  const mapHeight = useRef(new Animated.Value(80)).current; // Initial height is 80%
  const { state } = useContext(AuthContext);

  const location = {
    ...initialRegion, 
    longitude: state.user?.location?.longitude ?? 15.041935013177062, 
    latitude: state.user?.location?.latitude ?? 120.68319041108478
  }

  const onRegionChange = (region: any) => {

  }

  const handlePress = () => {
    Animated.timing(mapHeight, {
      toValue: onMapPress ? 200 : 80, // Toggle between 80% and 200%
      duration: 300, // Duration of the animation in milliseconds
      useNativeDriver: false, // Since we're animating height, we cannot use native driver
    }).start();
    setOnMapPress(prev => !prev)
  };

  const getUrl = () => {
    let url = api.STORE_API;
    if (keyword) {
      url = api.STORE_API + '/search/findByNameContaining';
    }

    return url
  }

  const isStoreOpenToday = (storeHours: OpeningHoursProps): boolean => {
    const today = moment().format('dddd'); // Get today's day as full name, e.g., "Monday"

    if (storeHours.day !== today) {
      return false;
    }
  
    const currentTime = moment();
    const openTime = moment(storeHours.fromHour).set({
        year: currentTime.year(),
        month: currentTime.month(),
        date: currentTime.date(),
      });
      const closeTime = moment(storeHours.untilHour).set({
        year: currentTime.year(),
        month: currentTime.month(),
        date: currentTime.date(),
      });
  
    return currentTime.isBetween(openTime, closeTime, undefined, '[)');
  }

  const getData = async() => {
    setSpinner(true);
  
    let params: SearchMedicinceProps = {
      size: 100000,
    }

    if (keyword) {
      params = {
        ...params,
        name: keyword
      }
    }
    try {
      const response = await request({
        url   : getUrl(),
        method: API_METHOD.GET,
        params: params
      });
  
      const { data } = response;
  
      const newStores = await Promise.all(data._embedded.stores.map(async (store: StoreProps) => {
        const id = store._links.self.href.replace(`${api.STORE_API}/`, '')

        const openingHours = await request({
          url:  api.OPENING_HOURS_API + '/search/findByStoreStoreId',
          method: API_METHOD.GET,
          params: {
            storeId: id
          }
        });
        const currentDay = moment().format('dddd')
        console.log('CurrentDay', currentDay);

        let isOpen = false;

        const foundDay = openingHours.data._embedded.openingHours.find((item: OpeningHoursProps) => item.day == currentDay);
        if (foundDay) {
          isOpen = isStoreOpenToday(foundDay)
        }

        console.log('isOpen', isOpen)
        return {
          ...store,
          isOpen: isOpen,
          storeId: id
        }
      }));

      const locations = newStores.map((item: StoreProps): MarkersProp => {
        const pin = item.pinLocation?.split(',')
        if (pin && pin.length > 1) {
          const latitude = pin[0]?.replace('lat:', '')?.trim()
          const longitude = pin[1]?.replace('lng:', '')?.trim()
          const loc = {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
          }
          return {
            title: item.name,
            description: `${item.firstAddress}, ${item.secondAddress}, ${item.city}`,
            latLng: loc
          }
        }

        const newloc = {
          latitude: 120.68319041108478,
          longitude: 15.041935013177062
        }
        return {
          title: item.name,
          description: `${item.firstAddress}, ${item.secondAddress}, ${item.city}`,
          latLng: newloc
        }
      })
      setMarkers(locations)
      setData(newStores);
      setSpinner(false);
    } catch {
      setSpinner(false);
    }

  }

  console.log('LOCATIONS ---------- ', markers)
  useEffect(() => {
    getData();
  }, [keyword])
  

  return (
    <>
     <StackScreen title='Find Pharmacies' animation='slide_from_right' headerBackVisible={true}/>
    {/* <Stack.Screen options={{animation: 'slide_from_right', headerShown: true, title: 'Find Pharmacies', headerLeft: }} /> */}
      <ThemeProvider  value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* <SafeAreaView style={{ flex: 1 }}> */}
        <Surface style={styles.container} >
          <Animated.View style={[styles.map, 
          { height: mapHeight.interpolate({
            inputRange: [80, 200],
            outputRange: ['80%', '200%'], // Change these to percentages
          })}
          ]}>
            <MapView provider={PROVIDER_GOOGLE} onRegionChange={onRegionChange} initialRegion={location} style={styles.mapPress} onPress={handlePress}>
                  <Marker
                    coordinate={location}
                    title={'My Location'}
                    description={''}
                  >
                    <Image source={require('../../../assets/images/location.png')} style={{height: 35, width:35 }} />
                  </Marker>
              {
                markers.map((item, index) => {
                  return (
                    <View key={index}>
                      <Marker
                          key={index}
                          coordinate={item.latLng}
                          title={item.title}
                          description={item.description}
                      >
                        <Image source={require('../../../assets/images/store.png')} style={{height: 35, width:35 }} />
                      </Marker>
                      <MapViewDirections
                        origin={location}
                        destination={item.latLng}
                        apikey={'AIzaSyArqkzzkg1IJoYt0qd69tIJs4N5LP1yXws'}
                        strokeColor='#136192'
                        strokeWidth={5}
                      />
                    </View>
                  )
                })
              }
            </MapView>
          </Animated.View>
          <ThemedView style={styles.titleContainer}>
            <View style={styles.content}>
              <TextInputIcon withLabel={false} secureTextEntry={false} onChange={setKeyword} value={keyword} name='Search Pharmacy' icon={'close-outline'} handleClickIcon={() => setKeyword('')}/>
            </View>
            <View style={styles.scrollView}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {
                  data.map((store, index) => (
                    <Pharmacies id={store.storeId} key={index} name={store.name} address={`${store.firstAddress}, ${store.secondAddress}, ${store.city}`} status={store.isOpen ? 'Open': 'Closed'}/>
                  ))
                }   
                {
                  !spinner && data.length === 0 ?
                  <Text style={{ textAlign: 'center', fontStyle: 'italic'}}> No data found </Text>
                :
                  <></>
                }
              </ScrollView>
            </View>
          </ThemedView>
          <Loading spinner={spinner}/>
        </Surface>
      {/* </SafeAreaView> */}
    </ThemeProvider>
    </>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#E5F1FD',
    // height: 100
    // marginBottom: 165
  },
  map: {
    width: '100%',
    height: '80%',
  },
  mapPress: {
    width: '100%',
    height: '200%',
  },
  content: {
    width: '100%',
    // marginTop: -16,
    backgroundColor: '#E5F1FD',
    marginBottom: 8
  },
  text: {
    marginTop: 16,
    fontSize: 24,
    marginBottom: 16
  },
  headerImage: {
    color: '#808080',
    // bottom: -60,
    // left: -35,
    position: 'absolute',
  },
  scrollView: {
    marginTop: 0,
    // paddingTop: StatusBar.currentHeight,
    marginBottom: 300,
    height: '50%'
  },
  titleContainer: {
    flexDirection: 'column',
    width: '100%',
    backgroundColor: '#E5F1FD',
    padding: 16,
  },
});

export default FindPharmacy
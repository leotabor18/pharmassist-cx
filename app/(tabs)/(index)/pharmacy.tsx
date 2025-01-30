import MapIcon from '@/components/MapIcon';
import PharmacyItem from '@/components/PharmacyItem';
import Loading from '@/components/Spinner';
import StackScreen from '@/components/StackScreen';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Surface } from '@react-native-material/core';
import { DarkTheme, DefaultTheme, ThemeProvider, useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from "react-native-modal";

import Product from '@/components/product';
import { AuthContext } from '@/context/AuthContext';
import api from '@/services/api';
import { API_METHOD, request } from '@/services/request';
import moment from 'moment';
import MapView, { LatLng, Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import MapViewDirections, { MapViewDirectionsDestination, MapViewDirectionsOrigin } from 'react-native-maps-directions';
import { LinkProps, MarkersProp, OpeningHoursProps } from './pharmacies';

// 15.041935013177062, 120.68319041108478
// 15.041608335805867, 120.68286587087663
const initialRegion ={
  latitudeDelta : 0.005,
  longitudeDelta : 0.005,
  longitude: 120.68286587087663,
  latitude: 15.041608335805867
}

const initialRegion2 : PinProps2 ={
  latitudeDelta : 0.005,
  longitudeDelta : 0.005,
  longitude: 120.68286587087663,
  latitude: 15.041608335805867
}

type PinProps = {
  latitudeDelta: number 
  longitudeDelta: number 
  longitude: any
  latitude: any
}

type PinProps2 = {
  latitudeDelta: number 
  longitudeDelta: number 
  longitude: number
  latitude: number
}

export type StoreProps = {
  storeId: number
  name: string
  isReservationActivated: number
  firstAddress: string
  secondAddress: string
  city: string
  state: string
  phoneNumber: number
  pinLocation: string
  qrCode: string
}

export type ProductItemProps = {
  name: string
	genericName: string
	description: string
	image: string
	productNumber: string
	price: number
	status: number
	type: string
	storeId: number
	stock: number
	criticalLevel: number
	withPrescription: number
  store: StoreProps
  _links: LinkProps
}

export type IdProps = {
  id?: string
  transactionId?: string
  time?: Date | undefined
  date?: Date | undefined
}

const Pharmacy = () => {
  const colorScheme = useColorScheme();
  const [spinner, setSpinner] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [onMapPress, setOnMapPress] = useState(false);
  const [labelactive, setLabelActive] = useState(true);
  const [withPrescriptionActive, setWithPrescriptionActive] = useState(false);
  
  const item: IdProps = useLocalSearchParams();

  const [store, setStore] = useState<StoreProps>();

  const [openModal, setOpenModal] = useState(false);

  const [selectedItem, setSelectedItem] = useState<ProductItemProps>();

  const mapHeight = useRef(new Animated.Value(80)).current; // Initial height is 80%
  const [products, setProducts] = useState<ProductItemProps[]>([]);
  
  const [operationHours, setOperationHours] = useState<String>('');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');

  const [pin, setPin] = useState<LatLng>(initialRegion)
  const [pin2, setPin2] = useState<PinProps2>(initialRegion2)
  const handleBack = () => {
    router.replace('/(tabs)/(index)/pharmacies');
  }
  
  const { state } = useContext(AuthContext);
  
  const location = {
    ...initialRegion, 
    // longitude: state.user?.location?.longitude, 
    // latitude: state.user?.location?.latitude
    longitude: 120.6788089460983, 
    latitude: 15.04112843305177
  }
  const [origin, setOrigin] = useState<MapViewDirectionsOrigin>(location);

  const handeSearch = () => {

  }

  const onRegionChange = (region: any) => {
    // console.log('region',region)
  }

  const handlePress = () => {
    Animated.timing(mapHeight, {
      toValue: onMapPress ? 200 : 80, // Toggle between 80% and 200%
      duration: 300, // Duration of the animation in milliseconds
      useNativeDriver: false, // Since we're animating height, we cannot use native driver
    }).start();
    setOnMapPress(prev => !prev)
  };

  const handleLabel = () => {
    setLabelActive(true);
    setWithPrescriptionActive(false);
    setSpinner(true);
    setTimeout(() => {
       setSpinner(false);
    }, 1000)
  }

  const handleWithPrescription = () => {
    setWithPrescriptionActive(true);
    setLabelActive(false);
    setSpinner(true);
    setTimeout(() => {
      setSpinner(false);
    }, 1000)
  }

  const handleOpenItem = (value: ProductItemProps) => {
    setSelectedItem(value);

    setOpenModal(prev => !prev);
  }
  const handleCancel = () => {
    setOpenModal(false);
  }

  const onSwipeMove = (percentage: number) => {
    if (Math.floor(percentage * 100) < 15) {
      setOpenModal(false);
    } 
  }
  const deviceWidth = Dimensions.get("window").width;

  const getOperatingHoursToday = (storeHours: OpeningHoursProps): string => {
    const today = moment().format('dddd'); // Get today's day as full name, e.g., "Monday"
  
    // Check if today matches the store's operating day
    if (storeHours.day !== today) {
      return "Closed today";
    }
  
    // Parse fromHour and untilHour as times for display
    const openTime = moment(storeHours.fromHour).format('h:mm A'); // e.g., "8:00 AM"
    const closeTime = moment(storeHours.untilHour).format('h:mm A'); // e.g., "5:00 PM"
  
    return `Open: ${openTime} - ${closeTime}`;
  }

  function decimalPlaces(floatStr: string): number {
    // Split the input string into integer and fractional parts
    const [integerPart, decimalPart = ""] = floatStr.split(".");
  
    // Parse the integer part as a number
    const integerNumber = parseInt(integerPart, 10);
  
    // Extract the desired length of the fractional part and parse it as a number
    const fractionalNumber = parseInt(decimalPart.slice(0, 20).padEnd(20, "0"), 10);
  
    // Combine integer and fractional parts without string concatenation
    const divisor = Math.pow(10, 20); // Adjust for the fractional part's place value

    return integerNumber + fractionalNumber / divisor;
  }

  const getData = async() => {
    setSpinner(true);
    try {
      const response = await request({
        url   : api.STORE_API + '/' + item.id,
        method: API_METHOD.GET,
        params: {
          size: 100000
        }
      });
  
      const { data } = response;
  
      const openingHours = await request({
        url:  api.OPENING_HOURS_API + '/search/findByStoreStoreId',
        method: API_METHOD.GET,
        params: {
          storeId: item.id
        }
      });
  
      const pin = data.pinLocation?.split(',')
      if (pin && pin.length > 1) {
        const latitude = pin[0]?.replace('lat:', '')?.trim()
        const longitude = pin[1]?.replace('lng:', '')?.trim()
        
        const latitude2 = pin[0]?.replace('lat:', '')?.trim()
        const longitude2 = pin[1]?.replace('lng:', '')?.trim()
  
        setPin({ ...initialRegion, latitude: parseFloat(latitude), longitude: parseFloat(longitude)})
        setPin2({ ...initialRegion, latitude: latitude2, longitude: longitude2})
      } else {
        setPin({latitude: initialRegion.latitude, longitude: initialRegion.longitude})
      }
      const currentDay = moment().format('dddd')
  
      const foundDay = openingHours.data._embedded.openingHours.find((item: OpeningHoursProps) => item.day == currentDay);
      let operation = 'Closed Today'
      if (foundDay) {
        operation = getOperatingHoursToday(foundDay);
      }
      
      setOperationHours(operation)
      setStore(data);
  
      setSpinner(false);
    } catch(e) {
      console.log('Error', e)
    }finally {
      setSpinner(false);
    }
  }

  const getProductData = async() => {
    setSpinner(true);
  
    const secondResponse = await request({
      url   : api.PRODUCT_ITEMS_API + '/search/findAllStoreIdAndWithPrescription',
      method: API_METHOD.GET,
      params: {
        storeId: item.id,
        pres: labelactive ? 0 : 1
      }
    });

    const newProductItems = secondResponse.data._embedded.productItems.map((item: ProductItemProps) => {
      const id = item._links.self.href.replace(`${api.PRODUCT_ITEMS_API}/`, '')
      return {
        ...item,
        productItemId: id
      }
    })

    setProducts(newProductItems);
    setSpinner(false);
  }

  const isFocused = useIsFocused();

  useEffect(() => {
    getData();
  }, [isFocused])

  useEffect(() => {
    getProductData();
  }, [labelactive, isFocused])

  const handleClick = async() => {
    setSpinner(true);
    try{
      const response = await request({
        url:  api.CHAT_ROOM_API + '/findByUserId',
        method: API_METHOD.POST,
        data: {
          storeId: item.id,
          userId: state.user?.userId
        }
      });

      const { data } = response;
      router.push({ pathname: '/(chats)/chat', params: { id: data.chatRoomId }});
  
    }catch{

    }
    setSpinner(false);
  }

  console.log('Pin', pin)
  
  return (
    <>
     <StackScreen title={store?.name} animation='slide_from_right' headerBackVisible={true}/>
    
      <ThemeProvider  value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* <SafeAreaView style={{ flex: 1 }}> */}
        <Surface style={styles.container} >
          <Animated.View style={[styles.map, { height: mapHeight.interpolate({
            inputRange: [80, 200],
            outputRange: ['80%', '200%'], // Change these to percentages
          })}]}>
            <MapView provider={PROVIDER_GOOGLE} initialRegion={location} onRegionChange={onRegionChange} style={styles.mapPress} onPress={handlePress}>
                  <Marker
                    coordinate={location}
                    title={'My Location'}
                    description={`${store?.firstAddress}, ${store?.secondAddress}, ${store?.city}`}
                  >
                    <Image source={require('../../../assets/images/location.png')} style={{height: 35, width:35 }} />
                  </Marker>
                <Marker
                  coordinate={pin}
                  title={store?.name}
                  description={''}
                >
                  <Image source={require('../../../assets/images/store.png')} style={{height: 35, width:35 }} />
                </Marker>
                { 
                  pin ?
                  <MapViewDirections
                    origin={location}
                    destination={pin}
                    apikey={'AIzaSyArqkzzkg1IJoYt0qd69tIJs4N5LP1yXws'}
                    strokeColor='#136192'
                    strokeWidth={5}
                    onReady={result => {
                      console.log(`Distance: ${result.distance} km`);
                      console.log(`Duration: ${result.duration} min.`);
                      setDistance(`${result.distance} km`);
                      setDuration(`${result.duration.toFixed(2)} min.`);
                      // this.mapView.fitToCoordinates(result.coordinates, {
                      //   edgePadding: {
                      //     right: width / 20,
                      //     bottom: height / 20,
                      //     left: width / 20,
                      //     top: height / 20
                      //   }
                      // });
                    }}
                  />
                  :<></>
                }
            </MapView>
            <View style={styles.overlayContainer}>
              <LinearGradient
                  colors={['rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0.8)']} 
                  style={styles.overlay}
              >
                <Text style={[styles.overlayText, styles.overLayTitlte]}>{store?.name} </Text>
                <Text style={[styles.overlayText, styles.overLayDescription]}>{store?.firstAddress}, {store?.secondAddress}, {store?.city}</Text>
                <View style={styles.mapContainer}>
                  <View style={styles.mapIcon}>
                    {
                      operationHours ?
                      <MapIcon icon='time' name={operationHours} isOpen={!Boolean(operationHours.includes('Closed'))}/>
                      : <></>
                    }
                  </View>
                  <View style={styles.mapIcon}>
                    <MapIcon icon='map' name={distance} isOpen={true}/>
                    <MapIcon icon='walk-outline' name={duration} isOpen={true}/>
                    <MapIcon icon='chatbox' name={'Chat'} isOpen={true} onClick={handleClick}/>
                    {/* <MapIcon icon='map-outline' name={'0.5 km'}/> */}
                  </View>
                  {/* <StarRating
                    // style={styles.rightContent}
                    starStyle={styles.star}
                    rating={4.5}
                    starSize={18}
                    onChange={() => {}}
                  /> */}
                </View>
              </LinearGradient>
            </View>
          </Animated.View>
          <ThemedView style={styles.titleContainer}>
            <View style={styles.actionButton}>
              <TouchableOpacity
                  style={[styles.label, styles.optionButton, labelactive ? styles.active : styles.inactive]}
                  onPress={handleLabel}
                >
                  <Text style={labelactive ? styles.activeText : styles.inactiveText}> Label </Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={[styles.withPrescription, styles.optionButton, withPrescriptionActive ? styles.active : styles.inactive2]}
                  onPress={handleWithPrescription}
                >
                  <Text style={withPrescriptionActive ? styles.activeText : styles.inactiveText}> With Prescription </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.scrollView}>
              <ScrollView showsVerticalScrollIndicator={false}>
              {
                  products.map((item, index) => (
                    <PharmacyItem price={item.price} key={index} name={item.name} description={item.description} handlePharmacyItem={() => handleOpenItem(item)}/>
                  ))
              }
              {
                !spinner && products.length === 0 ?
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
    <Modal onSwipeMove={onSwipeMove} isVisible={openModal} deviceWidth={deviceWidth} swipeDirection={'down'} backdropTransitionOutTiming={1} swipeThreshold={1}>
      <Product handleCancel={handleCancel} selectItem={selectedItem}/>
    </Modal>
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
    backgroundColor: '#E5F1FD',
    marginTop: -16,
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
  titleContainer: {
    flexDirection: 'column',
    width: '100%',
    backgroundColor: '#E5F1FD',
    padding: 16,
    // gap: 8,
  },
  scrollView: {
    marginTop: 8,
    // paddingTop: StatusBar.currentHeight,
    marginBottom: 250,
    height: '50%'
  },
  actionButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    width: '100%',
    padding: 16,
    paddingBottom: 0
  },
  optionButton: {
    padding: 14,
    width: 170,
    display: 'flex',
    alignItems: 'center',
    borderColor: '#0000',
    borderRadius: 24,  
    backgroundColor: '#DDDDDD',
  },
  label: {
    borderBottomEndRadius: 0,
    borderTopEndRadius: 0
  },
  withPrescription: {
    borderBottomStartRadius: 0,
    borderTopStartRadius: 0
  },
  inactiveButton: {
    color: '#ffff',
  },
  active :{
    backgroundColor: '#136192',
    borderWidth: 1,
    borderColor: '#136192',
    borderEndWidth:0 
  },
  inactive :{
    backgroundColor: '#ffff',
    borderWidth: 1,
    borderColor: '#000',
    borderEndWidth:0 
  },
  inactive2 :{
    backgroundColor: '#ffff',
    borderWidth: 1,
    borderColor: '#000',
    borderStartWidth:0 
  },
  activeText :{
    color: '#ffff'
  },
  inactiveText: {

  },
  overlayContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%'
  },
  overlay: {
    width: '100%',
    padding: 18,
    paddingHorizontal: 8,
    paddingTop: 40
  },
  overlayText: {
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 1)', // Yellow shadow
    textShadowOffset: { width: 0.5, height: 1 }, // Shadow offset
    textShadowRadius: 3, // Shadow blur
  },
  overLayTitlte: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 1
  },
  overLayDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1
  },
  mapContainer: {
    // flexDirection: 'row',
    // alignItems: 'flex-end',
    // justifyContent: 'fle'
  },
  mapIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8
  },
  star: {
    marginLeft: -4
  }
});

export default Pharmacy
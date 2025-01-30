import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import Loading from '@/components/Spinner';
import StackScreen from '@/components/StackScreen';
import TextInputIcon from '@/components/TextInputIcon';
import { ThemedText } from '@/components/ThemedText';
import api from '@/services/api';
import { API_METHOD, request } from '@/services/request';
import { Surface } from '@react-native-material/core';
import { useIsFocused } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import { router, useLocalSearchParams } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableHighlight,
  TouchableOpacity,
  View
} from 'react-native';
import { IdProps, StoreProps } from '../(index)/pharmacy';
import moment from 'moment';
import { OpeningHoursProps } from '../(index)/pharmacies';
import { AuthContext } from '@/context/AuthContext';
import { ReservationListProps } from '@/components/product';
import { ReservationProps } from './reservation';

type ProductProps = {
  name: string | undefined;
  genericName: string | undefined;
  description: string | undefined;
  handleCancel: () => void;
};


const Payment = (props: ProductProps) => {
  const { handleCancel, description } = props;

  const [spinner, setSpinner] = useState(false);
  const [value, setValue] = useState(0);
  const [store, setStore] = useState<StoreProps>();
  const [address, setAddress] = useState('Plaridel St. Angeles City');
  const [operation, setOperation] = useState('Monday - Friday 6am-8pm');
  const [reference, setReference] = useState<string>('');
  const [openTime, setOpenTime] = useState(false);
  const [image, setImage] = useState('');
  const [operationHours, setOperationHours] = useState<String>('');
  const [error, setError] = useState(false)
  const item: IdProps = useLocalSearchParams();
  const [products, setProducts] = useState<ReservationListProps[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const { state } = useContext(AuthContext);

  const handleReservation = async () => {
    if (!reference) {
      setError(true)
      return;
    } 
    
    setSpinner(true);
    showToast();
    try {
      const totalPrice = products.reduce((sum, item) => {
        return sum + (item.total || 0); // Use 'total' from the updated list, fallback to 0 if not set
      }, 0);

      const neProdc = products.map(item => {
        return {
          ...item,
          stock: item.quantity 
        }
      })

      let payload = {
        productNumbers: neProdc,
        totalPrice: totalPrice,
        storeId: item.id,
        status: 3,
        customerName: `${state.user?.lastName},${state.user?.firstName}`,
        customerId: state.user?.userId,
        userId: state.user?.userId
      }
      const transactionRes = await request({
        url:  api.TRANSACTION_API + '/create',
        method: API_METHOD.POST,
        data: payload
      });

      const { data } = transactionRes;
      const transactionId = data?.transactionId;
      const newPlayload: ReservationProps = {
        userId: state.user?.userId,
        storeId: item.id ? parseInt(item.id) : 0,
        status: 0,
        totalPrice: totalPrice,
        transactionId: transactionId,
        scheduleTime: moment(item.time, 'ddd MMM DD YYYY HH:mm:ss GMTZZ'),
        scheduleDay: moment(item.date, 'ddd MMM DD YYYY HH:mm:ss GMTZZ'),
        reference: reference
      }

      const reservationRes = await request({
        url:  api.RESERVATIONS_API,
        method: API_METHOD.POST,
        data: newPlayload
      });

      const { data: data1 } = reservationRes;
      const link = data1?._links.store.href;
      const link2 = data1?._links.user.href;

      await request({
        url   : link,
        method: API_METHOD.PUT,
        headers: {
          'Content-Type': 'text/uri-list'
        },
        data: `${api.STORE_API}/${item.id}`,
      });

      await request({
        url   : link,
        method: API_METHOD.PUT,
        headers: {
          'Content-Type': 'text/uri-list'
        },
        data: `${api.STORE_API}/${item.id}`,
      });

      await request({
        url   : link2,
        method: API_METHOD.PUT,
        headers: {
          'Content-Type': 'text/uri-list'
        },
        data: `${api.USERS_API}/${state?.user?.userId}`,
      });


      await handleDeleteItem();
      router.push('/(cart)/')
    } catch (error){
      console.log('Error', error)
    } finally {
      setSpinner(false);
    }
  };

  const handleDeleteItem = async() => {
    await Promise.all(products.map(async (item) => {
      await request({
        url:  api.RESERVATION_LIST_API +'/'+item.reservationListId,
        method: API_METHOD.DELETE,
      });
    }))
  }

  const handleAddtoCart = () => {
    if (!reference) {
      setError(true)
      return;
    } 
    setError(false)

    setSpinner(true);
    setTimeout(() => {
      setSpinner(false);
        showToast();
        router.push('/(cart)/')
      showToast();
    }, 1000);
  };

  const showToast = () => {
    ToastAndroid.show('Products has been successfully reserved!', ToastAndroid.SHORT);
  };

  const handleOpenTimeModal = () => {
    setOpenTime(true)
    // setOpenDate(false)
  }

  const Download = async (url: string, name: string) => {
    let localPath = FileSystem.documentDirectory + name;

    let downloadedFile = await FileSystem.downloadAsync(image, localPath);

    if (downloadedFile.status != 200) {
      Alert.alert('error', 'error in downloading file');
      // handleError();
    }

    //handle ios non image files first

    const imageFileExts = ['jpg', 'png', 'gif', 'heic', 'webp', 'bmp', 'jpeg'];

    const perm = await Location.getForegroundPermissionsAsync();
    if (perm.status != 'granted') {
      return;
    }

    try {
      const asset = await MediaLibrary.createAssetAsync(downloadedFile.uri);
      const album = await MediaLibrary.getAlbumAsync('Download');
      if (album == null) {
        await MediaLibrary.createAlbumAsync('Download', asset, false);

        if (imageFileExts.every(x => !downloadedFile.uri.endsWith(x))) {
          Alert.alert('Success', 'File Saved To Download Folder');
    
        } else {
          Alert.alert('Success', 'Image Saved To Gallery');
    
        }
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        if (imageFileExts.every(x => !downloadedFile.uri.endsWith(x))) {
          Alert.alert('Success', 'File Saved To Download Folder');
    
        } else {
          Alert.alert('Success', 'Image Saved To Gallery');
    
        }
      }
      ToastAndroid.show('Image has been saved successfully', ToastAndroid.SHORT);
    } catch (e) {
      Alert.alert('error', 'error in saving file');
    }
  };

  const handleDownload = async() => {
    try {
      // Request device storage access permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === "granted") {
      // Save image to media library
        await Download(image, 'PharmacyA-QR-Code');

        console.log("Image successfully saved");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const isFocused = useIsFocused();

  const getOperatingHoursToday = (storeHours: OpeningHoursProps): string => {
    const today = moment().format('dddd');
  
    if (storeHours.day !== today) {
      return "Closed today";
    }
  
    const openTime = moment(storeHours.fromHour).format('h:mm A');
    const closeTime = moment(storeHours.untilHour).format('h:mm A');
  
    return `Open Today: ${openTime} - ${closeTime}`;
  }

  const getData = async() => {
    setSpinner(true);
    const response = await request({
      url   : api.STORE_API + '/' + item.id,
      method: API_METHOD.GET,
    });

    const { data } = response;

    const openingHours = await request({
      url:  api.OPENING_HOURS_API + '/search/findByStoreStoreId',
      method: API_METHOD.GET,
      params: {
        storeId: item.id
      }
    });

    const currentDay = moment().format('dddd')

    const foundDay = openingHours.data._embedded.openingHours.find((item: OpeningHoursProps) => item.day == currentDay);
    const operationHours = openingHours.data._embedded.openingHours.map((item: OpeningHoursProps) => item);
    
    setOperation(operationHours);

    let operation = 'Closed Today'
    if (foundDay) {
      operation = getOperatingHoursToday(foundDay);
    }
    const addr = `${data?.firstAddress}, ${data?.secondAddress}, ${data?.city}`;
    setOperationHours(operation)
    setStore(data);
    setAddress(addr);

    const productResp = await request({
      url   : api.RESERVATION_LIST_API + '/search/findByStoreId',
      method: API_METHOD.GET,
      params: {
        storeId:  item.id
      }
    });

    const { data: productData } = productResp;
    const newProducts = await Promise.all(productData._embedded.reservationLists.map(async (list: ReservationListProps) => {
      
      const productResp = await request({
        url   : api.PRODUCT_ITEMS_API + '/' + list.productItemId,
        method: API_METHOD.GET,
      });

      const { data: newData } = productResp;
      const newId = list._links.self.href.replace(`${api.RESERVATION_LIST_API}/`, '');
      return {
        ...list,
        reservationListId: newId,
        productName: newData.name,
        total: newData.price * list.quantity,
        price: newData.price,
        stock: newData.productNumber,
        productNumber: newData.productNumber
      }
    }))

    let nProducts : ReservationListProps[] = [];
    newProducts.map((item: ReservationListProps) => {
      const nFound = nProducts.find(item2 => item2.productItemId === item.productItemId);
      if (nFound) {
        const newNFound = nProducts.filter(item2 => item2.productItemId !== item.productItemId);
        const newQ = nFound.quantity + item.quantity;
        nFound.quantity = newQ;
        nFound.price = nFound.price + item.price
        newNFound.push(nFound)
        nProducts = newNFound;
        return;
      }

      nProducts.push(item)

    })
    const totalPrice = nProducts.reduce((sum, item) => {
      return sum + (item.total || 0); // Use 'total' from the updated list, fallback to 0 if not set
    }, 0);

    setTotalPrice(totalPrice /2);
    setProducts(nProducts);
    
    setSpinner(false);
  }

  useEffect(() => {
    getData();
  }, [isFocused])

  return (
    <>
      <StackScreen title="Down Payment" animation="slide_from_right" headerBackVisible={true} />

        <Surface style={styles.container}>
          {/* <ScrollView style={{height: '100%'}}> */}
          <TouchableHighlight style={[styles.card, styles.shadowProp]}>
            <View style={styles.buttonTileContainer}>
              <View style={styles.content}>
                <View style={styles.textTitle}>
                  {/* <TabBarIcon style={{ color: '#136192' }} size={40} name={'storefront'} /> */}
                  <ThemedText style={styles.name} type="title">
                  {store?.name}
                  </ThemedText>
                  <ThemedText style={styles.genericName} type="subtitle">
                  You’ve hit the reservation limit. Pay the amount, enter the reference number, and use the QR code by saving or screenshotting it to proceed.
                  </ThemedText>
                  <ThemedText style={styles.genericNameTotal} type="subtitle">
                    Down Payment: {totalPrice}
                  </ThemedText>
                  <View style={styles.imageContainer}>
                    <Image
                      style={styles.image}
                      source={store?.qrCode}
                      contentFit="cover"
                      transition={1000}
                    />
                  </View>
                  <View style={styles.downloadContainer}>
                    <TouchableOpacity
                        style={styles.downloadBtn}
                        onPress={handleDownload}
                      >
                        <Text style={styles.actionButtonText}> Download QR Code </Text>
                        <TabBarIcon color={'#ffff'} name={'download-outline'} />
                    </TouchableOpacity>
                  </View>
                  {/* <Text>You’ve reached the reservation price limit. Please pay the amount, enter the reference number, and screenshot or download the QR code to proceed.</Text> */}
                {/* QR Image here */}
                </View>
                <View style={styles.underline}></View>
                <TextInputIcon  icon='card' withLabel={true} onChange={setReference} value={reference} name='Reference Number' handleClickIcon={handleOpenTimeModal}/>
                <View>
                  {
                    error ?  <ThemedText style={{ color: '#972B21', fontSize: 14 }} type="default">
                    This field is required!
                    </ThemedText> : <></>
                  }
                </View>
              </View>
              <View style={styles.actionButton}>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleReservation}
                  >
                    <Text style={styles.actionButtonText}> Reserve </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableHighlight>
        <Loading spinner={spinner} />
        {/* </ScrollView> */}
      </Surface>
    </>
  );
};

const styles = StyleSheet.create({
  genericNameErr: {
    fontSize: 14,
    letterSpacing: 1,
    textAlign: 'center',
    fontWeight: '400',
    fontStyle: 'italic',
    color: '#972B21'
  },
  downloadBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#136192',
    padding: 10,
    flexDirection: 'row',
    gap: 4,

  },
  downloadContainer: {
    // width: '100%'
    width: '70%',
    marginTop: 8
  },
  imageContainer: {
    height: '45%',
    width: '70%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    textAlign: 'center',
    marginTop: 16,
  },
  image: {
    // flex: 1,
    width: '100%',
    backgroundColor: '#0553',
  },
  underline: {
    height: 1,
    width: '100%',
    marginTop: 16,
    backgroundColor: '#136192',
  },
  actionButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -5,
    width: '100%',
  },
  actionButtonText: {
    color: '#ffff',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#136192',
    padding: 10,
    width: '100%'
  },
  container: {
    backgroundColor: '#E5F1FD',
    // flex: 1, 
  },
  content: {
    width: '100%',
  },
  textTitle: {
    // justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
    marginBottom: -56
  },
  name: {
    fontSize: 20,
    letterSpacing: 1,
  },
  genericName: {
    fontSize: 12,
    letterSpacing: 1,
    textAlign: 'center',
    fontWeight: '400',
  },
  genericNameTotal: {
    fontSize: 14,
    letterSpacing: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  description: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  verticleLine: {
    height: '70%',
    width: 1,
    margin: 4,
    marginHorizontal: 8,
    backgroundColor: '#909090',
  },
  removeText :{
    color: '#972B21'
  },
  buttonTileContainer: {
    padding: 16,
    paddingVertical: 8,
    width: '100%',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 8,
    width: '100%',
    marginBottom: 16,
    height: '100%'
  },
  shadowProp: {
    elevation: 8,
    shadowColor: '#171717',
    shadowOffset: { width: -4, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});

export default Payment;

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
import { IdProps, StoreProps } from './pharmacy';
import moment from 'moment';
import { OpeningHoursProps } from './pharmacies';
import { AuthContext } from '@/context/AuthContext';
import { ReservationListProps } from '@/components/product';
import { ReservationProps } from '../(cart)/reservation';

type ProductProps = {
  name: string | undefined;
  genericName: string | undefined;
  description: string | undefined;
  handleCancel: () => void;
};

type TransactionItemProps = {
  name: string
  productItemId: number | undefined;
  quantity: number 
  total: number
};


const Receipt = (props: ProductProps) => {
  const { handleCancel, description } = props;

  const [spinner, setSpinner] = useState(false);
  const [store, setStore] = useState<StoreProps>();
  const [reference, setReference] = useState<string>('');
  const [image, setImage] = useState('');
  const [error, setError] = useState(false)
  const item: IdProps = useLocalSearchParams();
  const [totalPrice, setTotalPrice] = useState(0);
  const [transactionNum, setTransactionNum] = useState('');
  const [date, setDate] = useState('');
  const [items, setItems] = useState<TransactionItemProps[]>([]);
  const { state } = useContext(AuthContext);

  const showToast = () => {
    ToastAndroid.show('Products has been successfully reserved!', ToastAndroid.SHORT);
  };

  const handleOpenTimeModal = () => {
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
    setSpinner(false);
    const response = await request({
      url   : api.STORE_API + '/' + item.id,
      method: API_METHOD.GET,
    });

    const { data } = response;

    setStore(data);

    const response1 = await request({
      url   : api.RESERVATIONS_API + '/' + item.transactionId,
      method: API_METHOD.GET,
      params: {
        userId: state.user.userId
      }
    });
    console.log('response1.data.ts', response1.data.ts)
    setDate(moment(response1.data.ts).format('M/D/YYYY h:mm A'))

    const response3 = await request({
      url   : api.TRANSACTIONS_API + '/' + response1.data.transactionId,
      method: API_METHOD.GET,
    });

    const response4 = await request({
      url   : api.TRANSACTIONS_API + '/' + response1.data.transactionId + '/transactionItems',
      method: API_METHOD.GET,
    });

    const { transactionItems } = response4.data._embedded;
          
    const productItems = await Promise.all(transactionItems.map(async (item: TransactionItemProps) => {
      const productResp = await request({
        url   : api.PRODUCT_ITEMS_API + '/' + item.productItemId,
        method: API_METHOD.GET,
      });

      return {
        name: productResp.data.name,
        quantity: item.quantity,
        total: productResp.data.price * item.quantity
      }
    }))
    setItems(productItems);
    console.log('productItems ----', productItems)
    setTotalPrice(response3.data.totalPrice);
    setTransactionNum(response3.data.transactionNum)
    console.log('response3.data.transactionNum', response3.data.transactionNum)
    setSpinner(false);
  }

  useEffect(() => {
    getData();
  }, [isFocused])

  return (
    <>
      <StackScreen title="Receipt" animation="slide_from_right" headerBackVisible={true} />

        <Surface style={styles.container}>
          {/* <ScrollView style={{height: '100%'}}> */}
          <TouchableHighlight style={[styles.card, styles.shadowProp]}>
            <View style={styles.buttonTileContainer}>
              <View style={styles.content}>
                <View style={styles.textTitle}>
                <TabBarIcon color={'#136192'} name={'checkmark-circle'} style={{ color: '#388138', fontSize: 50}}/>
                <ThemedText style={styles.name} type="title">
                Completed
                </ThemedText>
                <View style={styles.underline}></View>
                  <View style={{ flexDirection: 'row', width: '100%',  justifyContent: 'space-between'}}>
                    {/* <TabBarIcon style={{ color: '#136192' }} size={40} name={'storefront'} /> */}
                    <ThemedText style={styles.name} type="title">
                    Store Name
                    </ThemedText>
                    <ThemedText style={styles.name} type="title">
                    {store?.name}
                    </ThemedText>
                  </View>
                  <View style={styles.underline}></View>
                  <View style={{ flexDirection: 'row', width: '100%',  justifyContent: 'space-between'}}>
                    {/* <TabBarIcon style={{ color: '#136192' }} size={40} name={'storefront'} /> */}
                    <ThemedText style={styles.name} type="title">
                    Reference
                    </ThemedText>
                    <ThemedText style={styles.name} type="title">
                    #{transactionNum}
                    </ThemedText>
                  </View>
                  <View style={styles.underline}></View>
                  <View style={{ flexDirection: 'row', width: '100%',  justifyContent: 'space-between'}}>
                    {/* <TabBarIcon style={{ color: '#136192' }} size={40} name={'storefront'} /> */}
                    <ThemedText style={styles.name} type="title">
                    Date
                    </ThemedText>
                    <ThemedText style={styles.name} type="title">
                    {date}
                    </ThemedText>
                  </View>
                  <View style={styles.underline}></View>
                  <View style={{ flexDirection: 'row', width: '100%',  justifyContent: 'space-between'}}>
                    {/* <TabBarIcon style={{ color: '#136192' }} size={40} name={'storefront'} /> */}
                    <ThemedText style={styles.name} type="title">
                    Items
                    </ThemedText> 
                    <View style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
                    {
                      items.map((item: TransactionItemProps, idx) => (
                        <View key={idx} style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center', width: 200}}>
                          <ThemedText style={styles.name} type="title">
                          x{item.quantity} {item.name}
                          </ThemedText>
                          <ThemedText style={styles.name} type="title">
                          ₱{item.total}
                          </ThemedText>

                        </View>
                      ))
                    }
                    </View>
                  </View>
                  <View style={styles.underline}></View>
                  <View style={{ flexDirection: 'row', width: '100%',  justifyContent: 'space-between'}}>
                    {/* <TabBarIcon style={{ color: '#136192' }} size={40} name={'storefront'} /> */}
                    <ThemedText style={styles.name} type="title">
                    Amount
                    </ThemedText>
                    <ThemedText style={styles.name} type="title">
                    ₱{totalPrice}
                    </ThemedText>
                  </View>
                 
                  
                <View style={styles.underline}></View>
                  {/* <View style={styles.downloadContainer}>
                    <TouchableOpacity
                        style={styles.downloadBtn}
                        onPress={handleDownload}
                      >
                        <Text style={styles.actionButtonText}> Download Receipt </Text>
                        <TabBarIcon color={'#ffff'} name={'download-outline'} />
                    </TouchableOpacity>
                  </View> */}
                </View>
              </View>
              {/* <View style={styles.actionButton}>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleReservation}
                  >
                    <Text style={styles.actionButtonText}> Reserve </Text>
                </TouchableOpacity>
              </View> */}
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
    width: '100%',
    marginTop: 8
  },
  image: {
    // flex: 1,
    width: '100%',
    backgroundColor: '#0553',
  },
  underline: {
    height: 1,
    width: '100%',
    marginTop: 8,
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
    flex: 1, 
  },
  content: {
    width: '100%',
  },
  textTitle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -56
  },
  name: {
    fontSize: 14,
    letterSpacing: 1,
    justifyContent: 'center'
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

export default Receipt;

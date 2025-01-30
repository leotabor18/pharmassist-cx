import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import Loading from '@/components/Spinner';
import StackScreen from '@/components/StackScreen';
import TextInputIcon from '@/components/TextInputIcon';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import RNDateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Surface } from '@react-native-material/core';
import { router, useLocalSearchParams } from 'expo-router';
import moment, { Moment } from 'moment';
import { useContext, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import InputSpinner from 'react-native-input-spinner';
import { IdProps, StoreProps } from '../(index)/pharmacy';
import { API_METHOD, request } from '@/services/request';
import api from '@/services/api';
import { LinkProps, OpeningHoursProps } from '../(index)/pharmacies';
import { ReservationListProps } from '@/components/product';
import { useIsFocused } from '@react-navigation/native';
import Modal from "react-native-modal";
import { AuthContext } from '@/context/AuthContext';

type ProductProps = {
  name: string | undefined;
  genericName: string | undefined;
  description: string | undefined;
  handleCancel: () => void;
};

export type ReservationProps = {
  reservationId?: number;
  transactionNum?: string;
  userId?: number;
  storeId: number;
  status: number;
  dateClaimed?: string;
  totalPrice: number;
  note?: string | null;
  transactionId: number;
  reference?: string;
  scheduleTime: string | Date | undefined | Moment;
  scheduleDay: string | Date | undefined | Moment;
  store?: StoreProps
  items?:number
  _links?: LinkProps
};

const Reservation = (props: ProductProps) => {
  const { handleCancel, description } = props;

  const [spinner, setSpinner] = useState(false);
  const [value, setValue] = useState(0);
  const [store, setStore] = useState<StoreProps>();
  const [address, setAddress] = useState('');
  const [operation, setOperation] = useState<OpeningHoursProps[]>([]);
  const [time, setTime] = useState<Date | undefined>(new Date());
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [openDate, setOpenDate] = useState(false);
  const [openTime, setOpenTime] = useState(false);
  const [isPaymentRequired, setIsPaymentRequired] = useState(true);
  const [operationHours, setOperationHours] = useState<String>('');
  const [products, setProducts] = useState<ReservationListProps[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [total, setTotal] = useState<number>(0);

  const item: IdProps = useLocalSearchParams();
  const { state } = useContext(AuthContext);

  console.log('State', state.token);

  const handleReservation = async () => {
    setSpinner(true);
    if (isPaymentRequired) {
      router.push({ pathname: '/(cart)/payment', params: {id: item.id, time: time?.toString() || '', // Convert time to string if defined
        date: date?.toString() || '' }})
    } else {
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
          storeId: item?.id ? parseInt(item?.id) : 0,
          status: 0,
          totalPrice: totalPrice,
          transactionId: transactionId,
          scheduleTime: time,
          scheduleDay: date,
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
          data: `${api.STORE_API}/${item.id}`, // Type assertion
        });

        await request({
          url   : link,
          method: API_METHOD.PUT,
          headers: {
            'Content-Type': 'text/uri-list'
          },
          data: `${api.STORE_API}/${item.id}`, // Type assertion
        });

        await request({
          url   : link2,
          method: API_METHOD.PUT,
          headers: {
            'Content-Type': 'text/uri-list'
          },
          data: `${api.USERS_API}/${state?.user?.userId}`, // Type assertion
        });
  

        await handleDeleteItem();
        router.push('/(cart)/')
      } catch {

      } finally {
        setSpinner(false);
      }
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

  const showToast = () => {
    ToastAndroid.show('Products has been successfully reserved!', ToastAndroid.SHORT);
  };

  const handleChange = (num: number, prodId: number) => {
    const find = products.map(item => {
      if (prodId === item.productItemId) {
        return {
          ...item,
          total: item.price * num,
          quantity: num
        }
      } 
      return item;
    });
    setProducts(find);
    const totalPrice = find.reduce((sum, item) => {
      return sum + (item.total || 0); // Use 'total' from the updated list, fallback to 0 if not set
    }, 0);

    setIsPaymentRequired(totalPrice > 199);
    setValue(num);
  };

  const handleAddItem = () => {
    setSpinner(true);
    router.push({ pathname: '/(tabs)/(index)/pharmacy', params: {id: item.id}})
    setSpinner(false);
  }

  const handleRemove = async (id: number) => {
    await request({
      url:  api.RESERVATION_LIST_API +'/'+id,
      method: API_METHOD.DELETE,
    });
    await getData();
  }
  
  const handleOpenTimeModal = () => {
    setOpenTime(true)
    // setOpenDate(false)
  }

  const handleOpenDateModal = () => {
    setOpenDate(true)
    // setOpenTime(false)
  }

  const handleChangeTime = (event: DateTimePickerEvent, date?: Date) => {
    const {
      type,
      nativeEvent: {timestamp, utcOffset},
    } = event;
    setOpenTime(false)
    setTime(date);
  }

  const handleChangeDate = (event: DateTimePickerEvent, date?: Date) => {
    const {
      type,
      nativeEvent: {timestamp, utcOffset},
    } = event;
    setOpenDate(false)
    setDate(date);
  }

  const getOperatingHoursToday = (storeHours: OpeningHoursProps): string => {
    const today = moment().format('dddd'); // Get today's day as full name, e.g., "Monday"
  
    // Check if today matches the store's operating day
    if (storeHours.day !== today) {
      return "Closed today";
    }
  
    // Parse fromHour and untilHour as times for display
    const openTime = moment(storeHours.fromHour).format('h:mm A'); // e.g., "8:00 AM"
    const closeTime = moment(storeHours.untilHour).format('h:mm A'); // e.g., "5:00 PM"
  
    return `Open Today: ${openTime} - ${closeTime}`;
  }

  // const validateScheduleDay = (): boolean => {
  //   const selectedDay = moment(date).format('dddd');
  //   const storeDay = operation.find(hour => hour.day.toLowerCase() === selectedDay.toLowerCase());
    
  //   // If no store hours are found for the selected day, return false
  //   if (!storeDay) {
  //     return false;
  //   }
    
  //     // Parse `fromHour` and `untilHour` times, using only the time component on the same day as `selectedMomentTime`
  //   const selectedDateStr = moment(date).format('YYYY-MM-DD'); // Get date in 'YYYY-MM-DD' format
  //   const storeOpenTime = moment.utc(`${selectedDateStr}T${moment(storeDay.fromHour).format('HH:mm:ss')}`, 'YYYY-MM-DDTHH:mm:ss');
  //   const storeCloseTime = moment.utc(`${selectedDateStr}T${moment(storeDay.untilHour).format('HH:mm:ss')}`, 'YYYY-MM-DDTHH:mm:ss');
    

  //   // Combine the date with time to create a moment object for the selected time in UTC
  //   const selectedMomentTime = moment.utc(
  //     moment(date).format('YYYY-MM-DD') + ' ' + moment(time).format('HH:mm'),
  //     'YYYY-MM-DD HH:mm'
  //   );

  //   console.log('storeOpenTime', moment(storeOpenTime).format('HH:mm:ss'), 'storeCloseTime', moment(storeCloseTime).format('HH:mm:ss'), 'selectedMomentTime', selectedMomentTime
  //     , '---', selectedMomentTime.isBetween(storeOpenTime, storeCloseTime, null, '[)')
  //   )
    
  //   // Check if the selected time is within the store's opening hours in UTC
  //   return selectedMomentTime.isBetween(storeOpenTime, storeCloseTime, null, '[)');
  // };
  
  const validateScheduleDay = (): boolean => {
    const selectedDay = moment(date).format('dddd');
    const storeDay = operation.find(hour => hour.day.toLowerCase() === selectedDay.toLowerCase());
    
    // If no store hours are found for the selected day, return false
    if (!storeDay) {
      return false;
    }
    
    // Parse `fromHour` and `untilHour` times
    const selectedDateStr = moment(date).format('YYYY-MM-DD'); // Get date in 'YYYY-MM-DD' format
    let storeOpenTime = moment.utc(`${selectedDateStr}T${moment(storeDay.fromHour).format('HH:mm:ss')}`, 'YYYY-MM-DDTHH:mm:ss');
    let storeCloseTime = moment.utc(`${selectedDateStr}T${moment(storeDay.untilHour).format('HH:mm:ss')}`, 'YYYY-MM-DDTHH:mm:ss');
    
    // If the closing time is before the opening time, adjust closing time to the next day
    if (storeCloseTime.isBefore(storeOpenTime)) {
      console.log('Trye')
      storeCloseTime = storeCloseTime.add(1, 'day');
    }
  
    // Combine the date with time to create a moment object for the selected time in UTC
    const selectedMomentTime = moment.utc(
      moment(date).format('YYYY-MM-DD') + ' ' + moment(time).format('HH:mm'),
      'YYYY-MM-DD HH:mm'
    );
  
    console.log('storeOpenTime:', storeOpenTime, moment(storeOpenTime).format('YYYY-MM-DD HH:mm:ss'),
                'storeCloseTime:', moment(storeCloseTime).format('YYYY-MM-DD HH:mm:ss'),
                'selectedMomentTime:', selectedMomentTime.format('YYYY-MM-DD HH:mm:ss'),
                '---', selectedMomentTime.isBetween(storeOpenTime, storeCloseTime, null, '[)'));
  
    // Check if the selected time is within the store's opening hours in UTC
    return selectedMomentTime.isBetween(storeOpenTime, storeCloseTime, null, '[)');
  };
  
  
  const getData = async() => {
    setSpinner(true);
    try {
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
          stock: newData.stock,
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
      setProducts(nProducts);
  
      const totalPrice = nProducts.reduce((sum, item) => {
        return sum + (item.total || 0); // Use 'total' from the updated list, fallback to 0 if not set
      }, 0);
      setTotal(totalPrice);
      setIsPaymentRequired(totalPrice > 199);
    } catch {

    } finally {
      setSpinner(false);
    }
    
  }

  const isFocused = useIsFocused();

  useEffect(() => {
    getData();
  }, [isFocused])

  const onSwipeMove = (percentage: number) => {
    if (Math.floor(percentage * 100) < 15) {
      setOpenModal(false);
    } 
  }

  const deviceWidth = Dimensions.get("window").width;

  const handleOpenModal = () => {
    setOpenModal(prev => !prev)
  }

  console.log(products)
  return (
    <>
      <StackScreen title="Reservation" animation="slide_from_right" headerBackVisible={true} />

      <Surface style={styles.container}>
        <ScrollView>
          <TouchableHighlight style={[styles.card, styles.shadowProp]}>
            <View style={styles.buttonTileContainer}>
              <View style={styles.content}>
                <View style={styles.textTitle}>
                  <TabBarIcon style={{ color: '#136192' }} size={40} name={'storefront'} />
                  <ThemedText style={styles.name} type="title">
                    {store?.name}
                  </ThemedText>
                  <ThemedText style={styles.genericName} type="subtitle">
                    {address}
                  </ThemedText>
                  <ThemedText style={operationHours.includes('Closed') ? styles.genericNameErr : styles.genericName} type="subtitle">
                    {operationHours}
                  </ThemedText>
                </View>

                <View style={styles.description}>
                  <ThemedText style={styles.descriptionText} type="subtitle">
                    Product Summary
                  </ThemedText>
                  <ThemedText style={styles.addItem} onPress={handleAddItem} type="subtitle">
                    Add item
                  </ThemedText>
                </View>
                <View style={styles.productList}>
                  {
                   products.map((item, index) => 
                  (
                    
                    <View key={index} style={styles.productItem}>
                      <View>
                        <ThemedText style={styles.productItemName} type="default">
                          {item.productName}
                        </ThemedText>
                        <View style={styles.productItemDesContainer}>
                          <ThemedText style={styles.productItemDes} type='default'>
                          ₱{item.total}
                          </ThemedText>
                          <View style={styles.verticleLine}></View>
                          <ThemedText style={[styles.productItemDes, styles.removeText]} onPress={() => handleRemove(item.reservationListId)} type="default">
                            Remove 
                          </ThemedText>
                        </View>
                      </View>
                      <View>
                        <InputSpinner
                          min={0}
                          max={item.stock}
                          step={1}
                          colorMax={"#136192"}
                          colorMin={"#136192"}
                          showBorder
                          rounded={false}
                          value={item.quantity}
                          onChange={(e: number) => handleChange(e, item.productItemId)}
                          editable={false}
                          buttonStyle={{ backgroundColor: '#136192'}}
                          width={100}
                          height={25}
                        />
                      </View>
                    </View>
                  ))}
                </View>
                <View style={styles.underline}></View>
                <View style={styles.description}>
                  <ThemedText style={styles.descriptionText} type="subtitle">
                    Schedule a Reservation
                  </ThemedText>
                  <ThemedText style={styles.addItem} onPress={handleOpenModal} type="subtitle">
                    Store hours
                  </ThemedText>
                </View>
                <TextInputIcon  withLabel={false} onChange={setTime} value={moment(time).format('hh:mm A')} name='Time' icon={ 'timer-outline'} handleClickIcon={handleOpenTimeModal}/>
                <TextInputIcon  withLabel={false} onChange={setDate} value={moment(date).format('MMMM DD, YYYY')} name='Date' icon={ 'calendar'} handleClickIcon={handleOpenDateModal}/>
                {
                  openDate &&
                  <RNDateTimePicker minimumDate={new Date()} onChange={handleChangeDate} display='calendar' value={date ?? new Date()}/>
                }
                {
                  openTime &&
                  <RNDateTimePicker minimumDate={new Date()} onChange={handleChangeTime} display='default' mode='time' value={time ?? new Date()}/>
                }
              </View>
              {
                !validateScheduleDay() ||!store?.isReservationActivated ?
                <>
                  <View style={styles.underline}></View>
                  <ThemedText style={{color: '#972B21', fontStyle: 'italic', fontSize: 14, marginTop: 4}} type="default">
                    {
                      !validateScheduleDay() ? "*Invalid schedule. Please select a time within the store's operating hours." : '*Reservations are currently disabled for this store.'
                    }
                  </ThemedText>
                </>
                :
                <></>
              }
              <View style={styles.description}>
                  <ThemedText style={{ fontSize: 24, fontWeight: 'bold'}} type="subtitle">
                    Total
                  </ThemedText>
                  <ThemedText style={[styles.addItem, { fontSize: 24, fontWeight: 'bold', textDecorationColor: '#000', fontStyle: 'normal', textDecorationLine: 'none', color: '#000'}]} type="subtitle">
                  ₱{total}
                  </ThemedText>
                </View>
              <View style={styles.actionButton}>
                {
                  validateScheduleDay() && store?.isReservationActivated ?
                  <TouchableOpacity
                      style={styles.submitButton}
                      onPress={handleReservation}
                    >
                      <Text style={styles.actionButtonText}> 
                        {
                        isPaymentRequired ? 'Next' : 'Reserve' 
                        }
                      </Text>
                  </TouchableOpacity>
                :
                  <TouchableOpacity
                      style={styles.submitButtonDisabled}
                    >
                      <Text style={styles.actionButtonTextDisabled}> 
                        Reserve
                      </Text>
                  </TouchableOpacity>
                }
              </View>
            </View>
          </TouchableHighlight>
        </ScrollView>
        <Loading spinner={spinner} />
      </Surface>
      <Modal onSwipeMove={onSwipeMove} isVisible={openModal} deviceWidth={deviceWidth} swipeDirection={'down'} backdropTransitionOutTiming={1} swipeThreshold={1}>
      <View style={styles.buttonTileContainer}>
          <View style={styles.contentModal}>
            {
              operation.map((item, index) => (
                <View key={index} style={styles.textTitleOp}>
                  <ThemedText style={styles.descriptionText} type="title">{item.day}:</ThemedText>
                  <ThemedText style={styles.descriptionText} type="subtitle">{moment(item.fromHour).format('h:mm A')} - {moment(item.untilHour).format('h:mm A')}</ThemedText>
                </View>
              ))
            }
            {/* <View style={styles.textContainer}>
              <ThemedText style={styles.text} type="subtitle">Sample Product Description</ThemedText>
            </View> */}
            <View style={styles.actionButton}>
              <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleOpenModal}
                >
                  <Text style={styles.actionButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  textTitleOp: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  underline: {
    height: 1,
    width: '100%',
    marginTop: 16,
    backgroundColor: '#136192',
  },
  contentModal: {
    backgroundColor: '#fff',
    padding: 16
  },
  submitButtonDisabled: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    width: '100%'
  },
  actionButtonTextDisabled: {
    fontStyle: 'italic'
  },
  actionButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
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
    flex: 1,
    backgroundColor: '#E5F1FD',
  },
  content: {
    width: '100%',
  },
  textTitle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    letterSpacing: 1,
  },
  genericName: {
    fontSize: 14,
    letterSpacing: 1,
    textAlign: 'center',
    fontWeight: '400',
  },
  genericNameErr: {
    fontSize: 14,
    letterSpacing: 1,
    textAlign: 'center',
    fontWeight: '400',
    fontStyle: 'italic',
    color: '#972B21'
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
  addItem: {
    color: '#136192',
    fontSize: 16,
    fontWeight: '400',
    textDecorationLine: 'underline',
    fontStyle: 'italic'
  },
  productItemDesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  productList: {
    marginTop: 8,
  },
  productItem: {
    marginTop: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  productItemName: {

  },
  productItemDes: {
    fontSize: 14,
  },
  descriptionText: {
    fontSize: 16,
  },
  buttonTileContainer: {
    padding: 16,
    width: '100%',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 8,
    width: '100%',
    marginBottom: 16,
    marginTop: 8,
    flex: 1,
  },
  shadowProp: {
    elevation: 8,
    shadowColor: '#171717',
    shadowOffset: { width: -4, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    width: 130
    // width: '100%'
  },
});

export default Reservation;

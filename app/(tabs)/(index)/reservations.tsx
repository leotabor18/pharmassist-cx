import { Alert, 
  Dimensions, 
  StyleSheet, Text, ToastAndroid, TouchableHighlight, View } from 'react-native';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppBar } from '@react-native-material/core';
import { Link, Redirect, router, Stack } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import Loading from '@/components/Spinner';
import StackScreen from '@/components/StackScreen';
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';
import Modal from "react-native-modal";
import DeleteModal from '@/components/DeleteModal';
import { AuthContext } from '@/context/AuthContext';
import { useIsFocused } from '@react-navigation/native';
import { API_METHOD, request } from '@/services/request';
import api from '@/services/api';
import { ReservationProps } from '../(cart)/reservation';
import moment from 'moment';
import { StoreProps } from './pharmacy';

const Reservations = () => {
  const [isAuthenticate, setIsAuthenticate] = useState(true);
  const [spinner, setSpinner] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [data, setData] = useState<ReservationProps[]>([]);
  const { state, dispatch } = useContext(AuthContext);

  const [selected, setSelected] = useState<ReservationProps>()
  if (!state.token) {
    return <Redirect href={'/login'} />
  }

  const handlePharmacy = () => {
    // setSpinner(true);
    // setTimeout(() => {
    //   setSpinner(false);
    // }, 1000)
    // router.push('/(tabs)/(cart)/reservation');
  }

  const handleCancel = () => {
    setOpenModal(false)
  }

  const deviceWidth = Dimensions.get("window").width;

  const handleDelete = (item: ReservationProps) => {
    setSelected(item);
    setOpenModal(true)
  }

  const getData = async() => {
    setSpinner(true);

    try {

      const response = await request({
        url   : api.RESERVATIONS_API + '/search/findByUserUserId',
        method: API_METHOD.GET,
        params: {
          userId: state.user.userId
        }
      });
  
      const { data } = response;
      const newData = await Promise.all(data._embedded.reservations.map(async (item: ReservationProps) => {
        const id = item._links?.self.href.replace(`${api.RESERVATIONS_API}/`, '');
        if (item._links) {
          const response1 = await request({
            url   : item._links.store.href,
            method: API_METHOD.GET,
          });

          
          const response2 = await request({
            url   : api.TRANSACTIONS_API + '/' + item.transactionId + '/transactionItems',
            method: API_METHOD.GET,
          });

          const response3 = await request({
            url   : api.TRANSACTIONS_API + '/' + item.transactionId,
            method: API_METHOD.GET,
          });

          const { transactionItems } = response2.data._embedded;
          
          const storeId = response1.data._links.self.href.replace(`${api.STORE_API}/`, '');

          return {
            ...item,
            reservationId: id,
            transactionNum: response3.data.transactionNum,
            store: {
              ...response1.data,
              storeId: storeId
            },
            items: transactionItems.length
          }
        }
      }));
        
      setData(newData);
    } catch {

    } finally {
      setSpinner(false);
    }
      
  }

  console.log('data', data)

  const isFocused = useIsFocused();

  const handleDeleteItem = async () => {
    await request({
      url:  api.RESERVATIONS_API +'/'+selected?.reservationId,
      method: API_METHOD.DELETE,
    });
    setData([])
    await getData();
    ToastAndroid.show('Reservation has been deleted.', ToastAndroid.SHORT)
  }

  useEffect(() => {
    getData();
  }, [isFocused])

  return (
    <>
      <StackScreen title='My Reservations' animation='slide_from_right' headerBackVisible={true}/>
      <ThemedView style={styles.titleContainer}>
        {/* <SwipeRow>
          <View/>
          <View/> */}
        {/* </SwipeRow> */}
        {
          !spinner && data?.length === 0 ?
          <Text style={{ textAlign: 'center', fontStyle: 'italic'}}> No data found </Text>
        :
          <></>
        }
        <SwipeListView 
          disableRightSwipe={true}
          data={data}
          style={{ width: '100%', padding: 0}}
          renderItem={(data, rowMa) => (
            <TouchableHighlight underlayColor='#E5F1FD' style={[styles.card, styles.shadowProp]} onPress={handlePharmacy}>
              <View style={styles.buttonTileContainer}>
                <View style={styles.timeStyle}>
                  <ThemedText style={[styles.dateStyleText, { fontSize: 13}]} type="title">#{data.item?.transactionNum}</ThemedText>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 4}}>
                    <TabBarIcon style={{fontSize: 18}} name='time-outline' color={'#136192'}/>
                    <ThemedText style={styles.timeStyleText} type="title">{moment(data.item.scheduleTime).format('hh:mm A')}</ThemedText>
                  </View>
                  <ThemedText style={[styles.dateStyleText, { fontSize: 14}]} type="title">{moment(data.item.scheduleDay).format('DD MMM YYYY')}</ThemedText>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4}}>
                    {/* <ThemedText style={[styles.dateStyleText, { fontSize: 12}]} type="default">
                    </ThemedText> */}
                    <ThemedText style={[styles.dateStyleText, { fontSize: 12, fontWeight: 'bold'}, data.item.status === 3 && {color: 'red'}]} type="default">
                      {!data.item.status && !data.item.reference ? 'Pending': !data.item.status && data.item.reference ?  'Pending w/ Partial Payment' 
                        : data.item.status === 2 && !data.item.reference ? 'Accepted' : data.item.status === 2 && data.item.reference ? 'Accepted w/ Partial Payment' 
                        : data.item.status === 3 ? 'Rejected' : 'Completed'}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.verticleLine}></View>
                <View style={styles.storeStyle}>
                  <ThemedText style={styles.buttonText} type="title">{data.item.store?.name}</ThemedText>
                  <ThemedText style={[styles.dateStyleText, { fontSize: 12}]} type="default">{`${data.item.store?.firstAddress}, ${data.item.store?.secondAddress}, ${data.item.store?.city}`}</ThemedText>
                  <ThemedText style={[styles.dateStyleText, { fontSize: 12}]} type="default">Reserved Items: {data.item.items}</ThemedText>
                  <ThemedText style={[styles.dateStyleText, { fontSize: 12}]} type="default">Total: ₱{data.item.totalPrice}</ThemedText>

                    {
                      data.item.status ? <ThemedText onPress={() => {
                        router.push({ pathname: '/(tabs)/(index)/receipt', params: { id: data.item.store?.storeId, transactionId: data.item.reservationId }})
                      }} style={styles.link}>View Receipt</ThemedText> : ''
                    }
                </View>
              </View>
            </TouchableHighlight>
          )}
          renderHiddenItem={ (data, rowMap) => (
            <TouchableHighlight underlayColor='#E5F1FD' style={[styles.cardDelete]} >
              <View style={styles.deleteContainer}>
                <TabBarIcon onPress={() => {
                  if (data.item.status === 0) {
                    ToastAndroid.show('Unable to delete. The reservation is still pending.', ToastAndroid.SHORT)
                    return
                  }

                  handleDelete(data.item)
                }} style={{color: '#ffff'}} color={'#972B21'} name={'trash'}/>
              </View>
            </TouchableHighlight>
          )}
          // leftOpenValue={75}
          rightOpenValue={-70}
        />
        <Modal onSwipeMove={() => {}} isVisible={openModal} deviceWidth={deviceWidth}>
          <DeleteModal handleCancel={handleCancel} handleSubmit={handleDeleteItem}/>
        </Modal>
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
    fontSize: 18
  },
  buttonTileContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    padding: 4,
    paddingHorizontal: 0
  },
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#E5F1FD',
    height: '100%',
    padding: 32,
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  shadowProp: {
    elevation: 8,
    shadowColor: '#171717',
    shadowOffset: {width: -4, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  card: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 25,
    width: '100%',
    marginVertical: 4,
  },
  cardDelete: {
    width: '100%',
    // flex: 1,
    padding: 0,
    backgroundColor: 'white',
    // marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'flex-end', 
    flexDirection: 'row', 
    marginTop: 4,
  },
  deleteContainer: {
    backgroundColor: '#972B21',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 65,
    width: 70
    // width: '10%'
  },
  verticleLine: {
    height: '100%',
    width: 1,
    backgroundColor: '#909090',
  },
  timeStyle: {
    width: '34%',
    justifyContent: 'center'
  },
  timeStyleText: {
    fontSize: 18,
    color: '#136192' ,
    margin: 0,
    padding: 0
  },
  dateStyleText: {
    fontSize: 12,
    margin: 0,
    color: '#136192' ,
  },
  storeStyle: {
    width: '65%',
  },
  link: {
    textDecorationLine: 'underline',
    fontSize: 12,
    color: '#136192'
  },
});

export default Reservations;

import { Alert, 
  Dimensions, 
  StyleSheet, Text, ToastAndroid, TouchableHighlight, View } from 'react-native';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppBar } from '@react-native-material/core';
import { Redirect, router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useContext, useEffect, useState } from 'react';
import Loading from '@/components/Spinner';
import StackScreen from '@/components/StackScreen';
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';
import Modal from "react-native-modal";
import DeleteModal from '@/components/DeleteModal';
import { AuthContext } from '@/context/AuthContext';
import { API_METHOD, request } from '@/services/request';
import api from '@/services/api';
import { ReservationListProps } from '@/components/product';
import { useIsFocused } from '@react-navigation/native';

type ReservationProps = {
  storeName: string;
  storeId: number;
  products: ReservationListProps[];
  totalPrice?: number
};

const Cart = () => {
  const [isAuthenticate, setIsAuthenticate] = useState(true);
  const [spinner, setSpinner] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [data, setData] = useState<ReservationProps[]>();
  const [seletecId, setSelectedId] = useState<ReservationListProps[]>();

  const isFocused = useIsFocused();

  const { state } = useContext(AuthContext);

  const handleOpenItem = (storeId: number) => {
    router.push({ pathname: '/(tabs)/(cart)/reservation', params: {id: storeId }})
  }

  const handleCancel = () => {
    setOpenModal(false)
  }

  const deviceWidth = Dimensions.get("window").width;

  const handleDelete = (list: ReservationListProps[]) => {
    setSelectedId(list);
    setOpenModal(true)
  }

  const groupByStoreId = (reservations: ReservationListProps[]): ReservationProps[] => {
    let list: ReservationProps[] = [];
  
    
    reservations.forEach(item => {
      const storeId = item.storeId;
  
      const found = list.find(store => store.storeId === storeId);
  
      if (!found) {
        const totalPrice = [item].reduce((sum, prod) => {
          return sum + (prod.total || 0); // Use 'total' from the updated list, fallback to 0 if not set
        }, 0);

        const listProps: ReservationProps = {
          storeId: storeId,
          storeName: item.storeName,
          products: [item],
          totalPrice: totalPrice
        };
        list.push(listProps);
      } else {
        const existingProduct = found.products.find(p => p.productItemId === item.productItemId);
  
        if (existingProduct) {
          existingProduct.quantity += item.quantity;
          existingProduct.total += item.total
        } else {
          found.products.push(item);
        }
      }
    });
  
    return list;
  };

  const getStore = async (storeId: number)  => {
    try {
      const response = await request({
        url:  api.STORE_API + '/'+ storeId,
        method: API_METHOD.GET,
      });
      return response.data;
    } catch {
      return null;
    }
  }

  const getData = async() => {
    setSpinner(true);
  
    try {
      let params = {
        size: 10000,
        userId: state.user?.userId
      }
      const response: any = await request({
        url   : api.RESERVATION_LIST_API + '/search/findByUserUserId',
        method: API_METHOD.GET,
        params: params
      });
  
      const reservationLists = response.data._embedded.reservationLists;
      const newReservationList = await Promise.all(reservationLists.map(async (item: ReservationListProps) => {
        const storeResp = await getStore(item.storeId);
        const newId = item._links.self.href.replace(`${api.RESERVATION_LIST_API}/`, '');
  
        return {
          ...item,
          reservationListId: newId,
          storeName: storeResp?.name ?? null,
        }
      }));
  
      const newGroup = groupByStoreId(newReservationList.filter(item => item.storeName));
  
      setData(newGroup)
    } catch (e){

    } finally {
      setSpinner(false);
    }
    
  }

  const handleDeleteItem = async() => {
    if (!seletecId) return;
    
    await Promise.all(seletecId.map(async (item) => {
      await request({
        url:  api.RESERVATION_LIST_API +'/'+item.reservationListId,
        method: API_METHOD.DELETE,
      });
    }))

    await getData();
    ToastAndroid.show('Items has been successfully deleted', ToastAndroid.SHORT)
  }

  useEffect(() => {
    getData();
  }, [isFocused]);

  return (
    <>
      <StackScreen title='My Items' animation='slide_from_right' headerBackVisible={true}/>
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
            <TouchableHighlight underlayColor='#E5F1FD' style={[styles.card, styles.shadowProp]} onPress={() => {
              if (data.item.storeName) {
                handleOpenItem(data.item.storeId)
              }  
              }}>
              <View style={styles.buttonTileContainer}>
                <TabBarIcon style={{color: '#136192', fontSize: 40}}  name={'storefront'}/>
                <View>
                  {
                    data.item.storeName? 
                      <ThemedText style={styles.buttonText} type="title">{`${data.item.storeName}`}</ThemedText>
                    :
                    <ThemedText style={{color: '#972B21', fontStyle: 'italic', fontSize: 24, marginTop: 4}} type="default">
                      This store is not currently available
                    </ThemedText>
                  }
                  <ThemedText style={styles.buttonText2} type="title">{`Items: ${data.item.products.length}`}</ThemedText>
                  {/* <ThemedText style={styles.buttonText2} type="title">{`Total: ₱${data.item.totalPrice}`}</ThemedText> */}
                </View>
              </View>
            </TouchableHighlight>
          )}
          renderHiddenItem={ (data, rowMap) => (
            <TouchableHighlight underlayColor='#E5F1FD' style={[styles.cardDelete]} >
              <View style={styles.deleteContainer}>
                <TabBarIcon onPress={() => handleDelete(data.item.products)} style={{color: '#ffff'}} color={'#972B21'} name={'trash'}/>
              </View>
            </TouchableHighlight>
          )}
          // leftOpenValue={75}
          rightOpenValue={-70}
        />
        <Modal onSwipeMove={() => {}} isVisible={openModal} deviceWidth={deviceWidth}>
          <DeleteModal handleCancel={handleCancel} title='Delete Item' handleSubmit={handleDeleteItem}/>
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
    fontSize: 24
  },
  buttonText2: {
    color: '#000' ,
    fontSize: 14,
    fontWeight: 400
  },
  buttonTileContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
    padding: 5,
    paddingHorizontal: 8
  },
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#E5F1FD',
    height: '100%',
    padding: 32,
    paddingHorizontal: 0,
    paddingBottom: 0
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
    marginTop: 5,
  },
  deleteContainer: {
    backgroundColor: '#972B21',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 39,
    width: 70
    // width: '10%'
  }
});

export default Cart;

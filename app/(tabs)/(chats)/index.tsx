import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableHighlight, View
} from 'react-native';

import Product from '@/components/product';
import Loading from '@/components/Spinner';
import StackScreen from '@/components/StackScreen';
import TextInputIcon from '@/components/TextInputIcon';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Redirect, router } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import Modal from "react-native-modal";
import { SwipeListView } from 'react-native-swipe-list-view';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { API_METHOD, request } from '@/services/request';
import api from '@/services/api';
import { AuthContext } from '@/context/AuthContext';
import { LinkProps } from '../(index)/pharmacies';
import moment, { Moment } from 'moment';
import useWebSocket from '@/hooks/useWebsocket';
import { API_BASE_PATH } from '@/services/axios';

export type ChatRoomProps = {
  name: string;
  unread?: number
  chatRoomId: number;
  ts: Date | string | Moment
  _links: LinkProps
}

type ChatMessage = {
  chatRoomId: string 
  content: string
  name:string
  storeId: number
  to: string
  userId: number
}

const ChatList = () => {
  const [isAuthenticate, setIsAuthenticate] = useState(true);
  const [spinner, setSpinner] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [data, setData] = useState<ChatRoomProps[]>([]);
  
  const { state } = useContext(AuthContext);

  let URL = API_BASE_PATH.replace('/api', '');
  const { message } = useWebSocket(URL + '/websocket', '/topic/user/' + state.user.userId); // URL to your WebSocket server

  const handleChat = (chatRoomId : number) => {
    setSpinner(true);
    setTimeout(() => {
      setSpinner(false);
      router.push({ pathname: '/(tabs)/(chats)/chat', params: { id: chatRoomId }})
    }, 1000)
  }

  const handleSearch = (e: string) => {
    setSpinner(true);
    setTimeout(() => {
      setSpinner(false);
    }, 1000)
    setKeyword(e);
  }

  const handleGetData = async() => {
    const response = await request({
      url:  api.CHAT_ROOMS_API + '/search/findByUserUserId',
      method: API_METHOD.GET,
      params: {
        userId: state.user?.userId
      }
    });

    const { data } = response
    const newData = data._embedded.chatRooms.map((item : ChatRoomProps) => {
      const newId = item._links.self.href.replace(`${api.CHAT_ROOMS_API}/`, '');
      return {
        ...item,
        chatRoomId: newId,
        name: item.name
      }
    })

    setData(newData);
  }

  useEffect(() => {
    if (!message) {
      return;
    }
    let mess: ChatMessage =  JSON.parse(message);
    const newData = data.map((i: ChatRoomProps) => {
      console.log('i.chatRoomId --- ', i.chatRoomId, mess.chatRoomId, i.chatRoomId == parseInt(mess.chatRoomId));
      if (i.chatRoomId == parseInt(mess.chatRoomId)) {
        console.log('ITEM', i);
        return {
          ...i,
          unread: 1,
          ts: new Date()
        }
      }
      return i;
    })
    setData(newData);
  }, [message]);

  useEffect(() => {
    handleGetData();
  }, []);
  
  console.log('Data --- ', data, message);
  return (
    <>
      <StackScreen title='' animation='slide_from_right' headerBackVisible={true}
        headerLeft={() => (
          <View style={{ width: '95%'}}>
            <TextInputIcon withLabel={false} secureTextEntry={false} onChange={handleSearch} value={keyword} name='Search Chat' icon={'close-outline'} handleClickIcon={() => {}}/>
          </View>
        )}
      />
      <ThemedView style={styles.titleContainer}>
        {
          !spinner && data?.length === 0 ?
          <Text style={{ textAlign: 'center', fontStyle: 'italic'}}> No data found </Text>
        :
          <></>
        }
        <SwipeListView 
          disableLeftSwipe={true}
          disableRightSwipe={true}
          data={data}
          style={{ width: '100%', padding: 0}}
          renderItem={(data, rowMa) => (
            <TouchableHighlight underlayColor='#E5F1FD' style={[styles.card, styles.shadowProp]} onPress={() => handleChat(data.item.chatRoomId)}>
              <View style={styles.buttonTileContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12}}>
                    {
                      data.item.unread ?
                      <TabBarIcon style={{color: 'red', fontSize: 18, zIndex: 100, position: 'absolute', left: 30, top: -4}}  name={'notifications-circle'}/>
                      :
                      <></>
                    }
                    <View style={[data.item.unread ? { borderColor: '#4645', zIndex: 1, borderWidth: 3, padding: 2, borderRadius: 1000, height: 50, width: 50, justifyContent: 'center', alignItems: 'center'} : { borderColor: '#4545', borderWidth: 1, padding: 2, borderRadius: 1000, height: 50, width: 50, justifyContent: 'center', alignItems: 'center'}]}>
                      <TabBarIcon style={{color: '#136192'}}  name={'storefront'}/>
                    </View>
                    <ThemedText style={styles.buttonText} type="subtitle">{data.item.name}</ThemedText>
                  </View>
                  <ThemedText style={[styles.buttonText, styles.date]} type="default">{moment(data.item.ts).format('MMM DD HH:mm')}</ThemedText>
                </View>
              </View>
            </TouchableHighlight>
          )}
        />
        <Loading spinner={spinner}/>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  text: {
    color: '#ffff' 
  },
  date: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#454545' ,
  },
  buttonText: {
    color: '#136192' ,
    fontSize: 18
  },
  buttonTileContainer: {
    display: 'flex',
    // flexDirection: 'row',
    gap: 4,
    justifyContent: 'flex-start',
    // gap: 24,
  },
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#E5F1FD',
    height: '100%',
    padding: 16,
    paddingHorizontal: 0,
    paddingBottom: 0
  },
  shadowProp: {
    elevation: 4,
    shadowColor: '#171717',
    // shadowOffset: {width: -4, height: 4},
    // shadowOpacity: 0.2,
    // shadowRadius: 3,
  },
  card: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 25,
    width: '100%',
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
    paddingVertical: 54,
    width: 70
    // width: '10%'
  },
  verticleLine: {
    height: '100%',
    width: 1,
    backgroundColor: '#909090',
  },
  timeStyle: {
    width: '30%',
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
    width: '70%',
  }
});

export default ChatList;

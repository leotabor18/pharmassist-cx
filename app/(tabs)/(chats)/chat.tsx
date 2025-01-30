import { StyleSheet, Text, View } from 'react-native';

import Loading from '@/components/Spinner';
import StackScreen from '@/components/StackScreen';
import { AuthContext } from '@/context/AuthContext';
import useWebSocket from '@/hooks/useWebsocket';
import api from '@/services/api';
import { API_BASE_PATH } from '@/services/axios';
import { API_METHOD, request } from '@/services/request';
import { Client } from '@stomp/stompjs';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useContext, useEffect, useState } from 'react';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { ChatRoomProps } from '.';
import { IdProps } from '../(index)/pharmacy';
import moment from 'moment';

type UserProps = {
  _id: number
  name: string
  avatar: string
}

type MessageProps = {
  _id: number
  text: string
  createdAt: Date
  user: UserProps
  image?: string
}

type MessagePropsRes = {
  messageId: number;
  content: string;
  to: string;
  ts: Date
}

export default function Chats() {
  const [messages, setMessages] = useState<Array<IMessage>>([])
  const [name, setName] = useState('');
  const [spinner, setSpinner] = useState(false);
  const [client, setClient] = useState<Client | null>(null);

  const { state } = useContext(AuthContext);
  
  const item: IdProps = useLocalSearchParams();
  
  let URL = API_BASE_PATH.replace('/api', '');
  const { message } = useWebSocket(URL + '/websocket', '/topic/user/' + state.user.userId); // URL to your WebSocket server

  const getData = async () => {
    try {
      const response = await request({
        url   : api.CHAT_ROOMS_API + '/' + item.id ,
        method: API_METHOD.GET,
      });
  
      const chatRoomData: ChatRoomProps = response.data;
      setName(chatRoomData.name);
  
      const response2 = await request({
        url   : api.CHAT_ROOMS_API + '/' + item.id + '/messages',
        method: API_METHOD.GET,
        params: {
          size: 100000
        }
      });
  
      const { data } = response2;
      const chats: MessagePropsRes[] = data._embedded.messages;

      const newMessage = chats.map((item, index): MessageProps => {
        if (item.to === 'Store') {
          return {
            _id: index + Math.random() * 100,
            text: item.content,
            createdAt: new Date(item.ts),
            user: {
              _id: 1,
              name: state.user?.name ? state.user?.name : '',
              avatar: ''
            },
          }
        }

        return {
          _id: index,
            text: item.content,
            createdAt: new Date(item.ts),
            user: {
              _id: 2,
              name: state.user?.name ? state.user?.name : '',
              avatar: ''
            },
        }
      }).reverse()
      setMessages(newMessage);
    } catch {

    } finally {
      setSpinner(false);
    }
  }

  useEffect(() => {
    setSpinner(true)
    getData();
  }, [])

  useEffect(() => {
    if (message) {
      console.log('message ----- ', message)
      getData();
    }
  }, [message])

  const onSend = useCallback( async (messages: IMessage[]) => {
    const payload = {
      chatRoomId: item.id,
      content: messages[0].text, 
      userId: parseInt(state.user.userId), 
      name: `${state.user?.lastName}, ${state.user?.firstName}`,
      to: 'Store'
    }

    try {
      await request({
        url: api.WEBSOCKET_API + '/store',
        method: API_METHOD.POST,
        data: payload,
        headers: {
          'Content-Type': 'application/json'
        },
      })
    } catch {

    }
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, messages),
    )
  }, [])


  return (
    <>
      <StackScreen title={name} animation="slide_from_left" headerBackVisible={true} />
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        alwaysShowSend
        renderAvatar={null}
        renderBubble={(e) => {
          return (
            <>
            {
              e.currentMessage.user._id == 1 ?
                <View style={{ backgroundColor: '#136192', padding: 8, minWidth: 40, borderRadius: 8, margin: 4}}>
                  <Text style={{ fontSize: 16, color: '#ffff', marginBottom: 0}}>{e.currentMessage.text}</Text>
                  <Text style={{ fontSize: 8, color: '#ffff'}}>{moment(e.currentMessage.createdAt).format('HH:mm A')}</Text>
                </View>
              :
                <View style={{ backgroundColor: '#ffff', padding: 8, minWidth: 40, borderRadius: 8, margin: 4}}>
                  <Text style={{ fontSize: 16, marginBottom: 0}}>{e.currentMessage.text}</Text>
                  <Text style={{ fontSize: 8, margin: 4}}>{moment(e.currentMessage.createdAt).format('HH:mm A')}</Text>
                </View>
            }
            </>
          )
        }}
        // showUserAvatar={true}
        user={{
          _id: 1
        }}
      />
      <Loading spinner={spinner}/>
    </>

  )
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});

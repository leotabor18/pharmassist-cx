import { useState, useEffect, useCallback } from 'react';
import SockJS from 'sockjs-client'; // Import SockJS
import { CompatClient, Stomp } from '@stomp/stompjs'; // Import STOMP client
import 'text-encoding';

interface WebSocketHook {
  message: string;
  error: string | null; // Adding error state
}

const useWebSocket = (url: string, topic: string): WebSocketHook => {
  const [message, setMessage] = useState<string>(''); // State to store the message
  const [error, setError] = useState<string | null>(null); // State to store errors
  const [stompClient, setStompClient] = useState<CompatClient | null>(null);

  useEffect(() => {
    const client = Stomp.over(() => {
      return new SockJS(url)
    });
    
    const connectToWebSocket = () => {
      console.log('Connecting to WebSocket..', url + topic);
      client.connect({}, () => {
        setStompClient(client); 
        console.log('Connected to WebSocket', url + topic);

        client.subscribe(topic, (message) => {
          setMessage('')
          console.log('Received message:', message.body);
          setMessage(message.body);
        });
      }, (error:any) => {
        setError(`Connection error: ${error}`);
        console.error('STOMP connection error:', error);
      });
    };

    connectToWebSocket();

    return () => {
      if (stompClient) {
        stompClient.disconnect(() => {
          console.log('Disconnected from WebSocket');
        });
      }
    };
  }, [url, topic]);

  return { message, error }; // Return message and error state for use in components
};

export default useWebSocket;

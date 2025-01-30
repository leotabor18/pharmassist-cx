import AsyncStorage from '@react-native-async-storage/async-storage';

export const getLocalStorageItem = async (key: string): Promise<any | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error reading AsyncStorage value', e);
    return null;
  }
};

export const setLocalStorageItem = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error writing AsyncStorage value', e);
  }
};
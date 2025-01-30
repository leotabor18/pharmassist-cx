import { LinkProps } from '@/app/(tabs)/(index)/pharmacies';
import { ProductItemProps } from '@/app/(tabs)/(index)/pharmacy';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import Loading from '@/components/Spinner';
import StackScreen from '@/components/StackScreen';
import { ThemedText } from '@/components/ThemedText';
import { AuthContext } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import api from '@/services/api';
import { API_METHOD, request } from '@/services/request';
import { Surface } from '@react-native-material/core';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router } from 'expo-router';
import { useContext, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, ToastAndroid, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import InputSpinner from "react-native-input-spinner";

type ProductProps = {
  selectItem: ProductItemProps | undefined
  handleCancel: () => void
  description?: string
}

export type ReservationListProps = {
  reservationListId: number
  storeId: number
  storeName: string
  quantity: number
  total: number
  price: number
  stock: number
  productNumber: string
  productItemId: number
  productName: string
  _links: LinkProps
}

const Product = (props: ProductProps) => {
  const {handleCancel, selectItem} = props;

  const [spinner, setSpinner] = useState(false);
  const [value, setValue] = useState(1);
  const [stock, setStock] = useState(selectItem?.stock);

  const { state } = useContext(AuthContext);

  const handleAddtoCart = async () => {
    if (stock === 0) {
      return;
    }

    setSpinner(true);
    try {
      const id = selectItem?._links.self.href.replace(`${api.PRODUCT_ITEMS_API}/`, '')
      const response = await request({
        url   : api.RESERVATION_LIST_API,
        method: API_METHOD.POST,
        data: {
          quantity: value,
          productItemId: id,
          storeId: selectItem?.storeId
        }
      });

      const data: ReservationListProps = response.data;

      const link = data._links.self.href

      await request({
        url   : link + '/user',
        method: API_METHOD.PUT,
        headers: {
          'Content-Type': 'text/uri-list'
        },
        data: `${api.USERS_API}/${state?.user?.userId}`, // Type assertion
      });


      setSpinner(false);
      handleCancel();
      showToast();
    }catch {
      setSpinner(false);
    }

  }


  const showToast = () => {
    ToastAndroid.show('Product has been added to your items', ToastAndroid.SHORT);
  };


  const handleChange = (num: number) => {
    setValue(num);
    // console.log('num', num)
  }

  return (
    <>
       <Surface style={styles.container} >
        <TouchableHighlight style={[styles.card, styles.shadowProp]}>
          <View style={styles.buttonTileContainer}>
            <View style={styles.content}>
              <View style={styles.textTitle}>
                <ThemedText style={styles.name} type="title">{selectItem?.name}</ThemedText>
                <ThemedText style={styles.genericName} type="subtitle">{selectItem?.genericName}</ThemedText>
              </View>
              <View style={styles.description}>
                <ThemedText style={styles.descriptionText} type="subtitle">About the product:</ThemedText>
                <ThemedText style={styles.descriptionText2} type="subtitle">{selectItem?.description}</ThemedText>
                {
                  stock === 0 ?
                  <ThemedText style={[styles.descriptionText2, { marginTop: 16, color: '#972B21', fontStyle: 'italic'}]} type="subtitle">Sorry, this product is currently unavailable.</ThemedText>
                  :
                  <></>
                }
              </View>
              <View style={{ marginTop: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                <InputSpinner
                  min={0}
                  max={stock}
                  step={1}
                  colorMax={"#136192"}
                  colorMin={"#136192"}
                  showBorder
                  rounded={false}
                  value={value}
                  onChange={handleChange}
                  editable={false}
                  buttonStyle={{ backgroundColor: '#136192'}}
                  // width={150}
                />
                {/* <ThemedText style={styles.text} type="subtitle">10</ThemedText> */}
              </View>
              {/* <View style={styles.textContainer}>
                <ThemedText style={styles.text} type="subtitle">Sample Product Description</ThemedText>
              </View> */}
              {
                selectItem?.withPrescription == 1 ?
                  <>
                    <View style={styles.underline}></View>
                    <ThemedText style={{color: '#972B21', fontStyle: 'italic', fontSize: 14, marginTop: 4}} type="default">
                      *Note: This product requires a prescription. Please bring a valid, signed prescription from your registered physician. Transactions without it will be void.
                    </ThemedText>
                  </>
                :
                  <></>
              }
              <View style={styles.actionButton}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                  >
                    <Text> Cancel </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={stock === 0 ? styles.cancelButton : styles.submitButton}
                    onPress={handleAddtoCart}
                  >
                    <Text style={stock === 0 ? {} : styles.actionButtonText}> Add to My Items </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableHighlight>
          <Loading spinner={spinner}/>
        </Surface>
      {/* </SafeAreaView> */}
    </>
  )
}


const styles = StyleSheet.create({
  underline: {
    height: 1,
    width: '100%',
    marginTop: 16,
    backgroundColor: '#136192',
  },
  container: {
    // flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    // backgroundColor: '#E5F1FD',
    // padding: 8
  },
  content: {
    width: '100%',
  },
  textTitle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
  },
  name: {
    fontSize: 20,
    letterSpacing: 1
  },
  genericName: {
    fontSize: 16,
    letterSpacing: 1
  },
  description: {
    marginTop: 24
  },
  descriptionText: {
    // fontWeight: '500',
    fontSize: 16,
    // letterSpacing: 1
  },
  descriptionText2: {
    fontWeight: '400',
    fontSize: 16,
    // letterSpacing: 1
  },
  buttonTileContainer: {
   padding: 16,
   paddingHorizontal: 8,
   width: '100%',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    // paddingVertical: 4,
    paddingHorizontal: 25,
    width: '100%',
    marginVertical: 8,
  },
  shadowProp: {

  },
  actionButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
    width: '100%',
    padding: 16
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    width: 130
    // width: '100%'
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#136192',
    padding: 10,
    width: 130
  },
  actionButtonText: {
    color: '#ffff',
  }
});

export default Product
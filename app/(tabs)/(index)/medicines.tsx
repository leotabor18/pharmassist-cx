import {
  Dimensions,
  ListRenderItemInfo,
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
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import Modal from "react-native-modal";
import { SwipeListView } from 'react-native-swipe-list-view';
import api from '@/services/api';
import { API_METHOD, request } from '@/services/request';
import { ProductItemProps } from './pharmacy';

export type SearchMedicinceProps = {
  size: number
  name?: string
  genericName?: string
  productNumber?: string
  sort?: string
}
const Medicines = () => {
  const [isAuthenticate, setIsAuthenticate] = useState(true);
  const [spinner, setSpinner] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [selectedItem, setSelectedItem] = useState<ProductItemProps>();
  const [products, setProducts] = useState<ProductItemProps[]>([]);

  const [data, setData] = useState([1, 2, 3, 4, 5]);

  const handleCancel = () => {
    setOpenModal(false)
  }

  const deviceWidth = Dimensions.get("window").width;

  const handleSearch = (e: string) => {
    setSpinner(true);
    setTimeout(() => {
      setSpinner(false);
    }, 1000)
    setKeyword(e);
  }

  const onSwipeMove = (percentage: number) => {
    if (Math.floor(percentage * 100) < 15) {
      setOpenModal(false);
    } 
  }

  const handleOpenItem = (value: ProductItemProps) => {
    setSelectedItem(value);

    setOpenModal(prev => !prev);
  }
  const getUrl = () => {
    let url = api.PRODUCT_ITEMS_API + '/search/search-products-with-stock';
    if (keyword) {
      url = api.PRODUCT_ITEMS_API + '/search/search-products-list-with-stock';
    }
    return url
  }

  const getProductData = async() => {
    setSpinner(true);
  
    let params: SearchMedicinceProps = {
      size: 10000,
      sort: `name,asc`
    }

    if (keyword) {
      params = {
        ...params,
        name: keyword,
        productNumber: keyword,
        genericName: keyword,
      }
    }

    try {
      const secondResponse = await request({
        url   : getUrl(),
        method: API_METHOD.GET,
        params: params
      });
  
      const newProductItems = await Promise.all(secondResponse.data._embedded.productItems.map( async (item: ProductItemProps) => {
        const id = item._links.self.href.replace(`${api.PRODUCT_ITEMS_API}/`, '')
  
        const store = await request({
          url:  api.STORE_API + '/' + item.storeId,
          method: API_METHOD.GET,
        })
  
        return {
          ...item,
          store: store.data,
          productItemId: id
        }
      }))
  
      setProducts(newProductItems);
    } catch {

    } finally {
      setSpinner(false);
    }
    
  }

  useEffect(() => {
    getProductData();
  }, [keyword])

  console.log('Products', products)

  return (
    <>
      <StackScreen title='' animation='slide_from_right' headerBackVisible={true}
        headerLeft={() => (
          <View style={{ width: '90%'}}>
            <TextInputIcon withLabel={false} secureTextEntry={false} onChange={handleSearch} value={keyword} name='Search Medicine' icon={'close-outline'} handleClickIcon={() => {}}/>
          </View>
        )}
      />
      <ThemedView style={styles.titleContainer}>
        {/* <SwipeRow>
          <View/>
          <View/> */}
        {/* </SwipeRow> */}
        {
          !spinner && products?.length === 0 ?
          <Text style={{ textAlign: 'center', fontStyle: 'italic'}}> No data found </Text>
        :
          <></>
        }
        <SwipeListView 
          disableLeftSwipe={true}
          disableRightSwipe={true}
          data={products}
          style={{ width: '100%', padding: 0}}
          renderItem={(data, rowMa) => (
            <TouchableHighlight  underlayColor='#E5F1FD' style={[styles.card, styles.shadowProp]} onPress={() => handleOpenItem(data.item)}>
              <View style={styles.buttonTileContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
                  <ThemedText style={styles.buttonText} type="title">{data.item.name}</ThemedText>
                  <ThemedText style={[styles.rightContent, styles.name]} type="subtitle">₱{data.item.price}</ThemedText>
                  {/* <ThemedText style={styles.buttonText} type="title">10</ThemedText> */}
                </View>
                <ThemedText style={[styles.dateStyleText, { fontSize: 14}]} type="title">Pharmacy: {data.item.store.name}</ThemedText>
                <ThemedText style={[styles.dateStyleText, { fontSize: 14}]} type="title">Address: {data.item.store.firstAddress}, {data.item.store.secondAddress}, {data.item.store.city}</ThemedText>
              </View>
            </TouchableHighlight>
          )}
        />
        <Loading spinner={spinner}/>
        <Modal onSwipeMove={onSwipeMove} isVisible={openModal} deviceWidth={deviceWidth} swipeDirection={'down'} backdropTransitionOutTiming={1} swipeThreshold={1}>
          <Product handleCancel={handleCancel} selectItem={selectedItem}/>
        </Modal>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  name: {
    color: '#136192',
  },
  rightContent: {
    position: 'absolute',
    right: 0,
    // bottom: 8,
    fontSize: 24,
    fontWeight: 'bold'
  },
  text: {
    color: '#ffff' 
  },
  buttonText: {
    color: '#136192' ,
    fontSize: 24
  },
  buttonTileContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    // gap: 24,
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

export default Medicines;

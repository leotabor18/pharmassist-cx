import React, { useState } from 'react'
import { StyleSheet, TouchableHighlight, View } from 'react-native'
import { TabBarIcon } from './navigation/TabBarIcon'
import { ThemedText } from './ThemedText'
import StarRating from 'react-native-star-rating-widget'
import { router } from 'expo-router'
import Loading from './Spinner'

type PharmaciesProps = {
  id: number
  name?: string
  address?: string
  distance?: string
  status?: string
}

const Pharmacies = (props: PharmaciesProps) => {
  const { id, name, address, distance, status } = props;
  const [spinner, setSpinner] = useState(false);
  const [start, setStart] = useState(0);
  
  const handlePharmacy = () => {
    console.log('CLcu', id)
    router.push({ pathname: '/(tabs)/(index)/pharmacy', params: {id: id}})
  }
  
  return (
    <TouchableHighlight underlayColor='#E5F1FD' style={[styles.card, styles.shadowProp]} onPress={handlePharmacy}>
      <View style={styles.buttonTileContainer}>
        <TabBarIcon style={{color: '#136192'}} size={40} name={'storefront'}/>
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <ThemedText style={styles.name} type="subtitle">{name}</ThemedText>
            {/* <StarRating
              style={styles.rightContent}
              starStyle={styles.star}
              rating={4}
              starSize={16}
              onChange={setStart}
            /> */}
          </View>
          <View style={styles.textContainerAddr}>
            <ThemedText style={styles.text} type="subtitle">{address}</ThemedText>
          </View>
          <View style={styles.textContainer}>
            {/* <ThemedText style={styles.text} type="subtitle">0.5 km</ThemedText> */}
            <ThemedText style={[styles.rightContent, styles.text]} type="subtitle">{status}</ThemedText>
          </View>
        </View>
        <Loading spinner={spinner}/>
      </View>
    </TouchableHighlight>
  )
}


const styles = StyleSheet.create({
  appBar: { padding: 16, backgroundColor: '#136192' },
  text: {
    fontSize: 14,
    fontWeight: 400,
    color: '#136192' ,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: 4,
    // position: 'absolute',
    // // left: 0,
    // justifyContent: 'space-between',
    // right: 0
  },
  buttonText: {
    color: '#136192' ,
    fontSize: 24
  },
  name: {
    color: '#136192',
  },
  address: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  textContainer :{
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    alignItems: 'center',
  },
  textContainerAddr :{
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    alignItems: 'center',
    maxWidth: '70%'
  },
  buttonTileContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    padding: 4,
  },
  rightContent: {
    position: 'absolute',
    right: 40,
    bottom: 4
  },
  shadowProp: {
    elevation: 4,
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 25,
    width: '100%',
    marginVertical: 8,
  },
  star: {
    marginLeft: -4
  }
});

export default Pharmacies
import React from 'react'
import { StyleSheet, TouchableHighlight, View } from 'react-native'
import { TabBarIcon } from './navigation/TabBarIcon'
import { ThemedText } from './ThemedText'

type PharmacyItemProps = {
  handlePharmacyItem: (id: number, name: string, description: string) => void
  name: string
  description: string
  price?: number
  status?: string
}

const PharmacyItem = (props: PharmacyItemProps) => {
  const { name, description, price, status, handlePharmacyItem } = props;

  const handleClickItem = (id: number, name: string, description: string) => {
    handlePharmacyItem(id, name, description)
  }

  return (
    <TouchableHighlight underlayColor='#E5F1FD' style={[styles.card, styles.shadowProp]} onPress={() => handlePharmacyItem(1, name, description)}>
      <View style={styles.buttonTileContainer}>
        {/* <TabBarIcon style={{color: '#136192'}} size={40} name={'storefront'}/> */}
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <ThemedText style={styles.name} type="subtitle">{name}</ThemedText>
            <ThemedText style={[styles.rightContent, styles.name]} type="subtitle">₱{price}</ThemedText>
          </View>
          <View style={styles.textContainer}>
            <ThemedText style={styles.text} type="subtitle">{description}</ThemedText>
            {/* <ThemedText style={[styles.text, styles.rightContent]} type="subtitle">{price}</ThemedText> */}
          </View>
        </View>
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
  },
  name: {
    color: '#136192',
  },
  textContainer :{
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    alignItems: 'center'
  },
  buttonTileContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    padding: 8,
  },
  rightContent: {
    position: 'absolute',
    right: 0,
    // bottom: 8,
    fontSize: 24,
    fontWeight: 'bold'
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
  }
});

export default PharmacyItem
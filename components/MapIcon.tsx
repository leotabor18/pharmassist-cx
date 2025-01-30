import Ionicons from '@expo/vector-icons/Ionicons'
import React, { ComponentProps } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { TabBarIcon } from './navigation/TabBarIcon'

type TextFieldProps = {
  name: String
  icon: ComponentProps<typeof Ionicons>["name"]; 
  isOpen: Boolean
  onClick?: () => void
}

const MapIcon = (props: TextFieldProps) => {
  const { name, icon, isOpen, onClick} = props;


  return (
    <View style={isOpen? styles.container : styles.containerClose} >
        <TabBarIcon style={styles.icon} color={isOpen ? '#136192' : '#ffff'} name={icon} onPress={onClick}/>
        <Text style={isOpen? styles.text : {color: '#fff'}} onPress={onClick}> {name} </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    width: 'auto',
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  containerClose: {
    justifyContent: 'center',
    width: 220,
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#972B21',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    right: 0,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  }
})

export default MapIcon
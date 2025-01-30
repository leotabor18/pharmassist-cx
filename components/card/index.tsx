import React from 'react'
import { Alert, StyleSheet, TouchableHighlight, View } from 'react-native'
import { TabBarIcon } from '../navigation/TabBarIcon'
import { ThemedText } from '../ThemedText'

type CardProps = {
  handleClick: () => {}
  title: string
  icon: any
}

const Card = (props: CardProps) => {
  const {title, handleClick, icon } = props;

  return (
    <TouchableHighlight underlayColor='#E5F1FD' style={[styles.card, styles.shadowProp]} onPress={handleClick}>
      <View style={styles.buttonTileContainer}>
        <TabBarIcon style={{color: '#136192'}}  name={icon}/>
        <ThemedText style={styles.buttonText} type="title">{title}</ThemedText>
      </View>
    </TouchableHighlight>
  )
}


const styles = StyleSheet.create({
  buttonText: {
    color: '#136192' ,
    fontSize: 24
  },
  buttonTileContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#E5F1FD',
    height: '100%',
    gap: 8,
    padding: 32,
    borderRadius: 24
  },
  shadowProp: {
    elevation: 20,
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 25,
    width: '100%',
    marginVertical: 10,
  },
});

export default Card
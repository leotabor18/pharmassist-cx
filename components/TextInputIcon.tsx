import { Icon, IconProps } from '@react-native-material/core'
import React, { ComponentProps } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import { TabBarIcon } from './navigation/TabBarIcon'
import { GestureEvent } from 'react-native-gesture-handler'
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedText } from './ThemedText'

type TextFieldProps = {
  value: any
  onChange: (e: any) => void
  handleClickIcon: () => void
  name: string
  secureTextEntry?: boolean
  icon: ComponentProps<typeof Ionicons>["name"]; 
  withLabel: boolean
}

const TextInputIcon = (props: TextFieldProps) => {
  const { onChange, value, name, secureTextEntry, handleClickIcon, icon, withLabel} = props;

  const onClickIcon = () => {
    handleClickIcon();
  }

  return (
    <View style={styles.container}>
      {
        withLabel ?
        <ThemedText style={styles.text} type="title">{name}</ThemedText>
        :
        <></>
      }
      <View style={styles.textContainer}>
        <TextInput
          secureTextEntry={secureTextEntry}
            style={styles.input}
            placeholder={name}
            onChangeText={onChange}
            keyboardType="default"
            value={value}
        />
        <TabBarIcon color={'#136192'} style={styles.icon} name={icon} onPress={onClickIcon}/>
      </View>
  </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    width: '100%',
  },
  textContainer: {
    position: 'relative',
    marginTop: 8,
    marginBottom: 8,
  },
  icon: {
      padding: 10,
      position: 'absolute',
      right: 0,
  },
  input: {
      padding: 10,
      backgroundColor: '#fff',
      color: '#424242',
      borderRadius: 8,
      marginLeft: 0,
      marginRight: 0,
      borderWidth: 1,
      borderColor: '#4545',
      width: '100%',
  },
  text: {
    fontSize: 18,
    fontWeight: '400',
  }
})

export default TextInputIcon
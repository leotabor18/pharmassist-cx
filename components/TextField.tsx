import React, { useState } from 'react'
import { StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { Control, Controller, FieldValue, useForm } from 'react-hook-form';

type TextFieldProps = {
  value: string
  onChange: (e: string) => void
  name: string
  secureTextEntry?: boolean
  helperText?: string
  control?: any
  errors?: boolean
  isSubmit?: boolean
}

const TextField = (props: TextFieldProps) => {
  const { value, onChange, name, secureTextEntry, helperText, control, errors, isSubmit } = props;
  const [onInputChange, setOnInputChange] = useState(isSubmit);

  const handleChange = (e: string) => {
    setOnInputChange(false);
    onChange(e)
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.text} type="title">{name}</ThemedText>
        <TextInput
          secureTextEntry={secureTextEntry}
          style={styles.input}
          onChangeText={e => handleChange(e)}
          value={value}
          placeholder={name}
          keyboardType="default"
        />
      {
        !value && onInputChange ? <ThemedText style={styles.textError} type="subtitle">{helperText}</ThemedText> : <></>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    width: '100%'
  },
  text: {
    fontSize: 18,
    fontWeight: '400',
  },
  inputError: {
    borderRadius: 8,
    margin: 8,
    marginLeft: 0,
    borderWidth: 1,
    borderColor: '#E40C0C',
    width: '100%',
    padding: 10,
  },
  textError: {
    fontSize: 14,
    fontWeight: '400',
    color: '#E40C0C'
  },
  input: {
    borderRadius: 8,
    margin: 8,
    marginLeft: 0,
    borderWidth: 1,
    borderColor: '#4545',
    width: '100%',
    padding: 10,
  },
  logo: {
    width: 200,
    height: 150,
  },
});


export default TextField
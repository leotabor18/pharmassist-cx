import React from 'react'
import { StyleSheet } from 'react-native';
import Spinner  from 'react-native-loading-spinner-overlay';

type SpinnerProps = {
  spinner: boolean
}
const Loading = (props: SpinnerProps) => {
  const { spinner } = props;
  return (
    <Spinner
      visible={spinner}
      textContent={'Loading...'}
      textStyle={styles.spinnerTextStyle}
    />
  )
}

const styles = StyleSheet.create({
  spinnerTextStyle: {
    color: '#fff'
  }
});
export default Loading
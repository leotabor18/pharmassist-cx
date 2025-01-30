import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import Loading from '@/components/Spinner';
import { ThemedText } from '@/components/ThemedText';
import { Surface } from '@react-native-material/core';
import { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import { ReservationListProps } from './product';

type DeletModalProps = {
  name?: string
  handleCancel: () => void
  title?: string
  handleSubmit: () => void
}

const DeleteModal = (props: DeletModalProps) => {
  const { handleCancel, title,  handleSubmit} = props;

  const [spinner, setSpinner] = useState(false);

  const handleDelete = () => {
    handleSubmit();
    handleCancel();
  }

  return (
    <>
       <Surface style={styles.container} >
        <TouchableHighlight style={[styles.card, styles.shadowProp]}>
          <View style={styles.buttonTileContainer}>
            <View style={styles.content}>
              <View style={styles.textTitle}>
                <TabBarIcon style={{fontSize: 40}} name='warning-outline' color={'#972B21'}/>
                <ThemedText style={styles.name} type="subtitle">{title?? 'Delete Reservation'}</ThemedText>
              </View>
              <View style={styles.description}>
                <ThemedText style={styles.descriptionText2} type="subtitle">Are you sure you want to remove this {title ? 'item': 'reservation'}?</ThemedText>
              </View>
              {/* <View style={styles.textContainer}>
                <ThemedText style={styles.text} type="subtitle">Sample Product Description</ThemedText>
              </View> */}
              <View style={styles.actionButton}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                  >
                    <Text> Cancel </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleDelete}
                  >
                    <Text style={styles.actionButtonText}> Yes </Text>
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
    gap: 4
  },
  text: {
    fontSize: 24,
  },
  name: {
    // fontSize: 24,
    letterSpacing: 1
  },
  genericName: {
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
    width: 120
    // width: '100%'
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#136192',
    padding: 10,
    width: 120
  },
  actionButtonText: {
    color: '#ffff',
  }
});

export default DeleteModal
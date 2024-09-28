import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors } from '../constants/colors';
import { spacing } from '../constants/dimensions';

const Separator = () => {
  return (
    <View style={styles.separator} />
  )
}

export default Separator

const styles = StyleSheet.create({
    separator: {
        height: 1,
        backgroundColor: Colors.LightGray,
        marginHorizontal: spacing.sm,
      },
})
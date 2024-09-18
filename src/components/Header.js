import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import Ionicons from "react-native-vector-icons/Ionicons"
import { Colors } from '../constants/colors'
import { Fonts } from '../constants/fonts'
import { iconSize } from '../constants/dimensions'

const Header = ({ title, onBackPress }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.iconContainer} onPress={onBackPress}>
        <Ionicons name={'arrow-back'} color={Colors.Black} size={iconSize.md} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4, 
  },
  iconContainer: {
    position: 'absolute',
    left: 5,
  },
  headerTitle: {
    fontSize: 18,
    color: Colors.Black,
    fontFamily: Fonts.interBold,
  },
})

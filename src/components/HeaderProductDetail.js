import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import Ionicons from "react-native-vector-icons/Ionicons"
import { Colors } from '../constants/colors'
import { Fonts } from '../constants/fonts'
import { iconSize } from '../constants/dimensions'

const Header = ({ title, onBackPress, showFavoriteIcon, onFavoritePress }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.iconContainer} onPress={onBackPress}>
        <Ionicons name={'arrow-back'} color={Colors.Black} size={iconSize.sm} />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>{title}</Text>
      
      {showFavoriteIcon && (
        <TouchableOpacity style={styles.favoriteIconContainer} onPress={onFavoritePress}>
          <Ionicons name={'heart-outline'} color={Colors.Black} size={iconSize.sm} />
        </TouchableOpacity>
      )}
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
  header: {
    position: 'absolute', 
    top: 25,
    left: 8,
    right: 8,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    zIndex: 1, 
  },
  iconContainer: {
    position: 'absolute',
    left: 5,
    width: 35, 
    height: 35, 
    borderRadius: 20, 
    backgroundColor: Colors.White, 
    borderWidth: 0.3,
    borderColor: Colors.Black, 
    alignItems: 'center', 
    justifyContent: 'center', 
  },
  headerTitle: {
    fontSize: 18,
    color: Colors.Black,
    fontFamily: Fonts.interBold,
  },
  favoriteIconContainer: {
    position: 'absolute',
    right: 5,
    width: 35, 
    height: 35, 
    borderRadius: 20, 
    backgroundColor: Colors.White, 
    borderWidth: 0.3,
    borderColor: Colors.Black, 
    alignItems: 'center', 
    justifyContent: 'center', 
  },
})

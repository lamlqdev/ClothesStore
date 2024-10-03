import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Colors } from '../constants/colors'
import { Fonts } from '../constants/fonts'

const Category = ({item, selectedCategory, setSelectedCategory}) => {
  return (
    <TouchableOpacity onPress={() => setSelectedCategory(item)}>
      <Text 
        style={[styles.categoryText, 
        selectedCategory===item && {
            color: Colors.White, 
            backgroundColor: Colors.Brown,
        },
      ]}
      >
        {item}
       </Text>
    </TouchableOpacity>
  )
}

export default Category

const styles = StyleSheet.create({
    categoryText: {
        fontSize: 16,
        fontFamily: Fonts.interMedium,
        textAlign: 'center',
        color: Colors.Black,
        backgroundColor: Colors.White,
        borderColor: Colors.LightGray,
        borderWidth: 0.6,
        borderRadius: 20,
        marginHorizontal: 8,
        paddingHorizontal: 20,
        paddingVertical: 6,
    }
})
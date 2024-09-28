import { StyleSheet, Text, View, StatusBar, ScrollView } from 'react-native'
import React from 'react';
import { Colors } from '../constants/colors';
import Header from '../components/Header';
import Slider from '../components/Slider';
import ProductInfor from '../components/ProductInfor';
import SelectSize from '../components/SizeSelector';
import { fontSize, iconSize, spacing } from '../constants/dimensions';
import FooterCart from '../components/FooterCart';
import AddToCartButton from '../components/AddToCard';

const ProductDetail = () => {
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Slider/>
      <ProductInfor />
      <SelectSize/>
      <AddToCartButton/>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: Colors.White,
    },

})

export default ProductDetail

import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { fontSize, iconSize, spacing } from '../constants/dimensions';
import { Fonts } from '../constants/fonts';
import { Colors } from '../constants/colors';

const ProductInfor = ({ product }) => {
  const [expanded, setExpanded] = useState(false);
  const { name, description, rating } = product;
  
  const handleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      <View style={styles.styleInfoWrapper}>
        <Text style={styles.textProductName}>{name}</Text>
        <View style={styles.ratingWrapper}>
          <Image source={require("../../assets/images/star.png")} resizeMethod='contain' style={styles.rating} />
          <Text style={styles.textStyle}>{rating}</Text>
        </View>
      </View>
      
      <Text style={styles.textProductDetail}>Product Detail</Text>

      <Text style={styles.description}>
        {expanded ? description : `${description.slice(0, 100)}...`}
      </Text>

      <TouchableOpacity onPress={handleToggle} style={styles.readMoreContainer}>
        <Text style={styles.readMore}>
          {expanded ? 'Read Less' : 'Read More'}
        </Text>
      </TouchableOpacity>

      <View style={styles.divider} />
    </View>
  );
}

export default ProductInfor;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    marginStart: 15,
    marginEnd: 15,
    marginTop: 15,
  },
  styleInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textStyle: {
    fontFamily: Fonts.interLight,
    fontSize: 16,
    fontWeight: 'bold'
  },
  ratingWrapper: {
    flexDirection: 'row',
  },
  rating: {
    width: 24,
    height: 24,
    marginEnd: 5,
  },
  textProductName: {
    fontFamily: Fonts.interBold,
    fontSize: fontSize.lg,
    color: Colors.Black,
    marginTop: 10,
    marginBottom: 15,
  },
  textProductDetail: {
    fontFamily: Fonts.interBold,
    fontSize: fontSize.md,
    color: Colors.Black,
  },
  description: {
    fontFamily: Fonts.interLight,
    fontSize: 17,
    color: Colors.Black,
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.LightGray,
    marginVertical: 10,
  },
  readMoreContainer: {
    alignItems: 'center',
    marginVertical: 5,
  },
  readMore: {
    fontFamily: Fonts.interMedium,
    fontSize: 14,
    color: Colors.Brown,
  },
});

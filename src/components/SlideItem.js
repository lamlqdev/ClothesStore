import { StyleSheet, View, Image } from 'react-native';
import React from 'react';
import { Sizes } from '../constants/sizes';

const SlideItem = ({ item }) => {
  return (
    <View style={styles.container}>
      <Image source={item} style={styles.image} />
    </View>
  );
};

export default SlideItem;

const styles = StyleSheet.create({
  container: {
    width: Sizes.width,
    height: 350,
    alignItems: 'center',
  },
  image: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
});

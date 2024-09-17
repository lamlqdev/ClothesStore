import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import globalStyles from '../../styles/globalStyles';
import { Colors } from '../constants/colors';

const CartScreen = () => {
  return (
    <View style={globalStyles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={Colors.White}
      />
      <Text>This is the Cart Screen</Text>
    </View>
  );
};

export default CartScreen;

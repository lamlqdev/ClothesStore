import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import globalStyles from '../../styles/globalStyles';
import { Colors } from '../constants/colors';

const HomeScreen = () => {
  return (
    <View style={globalStyles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={Colors.White}
      />
      <Text>This is the Home Screen</Text>
    </View>
  );
};

export default HomeScreen;

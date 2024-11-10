import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

const linking = {
  prefixes: ["clothesstore://"],
  config: {
      screens: {
          PaymentSuccess: "payment-success",
          Payment: "payment-cancel",
      },
  },
};

const App = () => {
  return (
    <NavigationContainer linking={linking}>
      <AppNavigator />
    </NavigationContainer>
  )
}

export default App

const styles = StyleSheet.create({})
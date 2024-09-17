import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import Tabs from './src/navigation/TabNavigation';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (<AppNavigator/>
    // <NavigationContainer>
    //   <Tabs />
    // </NavigationContainer>
  )
}

export default App

const styles = StyleSheet.create({})
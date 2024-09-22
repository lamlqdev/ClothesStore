import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
<<<<<<< HEAD
import Tabs from './src/navigation/TabNavigation';

const App = () => {
  return (
    <NavigationContainer>
      <Tabs />
=======
import AdminNavigator from './src/navigation/AdminNavigator';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (//<AdminNavigator/>
    <NavigationContainer>
      <AppNavigator/>
>>>>>>> tanluong
    </NavigationContainer>
  )
}

export default App

const styles = StyleSheet.create({})
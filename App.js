import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import AdminNavigator from './src/navigation/AdminNavigator';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (//<AdminNavigator/>
    <NavigationContainer>
      <AppNavigator/>
    </NavigationContainer>
  )
}

export default App

const styles = StyleSheet.create({})
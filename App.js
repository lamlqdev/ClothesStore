import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import Tabs from './src/navigation/TabNavigation';
import AdminNavigator from './src/navigation/AdminNavigator';

const App = () => {
  return (//<AdminNavigator/>
    <NavigationContainer>
      <Tabs/>
    </NavigationContainer>
  )
}

export default App

const styles = StyleSheet.create({})
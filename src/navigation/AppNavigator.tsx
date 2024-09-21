import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ProductList from '../screens/ProductList';
import AddProduct from '../screens/AddProduct';
import EditProduct from '../screens/EditProduct';
import DeleteProduct from '../screens/DeleteProduct';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import VerifyCodeScreen from '../screens/VerifyCodeScreen';
import SendEmailScreen from '../screens/SendEmailScreen';
import NewPasswordScreen from '../screens/NewPasswordScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
       <Stack.Navigator initialRouteName="SignIn">
       <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
       <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
       <Stack.Screen name= "VerifyCode" component={VerifyCodeScreen}/>
       <Stack.Screen name= "SendEmail" component={SendEmailScreen}/>
       <Stack.Screen name="NewPassword" component={NewPasswordScreen}/>
        <Stack.Screen name="ProductList" component={ProductList} />
        <Stack.Screen name="AddProduct" component={AddProduct} />
        <Stack.Screen name="EditProduct" component={EditProduct} />
        <Stack.Screen name="DeleteProduct" component={DeleteProduct} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

const styles = StyleSheet.create({});

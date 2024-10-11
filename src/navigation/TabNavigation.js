import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors } from '../constants/colors';

import HomeScreen from '../screens/HomeScreen'
import CartScreen from '../screens/CartScreen'
import WishScreen from '../screens/WishScreen'
import MessageScreen from '../screens/MessageScreen'
import ProfileScreen from '../screens/ProfileScreen'

const Tab = createBottomTabNavigator();

const TabBarIcon = ({ focused, icon, label }) => {
    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <View style={[styles.iconBackground, {
                backgroundColor: focused ? Colors.White : Colors.Transparent
            }]} />
            <Image
                source={icon}
                resizeMode='contain'
                style={{
                    width: 25,
                    height: 25,
                    tintColor: focused ? Colors.Brown : Colors.White
                }}
            />
        </View>
    );
};

const FloatingTabBarButton = ({children, onPress}) => (
    <TouchableOpacity
        style={{
            top: -30,
            justifyContent: 'center',
            alignItems: 'center',
            ...styles.shadow
        }}
        onPress={onPress}
    >
        <View
            style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: Colors.Black
            }}
        >
            {children}
        </View>
    </TouchableOpacity>
)

const Tabs = ({ onLogout }) => {
    return(
        <Tab.Navigator 
            screenOptions={{
                tabBarShowLabel: false,
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 15,
                    right: 15,
                    elevation: 0,
                    backgroundColor: Colors.Black,
                    borderRadius: 45,
                    height: 70,
                    ...styles.shadow
                }
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabBarIcon
                            focused={focused}
                            icon={require('../../assets/icons/ic_home.png')}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Cart"
                component={CartScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabBarIcon
                            focused={focused}
                            icon={require('../../assets/icons/ic_cart.png')}
                        />
                    ),
                }}
            />
            <Tab.Screen 
                name="Wish" 
                component={WishScreen} 
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabBarIcon
                            focused={focused}
                            icon={require('../../assets/icons/ic_favourite.png')}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Message"
                component={MessageScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabBarIcon
                            focused={focused}
                            icon={require('../../assets/icons/ic_chat.png')}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabBarIcon
                            focused={focused}
                            icon={require('../../assets/icons/ic_profile.png')}
                        />
                    ),
                }}
            >
                {(props) => <ProfileScreen {...props} onLogout={onLogout} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    shadow: {
        shadowColor: '#7F5DF0',
        shadowOffset: {
            width: 0,
            height: 10
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5
    },
    iconBackground: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default Tabs;
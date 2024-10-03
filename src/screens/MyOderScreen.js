import React, { useState } from 'react';
import { View, StatusBar, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import OrderList from '../components/OrderList';
import { Colors } from '../constants/colors';
import { spacing } from '../constants/dimensions';
import { Fonts } from '../constants/fonts';

const MyOrderScreen = () => {
    const [activeTab, setActiveTab] = useState('active'); 
    const navigation = useNavigation();

    const activeOrders = [
        {
            id: '1',
            productImage: 'https://thursdayboots.com/cdn/shop/products/1024x1024-Men-Moto-Tobacco-050322-1_1024x1024.jpg?v=1652112663',
            productName: 'Brown Jacket',
            size: 'XL',
            quantity: 10,
            price: 83.97,
        },
        {
            id: '5',
            productImage: 'https://thursdayboots.com/cdn/shop/products/1024x1024-Men-Moto-Tobacco-050322-1_1024x1024.jpg?v=1652112663',
            productName: 'Blue Jacket',
            size: 'XL',
            quantity: 10,
            price: 83.97,
        },
    ];
  
    const completedOrders = [
        {
            id: '2',
            productImage: 'https://brabions.com/cdn/shop/products/image_20cb4685-80d3-43fa-b180-98cc626964dd.jpg?v=1620246884',
            productName: 'Black Hoodie',
            size: 'L',
            quantity: 5,
            price: 65.50,
        },
    ];
  
    const cancelledOrders = [
        {
            id: '3',
            productImage: 'https://thursdayboots.com/cdn/shop/products/1024x1024-Men-Moto-Tobacco-050322-1_1024x1024.jpg?v=1652112663',
            productName: 'Denim Jeans',
            size: 'M',
            quantity: 2,
            price: 45.20,
        },
    ];

    const handleTrackOrder = (item) => {
        console.log('Tracking order for:', item.productName);
    };

    const handleLeaveReview = (item) => {
        navigation.navigate('LeaveReview', { orderId: item.id });
    };

    const TabText = ({ title, isActive }) => (
        <TouchableOpacity onPress={() => setActiveTab(title.toLowerCase())}>
            <Text style={[styles.tabText, isActive && styles.activeTab]}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.White} />
            <Header title="My Orders" onBackPress={() => navigation.goBack()} />
            <View style={styles.buttonContainer}>
                <TabText title="Active" isActive={activeTab === 'active'} />
                <TabText title="Completed" isActive={activeTab === 'completed'} />
                <TabText title="Cancelled" isActive={activeTab === 'cancelled'} />
            </View>
            <View>
                {activeTab === 'active' && (
                    <OrderList
                        orderList={activeOrders.map(order => ({
                            ...order,
                            buttonText: 'Track Order',
                        }))}
                        onClickButton={handleTrackOrder}
                    />
                )}
                {activeTab === 'completed' && (
                    <OrderList
                        orderList={completedOrders.map(order => ({
                            ...order,
                            buttonText: 'Leave Review',
                        }))}
                        onClickButton={handleLeaveReview}
                    />
                )}
                {activeTab === 'cancelled' && (
                    <OrderList
                        orderList={cancelledOrders.map(order => ({
                            ...order,
                            buttonText: 'Reorder',
                        }))}
                        onClickButton={handleTrackOrder}
                    />
                )}
            </View>
        </View>
    );
};

export default MyOrderScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.sm,
        backgroundColor: Colors.White,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacing.sm,
        marginTop: spacing.sm,
    },
    tabText: {
        fontSize: 16,
        fontFamily: Fonts.interBold,
        color: Colors.Grey,
        paddingBottom: 8,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: Colors.Brown,
        color: Colors.Brown,
    },
});

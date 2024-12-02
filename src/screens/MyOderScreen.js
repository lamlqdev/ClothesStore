import React, { useState, useEffect } from 'react';
import { View, StatusBar, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import OrderList from '../components/OrderList';
import { Colors } from '../constants/colors';
import { spacing } from '../constants/dimensions';
import { Fonts } from '../constants/fonts';
import firestore from '@react-native-firebase/firestore';

const MyOrderScreen = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [activeOrders, setActiveOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);
    const [cancelledOrders, setCancelledOrders] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const isFocused = useIsFocused(); // Hook to check if screen is focused

    // Get userId from AsyncStorage
    const getUserId = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            return userId;
        } catch (error) {
            console.error('Failed to get userId from AsyncStorage', error);
            return null;
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        const userId = await getUserId();
        if (!userId) return;

        try {
            const ordersSnapshot = await firestore()
                .collection('Orders')
                .where('userId', '==', userId)
                .get();

            const orders = ordersSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    orderStatus: data.orderStatus,
                    products: data.products || [],
                    orderTime: data.orderTime.toDate(), // Ensure orderTime is a Date object
                };
            });

            // Sort orders by orderTime (newest to oldest)
            orders.sort((a, b) => b.orderTime - a.orderTime);

            // Categorize orders by status
            const active = orders.filter(order =>
                ['Waiting for payment', 'Active'].includes(order.orderStatus)
            );
            const completed = orders.filter(order => order.orderStatus === 'Completed');
            const cancelled = orders.filter(order => order.orderStatus === 'Cancelled');

            setActiveOrders(active);
            setCompletedOrders(completed);
            setCancelledOrders(cancelled);
            setAllOrders(orders);

        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    // Group orders by order date
    const groupOrdersByDate = (orders) => {
        return orders.reduce((groups, order) => {
            const dateKey = order.orderTime.toLocaleDateString(); // Use the date part of orderTime
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(order);
            return groups;
        }, {});
    };

    // Re-fetch orders when screen is focused
    useEffect(() => {
        if (isFocused) {
            fetchOrders();
        }
    }, [isFocused]);

    const handleTrackOrder = (order) => {
        navigation.navigate('TrackOrder', { order });
    };

    const handleReorder = (productId) => {
        navigation.navigate('ProductDetail', { productId });
    };

    const TabText = ({ title, isActive }) => (
        <TouchableOpacity onPress={() => setActiveTab(title.toLowerCase())}>
            <Text style={[styles.tabText, isActive && styles.activeTab]}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.Brown} />
            </View>
        );
    }

    const renderOrderList = (orders, onClickButton) => {
        const orderList = [];
        orders.forEach(order => {
            order.products.forEach(product => {
                const key = `${order.id}_${product.productId}`;

                let buttonText = '';
                if (order.orderStatus === 'Completed') {
                    buttonText = product.hasReviewed ? 'Reorder' : 'Leave Review';
                } else {
                    buttonText = 'Track Order';
                }

                orderList.push({
                    ...order,
                    ...product,
                    buttonText,
                    key,
                });
            });
        });

        if (orderList.length === 0) {
            return <Text style={styles.emptyText}>No orders found.</Text>;
        }

        return (
            <OrderList
                orderList={orderList}
                onClickButton={(item) => {
                    if (item.buttonText === 'Reorder') {
                        handleReorder(item.productId);
                    } else {
                        onClickButton(item);
                    }
                }}
            />
        );
    };

    const getOrderData = () => {
        switch (activeTab) {
            case 'all':
                return {
                    orders: allOrders,
                    onClickButton: (order) => {
                        // Kiểm tra đơn hàng đã hoàn thành chưa
                        if (order.orderStatus === 'Completed') {
                            // Kiểm tra tất cả sản phẩm trong đơn hàng đã được đánh giá chưa
                            const hasUnreviewedProduct = order.products.some(product => !product.hasReviewed);
                            
                            // Nếu có sản phẩm chưa được đánh giá, điều hướng tới LeaveReview
                            if (hasUnreviewedProduct) {
                                const orderData = { ...order, orderTime: order.orderTime.toISOString() };
                                navigation.navigate('LeaveReview', { order: orderData });
                            } else {
                                // Nếu tất cả sản phẩm đã được đánh giá, điều hướng tới ProductDetail
                                navigation.navigate('ProductDetail', { productId: order.products[0].productId });
                            }
                        } else {
                            // Nếu trạng thái đơn hàng là Active hoặc Waiting for payment, điều hướng đến TrackOrder
                            navigation.navigate('TrackOrder', { order });
                        }
                    },
                };
    
            case 'active':
                return {
                    orders: activeOrders,
                    onClickButton: (order) => {
                        // Khi đơn hàng có trạng thái "Active", điều hướng tới TrackOrder
                        navigation.navigate('TrackOrder', { order });
                    },
                };
        
            case 'completed':
                return {
                    orders: completedOrders,
                    onClickButton: (order) => {
                        // Kiểm tra tất cả sản phẩm đã được đánh giá hay chưa
                        const allReviewed = order.products.every(product => product.hasReviewed);
        
                        if (allReviewed) {
                            // Nếu tất cả sản phẩm đã được đánh giá, điều hướng tới ProductDetail
                            navigation.navigate('ProductDetail', { productId: order.products[0].productId });
                        } else {
                            // Nếu chưa, điều hướng tới LeaveReview
                            const orderData = { ...order, orderTime: order.orderTime.toISOString() };
                            navigation.navigate('LeaveReview', { order: orderData });
                        }
                    },
                };
        
            case 'cancelled':
                return { orders: cancelledOrders, onClickButton: handleReorder };
        
            default:
                return { orders: [], onClickButton: () => {} };
        }
    };                  

    const { orders, onClickButton } = getOrderData();

    // Group orders by date
    const groupedOrders = groupOrdersByDate(orders);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.White} />
            <Header title="My Orders" onBackPress={() => navigation.navigate('Profile')} />
            <View style={styles.buttonContainer}>
                <TabText title="All" isActive={activeTab === 'all'} />
                <TabText title="Active" isActive={activeTab === 'active'} />
                <TabText title="Completed" isActive={activeTab === 'completed'} />
                <TabText title="Cancelled" isActive={activeTab === 'cancelled'} />
            </View>

            <FlatList
                data={Object.keys(groupedOrders)} // Pass the keys (dates) as data for FlatList
                renderItem={({ item: date }) => (
                    <View key={date} style={styles.groupedOrdersContainer}>
                        <Text style={styles.dateHeader}>{date}</Text>
                        {renderOrderList(groupedOrders[date], onClickButton)}
                    </View>
                )}
                keyExtractor={(item) => item} // Key is the date
                contentContainerStyle={styles.scrollViewContainer}
            />
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
    dateHeader: {
        fontSize: 18,
        fontFamily: Fonts.interBold,
        color: Colors.Black,
        marginVertical: 8,
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    groupedOrdersContainer: {
        marginBottom: spacing.sm,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: spacing.md,
    },
    scrollViewContainer: {
        paddingBottom: spacing.md,
    },
});

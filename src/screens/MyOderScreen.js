import React, { useState, useEffect } from 'react';
import { View, StatusBar, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation,useIsFocused  } from '@react-navigation/native';
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
    const isFocused = useIsFocused(); // Hook để kiểm tra nếu màn hình được focus

    // Lấy userId từ AsyncStorage
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
                    orderTime: data.orderTime,
                };
            });

            console.log("All Orders:", orders); // In tất cả dữ liệu đơn hàng ra console

            // Phân loại đơn hàng theo trạng thái
            const active = orders.filter(order =>
                ['Waiting for payment', 'Active'].includes(order.orderStatus)
            );
            const completed = orders.filter(order => order.orderStatus === 'Completed');
            const cancelled = orders.filter(order => order.orderStatus === 'Cancelled');

            setActiveOrders(active);
            setCompletedOrders(completed);
            setCancelledOrders(cancelled);
            setAllOrders(orders); // Lưu tất cả đơn hàng vào allOrders

            // In dữ liệu theo từng trạng thái
            console.log("Active Orders:", active);
            console.log("Completed Orders:", completed);
            console.log("Cancelled Orders:", cancelled);

        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    // Gọi lại fetchOrders khi màn hình được focus
    useEffect(() => {
        if (isFocused) {
            fetchOrders();
        }
    }, [isFocused]);

    const handleTrackOrder = (order) => {
        navigation.navigate('TrackOrder', { order });
    };

    const handleLeaveReview = (order) => {
        navigation.navigate('LeaveReview', { order });
    };

    const handleReorder = (order) => {
        navigation.navigate('ProductDetail', { order });
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
            <View>
                {activeTab === 'all' && (
                    <OrderList
                        orderList={allOrders.flatMap(order =>
                            order.products.map((product, index) => ({
                                ...product,
                                buttonText: 'Track Order',
                                key: `${order.id}`, // Thêm thuộc tính key
                            }))
                        )}
                        onClickButton={handleTrackOrder}
                    />
                )}
                {activeTab === 'active' && (
                    <OrderList
                        orderList={activeOrders.flatMap(order =>
                            order.products.map((product, index) => ({
                                ...order, // Lấy toàn bộ thông tin order
                                ...product, // Lấy thông tin của từng sản phẩm trong order
                                buttonText: 'Track Order',
                                key: `${order.id}-${product.productId}`,
                            }))
                        )}
                        onClickButton={handleTrackOrder}
                    />
                )}
                {activeTab === 'completed' && (
                    <OrderList
                        orderList={completedOrders.flatMap(order =>
                            order.products.map((product, index) => ({
                                ...order, // Lấy toàn bộ thông tin order
                                ...product, // Lấy thông tin của từng sản phẩm trong order
                                buttonText: 'Leave Review',
                                key: `${order.id}-${product.productId}`,
                            }))
                        )}
                        onClickButton={handleLeaveReview}
                    />
                )}
                {activeTab === 'cancelled' && (
                    <OrderList
                        orderList={cancelledOrders.flatMap(order =>
                            order.products.map((product, index) => ({
                                ...product,
                                buttonText: 'Reorder',
                                key: `${order.id}-${product.productId}-${index}`, // Thêm thuộc tính key
                            }))
                        )}
                        onClickButton={handleReorder}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});



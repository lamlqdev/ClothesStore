import React, { useState, useEffect } from 'react';
import { View, StatusBar, Alert, Text, StyleSheet, TouchableOpacity, ActivityIndicator, NativeModules, NativeEventEmitter, FlatList, ScrollView } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { auth } from '../firebaseConfig';
import Header from '../components/Header';
import OrderCard from '../components/OrderCard';
import { Colors } from '../constants/colors';
import { spacing } from '../constants/dimensions';
import { Fonts } from '../constants/fonts';
import firestore from '@react-native-firebase/firestore';
import { handleZaloPayPayment } from '../services/ZaloPayService';



const MyOrderScreen = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [activeOrders, setActiveOrders] = useState([]);
    const [waitingOrders, setWaitingOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);
    const [cancelledOrders, setCancelledOrders] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [exchangeRate, setExchangeRate] = useState(0);
    const [expandedOrders, setExpandedOrders] = useState({});


    const getUserId = async () => {
        const user = auth.currentUser; // Get the current logged-in user
        if (user) {
            return user.uid; // Return the user's ID
        } else {
            console.error('No user is logged in');
            return null;
        }
    };
    useEffect(() => {

        const fetchExchangeRate = async () => {
            try {
                const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                const data = await response.json();
                setExchangeRate(data.rates.VND); // Lưu tỷ giá USD/VND vào state
                console.log('Exchange Rate USD to VND:', data.rates.VND);
            } catch (error) {
                console.error('Error fetching exchange rate:', error);
                Alert.alert('Error', 'Failed to fetch exchange rate');
            }
        };
        fetchExchangeRate();
    }, []);
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
                    userId: userId,
                    orderStatus: data.orderStatus,
                    paymentMethod: data.paymentMethod,
                    products: data.products || [],
                    orderTime: data.orderTime.toDate(), // Ensure orderTime is a Date object
                    total: data.total || 0
                };
            });

            orders.sort((a, b) => b.orderTime - a.orderTime);

            // Categorize orders by status
            const waiting = orders.filter(order => order.orderStatus === 'Waiting for payment');
            const active = orders.filter(order => order.orderStatus === 'Active');
            const completed = orders.filter(order => order.orderStatus === 'Completed');
            const cancelled = orders.filter(order => order.orderStatus === 'Canceled');

            setWaitingOrders(waiting);
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

    const groupOrdersByDateAndTransId = (orders) => {
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

    const getButtonText = (status) => {
        switch (status) {
            case 'Completed':
                return 'Re-order';
            case 'Waiting for payment':
                return 'Pay Now';
            case 'Canceled':
                return 'Re-order';
            case 'Active':
                return 'Track Order';
        }
    };
    
    const addToCart = async (productId, selectedSize, quantity) => {
        try {
            const userId = await getUserId();
            if (!userId || !selectedSize) {
                Alert.alert('Please select product size');
                return;
            }

            const productSnapshot = await firestore().collection('Products').doc(productId).get();
            if (!productSnapshot.exists) {
                console.warn(`Product with ID ${productId} not found`);
                return;
            }

            const productData = productSnapshot.data();
            const sizeList = productData.sizelist || [];

            const selectedSizeData = sizeList.find(item => item.size === selectedSize);
            if (!selectedSizeData) {
                console.warn(`Size ${selectedSize} not available for product ID ${productId}`);
                return;
            }

            const stock = selectedSizeData.quantity;
            if (stock <= 0) {
                console.warn(`Size ${selectedSize} is out of stock for product ID ${productId}`);
                return;
            }

            const cartRef = firestore().collection('Cart');
            const cartItem = {
                userId,
                productId,
                size: selectedSize,
                quantity: quantity,
                createdAt: firestore.FieldValue.serverTimestamp(),
            };

            const existingCartItemSnapshot = await cartRef
                .where('userId', '==', userId)
                .where('productId', '==', productId)
                .where('size', '==', selectedSize)
                .limit(1)
                .get();

            let cartId;
            if (!existingCartItemSnapshot.empty) {
                const existingCartItem = existingCartItemSnapshot.docs[0];
                cartId = existingCartItem.id;
                const newQuantity = existingCartItem.data().quantity + 1;

                if (newQuantity > stock) {
                    console.warn(`The number of products in the cart exceeds the inventory quantity for product ID ${productId}.`);
                    return;
                }

                await cartRef.doc(cartId).update({ quantity: newQuantity });
            } else {
                const newCartDoc = await cartRef.add(cartItem);
                cartId = newCartDoc.id;
            }

            await firestore().collection('users').doc(userId).update({
                cartlist: firestore.FieldValue.arrayUnion(cartId),
            });

            console.log(`Product ID ${productId} (Size: ${selectedSize}) added to cart.`);
        } catch (error) {
            console.error(`Error adding product ID ${productId} to cart: `, error);
        }
    };

    const handleAddToCartAndNavigate = async (order) => {
        for (const product of order.products.slice().reverse()) {
            await addToCart(product.productId, product.size, product.quantity);
        }
        navigation.navigate('Cart');
    };

    const handleLeaveReview = (order, product) => {
        const orderData = { ...order, orderTime: order.orderTime.toISOString() };
        console.log('Error', order)
        navigation.navigate('LeaveReview', { order: orderData, product });
    };

    const navigateBasedOnOrderStatus = (order) => {
        switch (order.orderStatus) {
            case 'Waiting for payment':
                if (order.paymentMethod === 'ZaloPay') {
                    handleZaloPayPayment(order, exchangeRate);
                    console.log('ZaloPay', order.products) // Gọi thanh toán Zalo Pay
                }
                else {
                    console.log('Error')
                }
                break;
            case 'Canceled':
                handleAddToCartAndNavigate(order);
                break;
            case 'Completed':
                handleAddToCartAndNavigate(order);
                break;
            case 'Active':
                navigation.navigate('TrackOrder', { order: { ...order, orderTime: order.orderTime.toISOString() } });
                console.log('Error')
                break;
        }
    };

    const getOrderData = () => {
        switch (activeTab) {
            case 'all':
                return {
                    orders: allOrders,
                    onClickButton: (order, product, actionType) => {
                        if (actionType === 'LeaveReview' && product) {
                            handleLeaveReview(order, product);
                        } else {
                            navigateBasedOnOrderStatus(order);
                        }
                    },
                };
            case 'active':
                return {
                    orders: activeOrders,
                    onClickButton: (order) => {
                        navigation.navigate('TrackOrder', { order: { ...order, orderTime: order.orderTime.toISOString() } });
                    },
                };
            case 'waiting for payment':
                return {
                    orders: waitingOrders,
                    onClickButton: (order) => {
                        if (order.paymentMethod === 'ZaloPay') {
                            handleZaloPayPayment(order, exchangeRate);
                            console.log('ZaloPay', order.products) // Gọi thanh toán Zalo Pay
                        }
                        else {
                            console.log('Error', order.paymentMethod)
                        }
                    },
                };
            case 'completed':
                return {
                    orders: completedOrders,
                    onClickButton: (order, product, actionType) => {
                        if (actionType === 'LeaveReview' && product) {
                            handleLeaveReview(order, product);
                        } else {
                            handleAddToCartAndNavigate(order, 'Cart');
                        }
                    },
                };
            case 'canceled':
                return {
                    orders: cancelledOrders,
                    onClickButton: (order) => {
                        handleAddToCartAndNavigate(order, 'Cart');
                    },
                };
            default:
                return { orders: [], onClickButton: () => { } };
        }
    };


    const { orders, onClickButton } = getOrderData();
    const groupedOrders = groupOrdersByDateAndTransId(orders);

    const renderOrderList = (orders, onClickButton) => {
        const toggleExpand = (orderId) => {
            setExpandedOrders((prev) => ({
                ...prev,
                [orderId]: !prev[orderId],
            }));
        };
    
        const orderList = orders.map(order => ({
            ...order,
            totalAmount: !isNaN(order.total) ? parseFloat(order.total) : 0,
            key: order.id,
        }));
    
        return (
            <View style={styles.orderListContainer}>
                {orderList.map(order => {
                    const isExpanded = expandedOrders[order.key];
                    const displayedProducts = isExpanded ? order.products : order.products.slice(0, 1);
    
                    return (
                        <View key={order.key} style={styles.orderItemContainer}>
                            <View style={styles.totalContainer}>
                                <Text style={styles.orderTotalText}>
                                    Total: ${order.totalAmount.toFixed(2)}
                                </Text>
                            </View>
    
                            <View style={styles.orderProductsContainer}>
                                {displayedProducts.map((product, index) => {
                                    if (order.orderStatus === 'Completed' && !product.hasReviewed) {
                                        return (
                                            <OrderCard
                                                key={index}
                                                productImage={product.productImage}
                                                productName={product.productName}
                                                size={product.size}
                                                quantity={product.quantity}
                                                price={product.price}
                                                buttonText="Leave Review"
                                                onClickButton={() => onClickButton(order, product, 'LeaveReview')}
                                            />
                                        );
                                    }
                                    return (
                                        <OrderCard
                                            key={index}
                                            productImage={product.productImage}
                                            productName={product.productName}
                                            size={product.size}
                                            quantity={product.quantity}
                                            price={product.price}
                                            buttonText={null}
                                            onClickButton={null}
                                        />
                                    );
                                })}
                            </View>
    
                            {order.products.length > 1 && (
                                <TouchableOpacity onPress={() => toggleExpand(order.key)} style={styles.showMoreButton}>
                                    <Text style={styles.showMoreText}>
                                        {isExpanded ? 'Show Less' : 'Show More'}
                                    </Text>
                                </TouchableOpacity>
                            )}
    
                            <View style={styles.orderActionContainer}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => onClickButton(order, null, getButtonText(order.orderStatus))}
                                >
                                    <Text style={styles.buttonText}>{getButtonText(order.orderStatus)}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <Header title="My Orders" onBackPress={() => navigation.navigate('Profile')} />
            <View style={styles.buttonContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollViewContent}
                >
                    <TabText title="All" isActive={activeTab === 'all'} />
                    <TabText title="Waiting for payment" isActive={activeTab === 'waiting for payment'} />
                    <TabText title="Active" isActive={activeTab === 'active'} />
                    <TabText title="Completed" isActive={activeTab === 'completed'} />
                    <TabText title="Canceled" isActive={activeTab === 'canceled'} />
                </ScrollView>
            </View>
            <FlatList
                data={Object.keys(groupedOrders)}
                renderItem={({ item: date }) => (
                    <View key={date} style={styles.groupedOrdersContainer}>
                        <Text style={styles.dateHeader}>{date}</Text>
                        {renderOrderList(groupedOrders[date], onClickButton)}
                    </View>
                )}
                keyExtractor={(item) => item}
                contentContainerStyle={styles.scrollViewContainer}
                ListEmptyComponent={
                    <View style={styles.loadingContainer}>
                        <Text style={styles.emptyText}>No orders available</Text>
                    </View>
                }
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
    scrollViewContent: {
        flexGrow: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        gap: 20,
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
    orderItemContainer: {
        padding: spacing.sm,
        backgroundColor: Colors.White,
        borderRadius: 8,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: Colors.LightGray,
        position: 'relative',
        marginBottom: 16,
    },
    orderProductsContainer: {
        marginTop: spacing.sm,
        marginBottom: spacing.md,
        marginVertical: 8,
    },
    totalContainer: {
        alignItems: 'flex-end',
        marginBottom: 8,
    },
    orderTotalText: {
        fontSize: 18,
        fontFamily: Fonts.interBold,
        color: Colors.Brown,
        textAlign: 'right',
        marginBottom: spacing.sm,
    },
    orderActionContainer: {
        marginTop: 16,
        alignItems: 'flex-end', // Nút nằm bên phải
    },
    button: {
        backgroundColor: Colors.Brown, // Màu nâu
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    orderListContainer: {
        marginBottom: spacing.sm,
    },
    showMoreButton: {
        paddingVertical: 4,
        alignItems: 'center',
    },
    showMoreText: {
        color: Colors.Brown,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
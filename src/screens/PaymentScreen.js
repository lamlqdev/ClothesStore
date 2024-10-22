import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/Ionicons';
import Icon3 from 'react-native-vector-icons/FontAwesome6';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';

const PaymentScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { selectedProducts, selectedAddress, selectedPhone, fromProfile } = route.params || {};
    const [selectedOption, setSelectedOption] = useState(null);
    const [userId, setUserId] = useState(null);

    const paymentOptions = [
        { id: 'paypal', name: 'Paypal', icon: <Icon name="paypal" size={24} color="#0070BA" /> },
        { id: 'momo', name: 'Momo', icon: <Icon name="credit-card" size={24} color="purple" /> },
        { id: 'zalopay', name: 'Zalo Pay', icon: <Icon3 name="google-pay" size={24} color="#4285F4" /> },
    ];

    useEffect(() => {
        const fetchUserId = async () => {
            const id = await AsyncStorage.getItem('userId');
            setUserId(id);
        };
        fetchUserId();
    }, []);

    const handleConfirmPayment = async () => {
        if (!selectedOption) {
            Alert.alert('Payment Option Required', 'Please select a payment option.');
            return;
        }

        try {
            let paymentResult = await callPaymentAPI(selectedOption);

            if (paymentResult.success) {
                const totalAmount = selectedProducts.reduce((sum, product) => sum + product.price * product.quantity, 0).toFixed(2);

                const orderData = {
                    address: selectedAddress,
                    phone: selectedPhone,
                    orderStatus: 'Active',
                    orderTime: firestore.FieldValue.serverTimestamp(),
                    total: totalAmount,
                    userId: userId,
                    products: selectedProducts.map(product => ({
                        productId: product.product.id,
                        name: product.product.name,
                        quantity: product.quantity,
                        price: product.price,
                    })),
                };

                await firestore().collection('Orders').add(orderData);

                Alert.alert('Your order has been placed successfully.');
                navigation.navigate('PaymentSuccess');
            } else {
                Alert.alert('Payment Failed', 'Please try again.');
            }

        } catch (error) {
            console.error('Error placing order:', error);
            Alert.alert('Payment Failed', 'Failed to place your order. Please try again.');
        }
    };

    const handleOptionPress = (optionId) => {
        setSelectedOption(optionId);
    };

    const callPaymentAPI = async (paymentOption) => {
        // Logic API thanh toán với Momo, ZaloPay, PayPal, ...
        // Ví dụ đơn giản:
        return { success: true };
    };

    return (
        <View style={styles.container}>
            <Header title="Payment Methods" onBackPress={() => navigation.goBack()} />

            <Text style={styles.paymentOptionsTitle}>Payment Options</Text>
            <FlatList
                data={paymentOptions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.paymentOption}
                        onPress={() => handleOptionPress(item.id)}
                    >
                        <View style={styles.paymentOptionDetails}>
                            {item.icon}
                            <Text style={styles.paymentOptionText}>{item.name}</Text>
                        </View>
                        {fromProfile ? (
                            <Text style={styles.linkText}>Link</Text>
                        ) : (
                            <Icon2
                                name={selectedOption === item.id ? 'radio-button-on' : 'radio-button-off'}
                                size={24}
                                color={selectedOption === item.id ? '#8B4513' : '#ccc'}
                            />
                        )}
                    </TouchableOpacity>
                )}
            />

            {!fromProfile && (
                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleConfirmPayment}
                >
                    <Text style={styles.confirmButtonText}>Confirm Payment</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    paymentOptionsTitle: {
        fontSize: 16,
        color: "black",
        fontWeight: 'bold',
        marginHorizontal: 20,
        marginTop: 30,
    },
    cardSection: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    cardButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F5F5F5',
        padding: 15,
        borderRadius: 8,
    },
    cardText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        marginHorizontal: 20,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    paymentOptionDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentOptionText: {
        marginLeft: 10,
        fontSize: 16,
        color: "black",
    },
    linkText: {
        color: '#0070BA',
        fontSize: 16,
    },
    confirmButton: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        margin: 16,
        padding: 16,
        backgroundColor: 'brown',
        borderRadius: 15,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default PaymentScreen;

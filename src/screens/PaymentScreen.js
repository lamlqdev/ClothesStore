import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/Ionicons';
import Icon3 from 'react-native-vector-icons/FontAwesome6';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import firestore from '@react-native-firebase/firestore';
import WebView from 'react-native-webview';
import { createPayment, executePayment } from '../apis/paypalApi';

const PaymentScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { selectedProducts, selectedAddress, selectedPhone } = route.params || {};
    const [selectedOption, setSelectedOption] = useState(null);
    const [userId, setUserId] = useState(null);
    const [approvalUrl, setApprovalUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentId, setPaymentId] = useState(null);

    const paymentOptions = [
        { id: 'paypal', name: 'Paypal', icon: <Icon name="paypal" size={24} color="#0070BA" /> },
        { id: 'momo', name: 'MoMo', icon: <Icon name="credit-card" size={24} color="purple" /> },
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
        setLoading(true);
        try {
            if (selectedOption === 'paypal') {
                await handlePaypalPayment();
            } else {
                Alert.alert('Unsupported Payment Option', 'Currently only PayPal is supported in WebView.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePaypalPayment = async () => {
        if (isProcessing) return;
    
        setIsProcessing(true);
        try {
            const amount = selectedProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0).toFixed(2);
            const result = await createPayment(amount);
            
            const approvalLink = result.links.find(link => link.rel === 'approve');
            if (!approvalLink) throw new Error('No approval URL found in order response');
            
            setApprovalUrl(approvalLink.href);
            setPaymentId(result.id);
        } catch (error) {
            Alert.alert('Payment Error', 'Failed to initialize payment. Please try again or contact support.');
        } finally {
            setIsProcessing(false);
        }
    };                

    const handleWebViewNavigationStateChange = async (event) => {
        if (event.url.includes('payment-success')) {
            try {
                const captureResult = await captureOrder(paymentId);
                
                if (captureResult.status === 'COMPLETED') {
                    await saveOrderToFirestore(captureResult);
                    setApprovalUrl(null);
                    navigation.navigate('PaymentSuccess');
                } else {
                    throw new Error('Order capture not completed');
                }
            } catch (error) {
                console.error('Payment Capture Error:', error);
                Alert.alert('Payment Failed', error.message || 'Unable to complete payment');
                setApprovalUrl(null);
                navigation.navigate('Payment');
            }
        } else if (event.url.includes('payment-cancel')) {
            console.log('Payment Cancelled');
            setApprovalUrl(null);
            setIsProcessing(false);
            navigation.navigate('Payment');
        }
    };                                     

    const saveOrderToFirestore = async (paymentResult) => {
        try {
            console.log('Saving order to Firestore:', paymentResult);
            
            const totalAmount = selectedProducts.reduce(
                (sum, product) => sum + (product.price * product.quantity),
                0
            ).toFixed(2);

            const orderDetails = {
                paymentId: paymentResult.id,
                paymentStatus: paymentResult.state,
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

            const docRef = await firestore().collection('Orders').add(orderDetails);
            console.log('Order saved successfully with ID:', docRef.id);
        } catch (error) {
            console.error('Error saving order to Firestore:', error);
            Alert.alert('Error', 'Failed to save order details. Please contact support.');
        }
    };                

    return (
        <View style={styles.container}>
            <Header title="Payment Methods" onBackPress={() => navigation.goBack()} />

            {isProcessing && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0070BA" />
                    <Text style={styles.loadingText}>Processing payment...</Text>
                </View>
            )}

            {approvalUrl ? (
                <WebView
                    source={{ uri: approvalUrl }}
                    onNavigationStateChange={handleWebViewNavigationStateChange}
                    startInLoadingState
                    renderLoading={() => <ActivityIndicator size="large" color="#0070BA" />}
                />
            ) : (
                <>
                    <Text style={styles.paymentOptionsTitle}>Payment Options</Text>
                    <FlatList
                        data={paymentOptions}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.paymentOption}
                                onPress={() => setSelectedOption(item.id)}
                            >
                                <View style={styles.paymentOptionDetails}>
                                    {item.icon}
                                    <Text style={styles.paymentOptionText}>{item.name}</Text>
                                </View>

                                <Icon2
                                    name={selectedOption === item.id ? 'radio-button-on' : 'radio-button-off'}
                                    size={24}
                                    color={selectedOption === item.id ? '#8B4513' : '#ccc'}
                                />
                            </TouchableOpacity>
                        )}
                    />

                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={handleConfirmPayment}
                    >
                        <Text style={styles.confirmButtonText}>Confirm Payment</Text>
                    </TouchableOpacity>
                </>
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
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999
    },
    loadingText: {
        marginTop: 10,
        color: '#0070BA',
        fontSize: 16
    }
});

export default PaymentScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/Ionicons';
import Icon3 from 'react-native-vector-icons/FontAwesome6';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { NativeModules, NativeEventEmitter } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import CryptoJS from 'crypto-js';

const { PayZaloBridge } = NativeModules;
const payZaloBridgeEmitter = new NativeEventEmitter(PayZaloBridge);

const PaymentScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { selectedProducts, selectedAddress, selectedPhone, fromProfile } = route.params || {};
    const [selectedOption, setSelectedOption] = useState(null);
    const [userId, setUserId] = useState(null);
    const [zpTransToken, setZpTransToken] = useState(null);
    const [exchangeRate, setExchangeRate] = useState(0);

    const paymentOptions = [
        { id: 'paypal', name: 'Paypal', icon: <Icon name="paypal" size={24} color="#0070BA" /> },
        { id: 'momo', name: 'Momo', icon: <Icon name="credit-card" size={24} color="purple" /> },
        { id: 'zalopay', name: 'Zalo Pay', icon: <Icon3 name="google-pay" size={24} color="#4285F4" /> },
    ];

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

        const fetchUserId = async () => {
            try {
                const id = await AsyncStorage.getItem('userId');
                setUserId(id);
                console.log('Fetched User ID:', id);
            } catch (error) {
                console.error('Error fetching user ID:', error);
                Alert.alert('Error', 'Failed to fetch user ID');
            }
        };
        fetchUserId();

        const subscription = payZaloBridgeEmitter.addListener(
            'EventPayZalo',
            (data) => {
                console.log('EventPayZalo data:', data);
                if (data.returnCode === 1) {
                    Alert.alert('Payment Successful');
                } else {
                    Alert.alert('Payment Failed', `Error Code: ${data.returnCode}`);
                    console.error('Payment Error:', data);
                }
            }
        );

        return () => subscription.remove();
    }, []);

    const handleConfirmPayment = async () => {
        if (!selectedOption) {
            Alert.alert('Payment Option Required', 'Please select a payment option.');
            return;
        }
    
        // Generate appTransId once
        const appTransId = generateAppTransId();
    
        if (selectedOption === 'zalopay') {
            const paymentResult = await callPaymentAPI(appTransId); // Pass appTransId to callPaymentAPI
            if (!paymentResult.success) {
                Alert.alert('Payment Failed', 'Failed to initiate payment. Please try again.');
            }
        } else {
            Alert.alert('Payment Option', 'This option is not implemented yet.');
        }
    };
    
    const handleOrderSuccess = async (appTransId) => { // Receive appTransId as a parameter
        console.log('Handling order success...');
        try {
            const totalAmount = Math.round(selectedProducts.reduce((sum, product) => sum + product.price * product.quantity, 0));
    
            const orderData = {
                address: selectedAddress,
                phone: selectedPhone,
                orderStatus: 'Waiting for payment',
                orderTime: firestore.FieldValue.serverTimestamp(),
                total: totalAmount,
                userId: userId,
                appTransId: appTransId, // Use the same appTransId
                products: selectedProducts.map(product => ({
                    productId: product.product.productId,
                    productName: product.product.name,
                    quantity: product.quantity,
                    price: product.price,
                    size: product.size,
                    productImage: product.product.image
                })),
            };
            console.log('Saving order to Firestore:', orderData);
    
            // Add order to Firestore
            await firestore().collection('Orders').doc(appTransId).set(orderData);
            console.log('Order created successfully:', orderData);
    
            // Delete each product from 'Cart' and update 'cartlist' in 'users'
            const deleteCartPromises = selectedProducts.map(async (product) => {
                await firestore().collection('Cart').doc(product.cartId).delete();
                console.log(`Product with cartId ${product.cartId} deleted from Cart collection.`);
    
                await firestore().collection('users').doc(userId).update({
                    cartlist: firestore.FieldValue.arrayRemove(product.cartId),
                });
                console.log(`cartId ${product.cartId} removed from user ${userId}'s cartlist.`);
            });
    
            await Promise.all(deleteCartPromises);
            console.log('All cart items deleted and user cartlist updated successfully.');
    
            return true;
        } catch (error) {
            console.error('Error processing order:', error);
            Alert.alert('Error', 'Failed to process order');
            return false;
        }
    };
    
    const callPaymentAPI = async (appTransId) => { // Receive appTransId as a parameter
        console.log('Calling ZaloPay payment API and handling order...');
    
        // Call handleOrderSuccess and pass appTransId
        const orderSuccess = await handleOrderSuccess(appTransId);
        if (!orderSuccess) {
            console.log('Order handling failed, payment initiation stopped.');
            return { success: false };
        }
    
        try {
            const orderData = await createZaloPayOrder(appTransId); // Pass appTransId to createZaloPayOrder
            if (orderData.success) {
                setZpTransToken(orderData.zp_trans_token);
                console.log('Initiating ZaloPay payment with token:', orderData.zp_trans_token);
    
                PayZaloBridge.payOrder(orderData.zp_trans_token);
    
                navigation.navigate('PaymentSuccess');
                return { success: true };
            }
            return { success: false };
        } catch (error) {
            console.error('Error in callPaymentAPI:', error);
            Alert.alert('Error', 'Failed to initiate payment');
            return { success: false };
        }
    };
    
    const createZaloPayOrder = async (appTransId) => { // Receive appTransId as a parameter
        try {
            const appid = 2554;
            const appuser = "ZaloPayDemo";
            const callback_url = "https://us-central1-fashionstore-3d195.cloudfunctions.net/handleZaloPayCallback";
            // Tính tổng tiền theo USD và chuyển sang VND
            const usdAmount = selectedProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);
            const amount = Math.round(usdAmount * exchangeRate); // Chuyển USD sang VND
            const apptime = Math.floor(new Date().getTime());
            const embeddata = "{}";
            const item = JSON.stringify(selectedProducts.map(product => ({
                itemid: product.product.productId,
                itename: product.product.name,
                itemprice: product.price,
                itemquantity: product.quantity,
            })));
            const description = `Order #${appTransId}`;
    
            console.log('App ID:', appid);
            console.log('App Trans ID:', appTransId); // Use the same appTransId
            console.log('App User:', appuser);
            console.log('Amount:', amount);
            console.log('App Time:', apptime);
            console.log('Embed Data:', embeddata);
            console.log('Item JSON:', item);
            console.log('Description:', description);
    
            const secretKey = "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn";
            const hmacInput = `${appid}|${appTransId}|${appuser}|${amount}|${apptime}|${embeddata}|${item}`;
            const mac = CryptoJS.HmacSHA256(hmacInput, secretKey).toString();
            console.log('HMAC input:', hmacInput);
            console.log('Generated MAC:', mac);
    
            const order = {
                app_id: appid,
                app_user: appuser,
                app_time: apptime,
                amount: amount,
                app_trans_id: appTransId, // Use the same appTransId
                embed_data: embeddata,
                item: item,
                callback_url: callback_url,
                description: description,
                mac: mac,
            };
    
            const formBody = Object.keys(order)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(order[key])}`)
                .join("&");
    
            const response = await fetch('https://sb-openapi.zalopay.vn/v2/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                body: formBody,
            });
    
            const resJson = await response.json();
            console.log('ZaloPay API response:', resJson);
    
            if (resJson.return_code === 1) {
                return { success: true, zp_trans_token: resJson.zp_trans_token };
            } else {
                console.error('Failed to create ZaloPay order:', resJson);
                Alert.alert('ZaloPay Error', resJson.return_message || 'Failed to create ZaloPay order');
                return { success: false };
            }
        } catch (error) {
            console.error('Error creating ZaloPay order:', error);
            Alert.alert('Error', 'Failed to create order. Please try again.');
            return { success: false };
        }
    };
    

    const generateAppTransId = () => {
        const date = new Date();
        const yy = String(date.getFullYear()).slice(-2);
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        return `${yy}${mm}${dd}_${randomNum}`;
    };

    const handleOptionPress = (optionId) => {
        setSelectedOption(optionId);
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

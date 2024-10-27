import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, NativeEventEmitter } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/Ionicons';
import Icon3 from 'react-native-vector-icons/FontAwesome6';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import firestore from '@react-native-firebase/firestore';
import CryptoJS from 'crypto-js';

const PaymentScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { selectedProducts, selectedAddress, selectedPhone } = route.params || {};
    const [selectedOption, setSelectedOption] = useState(null);
    const [userId, setUserId] = useState(null);

    const paymentOptions = [
        { id: 'vnpay', name: 'VNPay', icon: <Icon name="paypal" size={24} color="#0070BA" /> },
        { id: 'momo', name: 'MoMo', icon: <Icon name="credit-card" size={24} color="purple" /> },
        { id: 'zalopay', name: 'Zalo Pay', icon: <Icon3 name="google-pay" size={24} color="#4285F4" /> },
    ];

    useEffect(() => {
        const fetchUserId = async () => {
            const id = await AsyncStorage.getItem('userId');
            setUserId(id);
        };
        fetchUserId();

        // Lắng nghe sự kiện từ VNPAY (nếu cần)
        //const eventEmitter = new NativeEventEmitter(VnpayMerchantModule);
        //const listener = eventEmitter.addListener('PaymentBack', handlePaymentResult);
        return () => listener.remove();
    }, []);

    const handleConfirmPayment = async () => {
        if (!selectedOption) {
            Alert.alert('Payment Option Required', 'Please select a payment option.');
            return;
        }

        if (selectedOption === 'vnpay') {
            await handleVnpayPayment();
        } else if (selectedOption === 'momo') {
            await handleMomoPayment();
        } else {
            Alert.alert('Unsupported Payment Option', 'Currently only VNPay and MoMo are supported.');
        }
    };

    const handleVnpayPayment = async () => {
        const paymentUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
        const scheme = 'clothesstorepay';

        try {
            await VnpayMerchant.show({
                isSandbox: true,
                paymentUrl,
                scheme,
                title: "VNPAY Payment",
                tmn_code: "vnpay_tmn_code",  // Mã TMN
            });
        } catch (error) {
            console.error('Payment error:', error);
            Alert.alert('Thanh toán không thành công');
        }
    };

    const createSignature = (data, secretKey) => {
        const hmacData = Object.entries(data)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');

        return CryptoJS.HmacSHA256(hmacData, secretKey).toString();
    };

    const handleMomoPayment = async () => {
        const partnerCode = "YOUR_PARTNER_CODE";  // Nhập Partner Code
        const accessKey = "YOUR_ACCESS_KEY";      // Nhập Access Key
        const secretKey = "YOUR_SECRET_KEY";      // Nhập Secret Key
        const orderId = new Date().getTime().toString();
        const amount = selectedProducts.reduce((sum, product) => sum + product.price * product.quantity, 0).toFixed(2);
        const orderInfo = "Thanh toán bằng MoMo";
        const returnUrl = "https://your-return-url.com"; // Đường dẫn trả về
        const notifyUrl = "https://your-notify-url.com"; // Đường dẫn thông báo

        const data = {
            partnerCode,
            accessKey,
            requestId: orderId,
            amount,
            orderId,
            orderInfo,
            returnUrl,
            notifyUrl,
            extraData: "", // Thông tin bổ sung nếu cần
        };

        const signature = createSignature(data, secretKey);
        data.signature = signature;

        try {
            const response = await fetch('https://test-payment.momo.vn/gw_payment/transactionProcessor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (result && result.payUrl) {
                // Mở URL thanh toán MoMo
                Linking.openURL(result.payUrl);
            }
        } catch (error) {
            console.error('MoMo Payment error:', error);
            Alert.alert('Thanh toán MoMo không thành công');
        }
    };

    const handlePaymentResult = async (e) => {
        if (e.resultCode === 97) {  // 97: Thanh toán thành công
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
            navigation.navigate('PaymentSuccess');
        } else if (e.resultCode === 98) {  // 98: Thanh toán thất bại
            Alert.alert('Thanh toán thất bại');
        }
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

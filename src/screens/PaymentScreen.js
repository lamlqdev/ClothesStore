import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator, NativeModules, NativeEventEmitter } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/Ionicons';
import Icon3 from 'react-native-vector-icons/FontAwesome6';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auth } from '../firebaseConfig';
import Header from '../components/Header';
import firestore from '@react-native-firebase/firestore';
import WebView from 'react-native-webview';
import { createOrder, captureOrder, getOrderDetails } from '../apis/paypalApi';
import CryptoJS from 'crypto-js';
import { getQueryParams } from '../../App';

const { PayZaloBridge } = NativeModules;

const PaymentScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { selectedProducts, selectedAddress, selectedPhone, totalAmount, discountValue } = route.params || {};
    const [selectedOption, setSelectedOption] = useState(null);
    const [userId, setUserId] = useState(null);
    const [approvalUrl, setApprovalUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentId, setPaymentId] = useState(null);
    const [zpTransToken, setZpTransToken] = useState(null);
    const [exchangeRate, setExchangeRate] = useState(0);

    const paymentOptions = [
        { id: 'paypal', name: 'Paypal', icon: <Icon name="paypal" size={24} color="#0070BA" /> },
        { id: 'momo', name: 'MoMo', icon: <Icon name="credit-card" size={24} color="purple" /> },
        { id: 'zalopay', name: 'Zalo Pay', icon: <Icon3 name="google-pay" size={24} color="#4285F4" /> },
        { id: 'cod', name: 'COD', icon: <Icon name="american-sign-language-interpreting" size={24} color="#4285F4" /> },
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
            const user = auth.currentUser;
            setUserId(user.uid);
        };
        fetchUserId();

    }, []);

    const handleConfirmPayment = async () => {
        if (!selectedOption) {
            Alert.alert('Payment Option Required', 'Please select a payment option.');
            return;
        }
        setLoading(true);
        const appTransId = generateAppTransId();
        try {
            if (selectedOption === 'paypal') {
                await handlePaypalPayment(appTransId);
            } else if (selectedOption === 'momo') {
                Alert.alert('Unsupported Momo Option', 'Currently Momo is not supported.');
            } else if (selectedOption === 'cod') {
                const orderSuccess = await handleOrderSuccess(appTransId);
                if (orderSuccess) {
                    navigation.navigate('PaymentSuccess');
                } else {
                    Alert.alert('Error', 'Failed to create order.');
                }
            } else if (selectedOption === 'zalopay') {
                const paymentResult = await callPaymentAPI(appTransId);
                if (!paymentResult.success) {
                    Alert.alert('Payment Failed', 'Failed to initiate payment. Please try again.');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOrderSuccess = async (appTransId, orderId = null) => {
        console.log('Handling order success...');
        try {
            const amount = totalAmount;
            const orderStatus = selectedOption === 'paypal' ? 'Active' : 'Waiting for payment';

            let paymentMethod;
            switch (selectedOption) {
                case 'paypal':
                    paymentMethod = 'PayPal';
                    break;
                case 'zalopay':
                    paymentMethod = 'ZaloPay';
                    break;
                case 'cod':
                    paymentMethod = 'COD';
                    break;
                default:
                    paymentMethod = 'Unknown';
            }

            const orderData = {
                address: selectedAddress,
                phone: selectedPhone,
                orderStatus: orderStatus,
                orderTime: firestore.FieldValue.serverTimestamp(),
                total: Number(amount),
                userId: userId,
                appTransId: appTransId,
                paypalOrderId: selectedOption === 'paypal' ? orderId : null, // Chỉ lưu orderId nếu là PayPal
                paymentMethod: paymentMethod,
                products: selectedProducts.map(product => ({
                    productId: product.productId,
                    hasReviewed: false,
                    productName: product.product.name,
                    quantity: product.quantity,
                    price: product.price,
                    size: product.size,
                    productImage: product.product.image
                })),
            };

            console.log('Saving order to Firestore:', orderData);

            // Thêm đơn hàng vào Firestore với appTransId làm ID
            await firestore().collection('Orders').doc(appTransId).set(orderData);
            console.log('Order created successfully with appTransId:', appTransId);

            // Giảm số lượng size sản phẩm đã mua
            const updateSizesPromises = selectedProducts.map(async (product) => {
                await updateProductSizeQuantity(
                    product.productId, // ID của sản phẩm
                    product.size,              // Size được mua
                    product.quantity           // Số lượng mua
                );
            });

            await Promise.all(updateSizesPromises);
            console.log('Product sizes updated successfully.');

            // Delete each product from 'Cart' and update 'cartlist' in 'users'
            const deleteCartPromises = selectedProducts.map(async (product) => {
                await firestore().collection('Cart').doc(product.cartId).delete();
                await firestore().collection('users').doc(userId).update({
                    cartlist: firestore.FieldValue.arrayRemove(product.cartId),
                });
            });

            return true;
        } catch (error) {
            console.error('Error saving order:', error);
            return false;
        }
    };

    // Hàm giảm số lượng size sản phẩm
    const updateProductSizeQuantity = async (productId, size, quantityPurchased) => {
        try {
            const productRef = firestore().collection('Products').doc(productId);
            const productDoc = await productRef.get();

            if (!productDoc.exists) {
                console.error(`Product with ID ${productId} does not exist.`);
                return;
            }

            const productData = productDoc.data();
            const updatedSizelist = productData.sizelist.map((item) => {
                if (item.size === size) {
                    // Giảm số lượng của size đã mua
                    return { ...item, quantity: Math.max(0, item.quantity - quantityPurchased) };
                }
                return item;
            });

            // Cập nhật dữ liệu mới vào Firestore
            await productRef.update({ sizelist: updatedSizelist });
            console.log(`Updated size quantity for product ${productId}:`, updatedSizelist);
        } catch (error) {
            console.error(`Error updating size quantity for product ${productId}:`, error);
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
                console.log('Initiating ZaloPay payment with token:', zpTransToken);

                PayZaloBridge.payOrder(zpTransToken);

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
            const usdAmount = totalAmount;
            const amount = Math.round(usdAmount * exchangeRate); // Chuyển USD sang VND
            const apptime = Math.floor(new Date().getTime());
            const embeddata = "{}";
            const item = JSON.stringify(selectedProducts.map(product => ({
                itemid: product.productId,
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

    const handlePaypalPayment = async (appTransId) => {
        if (isProcessing) return;

        setIsProcessing(true);
        try {
            const amount = totalAmount;

            // Gọi createOrder để tạo giao dịch trên PayPal
            const orderData = await createOrder(amount, selectedProducts, discountValue);
            console.log('PayPal order created:', orderData);

            const orderId = orderData.id; // Lưu ID đơn hàng từ PayPal

            const approvalLink = orderData.links?.find(link => link.rel === 'approve')?.href;
            if (!approvalLink) {
                throw new Error('No approval URL found in PayPal response');
            }

            setApprovalUrl(approvalLink);
            setPaymentId(orderId);

            // Lưu đơn hàng vào Firestore ngay sau khi tạo trên PayPal
            const orderSuccess = await handleOrderSuccess(appTransId, orderId);
            if (!orderSuccess) {
                throw new Error('Failed to save order');
            }
        } catch (error) {
            console.error('PayPal payment initialization error:', error);
            Alert.alert(
                'Payment Error',
                'Failed to initialize payment. Please try again or contact support.'
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePaymentSuccess = async (captureResult, paypalOrderId) => {
        try {
            console.log('Processing successful payment...', captureResult);
    
            // Cập nhật trạng thái đơn hàng trong Firestore
            await firestore()
                .collection('Orders')
                .doc(paypalOrderId) // Dùng paypalOrderId để tìm và cập nhật đơn hàng
                .update({ 
                    orderStatus: 'Active',
                    updatedTime: firestore.FieldValue.serverTimestamp(),
                });
    
            console.log(`Order ${paypalOrderId} updated to Active`);
    
            // Chuyển đến màn hình PaymentSuccess
            navigation.reset({
                index: 0,
                routes: [{ name: 'PaymentSuccess' }],
            });
        } catch (error) {
            console.error('Payment Success Handler Error:', error);
            Alert.alert('Error', 'Payment completed but failed to process order. Please contact support.');
        }
    };       
    
    const handleWebViewNavigationStateChange = async (event) => {
        console.log('WebView Navigation:', event.url);

        if (event.url.startsWith('clothesstore://payment-success')) {

            try {
                const queryParams = getQueryParams(event.url);
                const token = queryParams.token;
                const payerId = queryParams.PayerID;

                console.log('WebView Deep Link Params:', { token, payerId });

                const orderDetails = await getOrderDetails(token);

                console.log('Order Details Status:', orderDetails.status);

                if (orderDetails.status === 'APPROVED') {
                    const captureResult = await captureOrder(token);

                    console.log('Capture Result Full:', JSON.stringify(captureResult, null, 2));

                    if (captureResult.status === 'COMPLETED') {
                        const paypalOrderId = token; // Sử dụng token làm paypalOrderId
                        await handlePaymentSuccess(captureResult, paypalOrderId);
                    } else {
                        throw new Error(`Capture failed: ${captureResult.status}`);
                    }
                } else {
                    throw new Error('Payment not approved');
                }
            } catch (error) {
                console.error('Comprehensive Payment Error:', error);
                Alert.alert('Payment Error', 'Detailed error: ' + error.message);
                navigation.goBack();
            }
        } else if (event.url.startsWith('clothesstore://payment-cancel')) {
            console.log('Payment cancelled by user');
            navigation.goBack();
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
                    ref={(ref) => { this.webviewRef = ref; }}
                    source={{ uri: approvalUrl }}
                    onNavigationStateChange={handleWebViewNavigationStateChange}
                    onError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.warn('WebView error: ', nativeEvent);
                    }}
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

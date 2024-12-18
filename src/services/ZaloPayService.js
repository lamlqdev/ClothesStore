import { NativeModules } from 'react-native';
import CryptoJS from 'crypto-js';
import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';

const { PayZaloBridge } = NativeModules;

export const handleZaloPayPayment = async (order, exchangeRate) => {
    try {
        // Kiểm tra phương thức thanh toán
        if (order.paymentMethod !== 'ZaloPay') {
            console.warn('Payment method is not ZaloPay.');
            return;
        }

        // 1. Tạo appTransId
        const generateAppTransId = () => {
            const date = new Date();
            const yy = String(date.getFullYear()).slice(-2);
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const randomNum = Math.floor(100000 + Math.random() * 900000);
            return `${yy}${mm}${dd}_${randomNum}`;
        };

        const appTransId = generateAppTransId();

        // 2. Cập nhật appTransId cho đơn hàng trên Firestore
        await firestore().collection('Orders').doc(order.id).update({
            appTransId: appTransId,
        });

        // 3. Gọi API tạo thanh toán Zalo Pay
        const orderData = await createZaloPayOrder(appTransId, order, exchangeRate);
        if (orderData.success) {
            console.log('ZaloPay payment initiated:', orderData.zp_trans_token);

            // Gọi SDK ZaloPay để thực hiện thanh toán
            PayZaloBridge.payOrder(orderData.zp_trans_token);
        } else {
            console.error('Failed to create ZaloPay order.');
            Alert.alert('Error', 'Failed to initiate payment.');
        }
    } catch (error) {
        console.error('Error during ZaloPay payment:', error);
        Alert.alert('Error', 'Failed to process payment.');
    }
};

const createZaloPayOrder = async (appTransId, order, exchangeRate) => {
    try {
        const appid = 2554; // ID của ứng dụng trên ZaloPay
        const appuser = "ZaloPayDemo"; // Người dùng
        const apptime = Date.now(); // Thời gian tạo đơn hàng
        const callback_url = "https://us-central1-fashionstore-3d195.cloudfunctions.net/handleZaloPayCallback";
        const usdAmount = order.total;
        const amount = Math.round(usdAmount * exchangeRate); // Lấy tổng tiền từ order.total
        const embeddata = "{}"; // Dữ liệu đính kèm (nếu cần)
        // Chuyển danh sách sản phẩm thành JSON string
        const item = JSON.stringify(
            Array.isArray(order.products)
                ? order.products.map(product => ({
                    itemid: product.productId,
                    itemname: product.productName,
                    itemprice: product.price,
                    itemquantity: product.quantity,
                }))
                : [] // Fallback thành mảng rỗng nếu products undefined
        );

        console.log('App ID:', appid);
        console.log('App Trans ID:', appTransId); // Use the same appTransId
        console.log('App User:', appuser);
        console.log('Amount:', amount);
        console.log('App Time:', apptime);
        console.log('Embed Data:', embeddata);
        console.log('Item JSON:', item);
        console.log('Description:', description);

        const description = `Payment for Order #${appTransId}`;

        // Tạo HMAC để xác thực dữ liệu
        const secretKey = "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn"; // Khóa bí mật ZaloPay
        const hmacInput = `${appid}|${appTransId}|${appuser}|${amount}|${apptime}|${embeddata}|${item}`;
        const mac = CryptoJS.HmacSHA256(hmacInput, secretKey).toString();
        console.log('HMAC input:', hmacInput);
        console.log('Generated MAC:', mac);

        // Dữ liệu gửi đến ZaloPay
        const orderData = {
            app_id: appid,
            app_user: appuser,
            app_time: apptime,
            amount: amount,
            app_trans_id: appTransId,
            embed_data: embeddata,
            item: item,
            callback_url: callback_url,
            description: description,
            mac: mac,
        };

        // Gửi yêu cầu đến ZaloPay API
        const response = await fetch('https://sb-openapi.zalopay.vn/v2/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            body: Object.keys(orderData)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(orderData[key])}`)
                .join("&"),
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

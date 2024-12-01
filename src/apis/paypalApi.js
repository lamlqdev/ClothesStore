import config from '../../config';
import { encode } from 'base-64';
import { Alert } from 'react-native';

const BASE_URL = `https://api-m.sandbox.paypal.com`;

export const getAccessToken = async () => {
    console.log('Getting PayPal access token');
    const credentials = encode(`${config.PAYPAL_CLIENT_ID}:${config.PAYPAL_CLIENT_SECRET}`);
    
    try {
        const response = await fetch(`${BASE_URL}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('PayPal Auth Error:', errorData);
            throw new Error('Failed to get access token');
        }

        const data = await response.json();
        console.log('Access token obtained successfully');
        return data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
    }
};

export const createOrder = async (amount, selectedProducts) => {
    console.log('Creating PayPal order with amount:', amount);
    const accessToken = await getAccessToken();
    console.log('Access token obtained');

    const items = selectedProducts.map(item => {
        const productName = item.product?.name;
        const productDescription = item.product?.description || 'No description provided';

        if (!productName || productName.trim() === '') {
            console.error('Missing product name for product:', item);
            throw new Error('Product name is required');
        }

        return {
            name: productName, // Tên sản phẩm
            description: productDescription.slice(0, 127), // Rút gọn chuỗi description
            quantity: item.quantity.toString(), // Số lượng
            unit_amount: {
                currency_code: 'USD',
                value: item.price.toFixed(2), // Giá
            },
        };
    });

    const totalAmount = selectedProducts.reduce((sum, p) => sum + p.quantity * p.price, 0).toFixed(2);

    const orderPayload = {
        intent: 'CAPTURE',
        purchase_units: [
            {
                items: items,
                amount: {
                    currency_code: 'USD',
                    value: totalAmount, // Tổng số tiền của đơn hàng
                    breakdown: {
                        item_total: {
                            currency_code: 'USD',
                            value: totalAmount, // Tổng giá trị các sản phẩm
                        },
                    },
                },
            },
        ],
        application_context: {
            return_url: "clothesstore://payment-success",
            cancel_url: "clothesstore://payment-cancel",
            brand_name: "ClothesStore",
            user_action: "PAY_NOW"
        }
    };

    console.log('Sending order request to PayPal with payload:', JSON.stringify(orderPayload));

    try {
        const response = await fetch(`${BASE_URL}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(orderPayload)
        });

        const orderData = await response.json();

        if (!response.ok) {
            console.error("PayPal API Error Response:", orderData);
            throw new Error(orderData.message || 'Failed to create order');
        }

        console.log('PayPal order created successfully:', orderData);
        return orderData;
    } catch (error) {
        console.error('Error in createOrder:', error);
        throw error;
    }
};

export const getOrderDetails = async (orderId) => {
    const accessToken = await getAccessToken();

    const response = await axios.get(
        `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        }
    );

    return response.data;
};

export const captureOrder = async (orderId) => {
    console.log('Capturing PayPal order:', orderId);
    const accessToken = await getAccessToken();

    try {
        const response = await fetch(`${BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const captureData = await response.json();
        console.log('Capture response:', captureData);

        if (!response.ok) {
            const errorMessage = captureData.details?.[0]?.issue || 'Unknown error';
            console.error("Capture failed:", errorMessage);
            throw new Error(errorMessage);
        }

        console.log('Capture successful:', captureData);
        return captureData;
    } catch (error) {
        console.error('Error in captureOrder:', error);
        throw error;
    }
};

export const executePayment = async (paymentId, payerId) => {
    try {
        const accessToken = await getAccessToken();
        const response = await fetch(`${BASE_URL}/v1/payments/payment/${paymentId}/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ payer_id: payerId }),
        });
        console.log('Executing payment with paymentId:', paymentId, 'and payerId:', payerId);

        if (!response.ok) {
            throw new Error('Payment execution failed');
        }

        const executionData = await response.json();
        return executionData;
    } catch (error) {
        console.error('Error executing payment:', error);
        throw error;
    }
};
import config from '../../config';
import { encode } from 'base-64';
import { Alert } from 'react-native';

const PAYPAL_ENVIRONMENT = config.PAYPAL_ENVIRONMENT === 'sandbox' ? 'sandbox' : 'live';
const BASE_URL = `https://api.${PAYPAL_ENVIRONMENT}.paypal.com`;

export const getAccessToken = async () => {
    const credentials = encode(`${config.PAYPAL_CLIENT_ID}:${config.PAYPAL_CLIENT_SECRET}`);
    try {
        const response = await fetch(`https://api-m.${PAYPAL_ENVIRONMENT}.paypal.com/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        });

        if (!response.ok) {
            throw new Error('Failed to get access token');
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Error retrieving access token:', error);
        throw error;
    }
};

export const createOrder = async (amount) => {
    const accessToken = await getAccessToken();
    const orderPayload = {
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'USD',
                value: amount.toString()
            },
            description: 'Order from ClothesStore shop'
        }],
        application_context: {
            return_url: "clothesstore://payment-success",
            cancel_url: "clothesstore://payment-cancel",
            brand_name: "ClothesStore",
            user_action: "PAY_NOW"
        }
    };

    const response = await fetch(`${BASE_URL}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(orderPayload)
    });

    const orderData = await response.json();
    if (!response.ok) {
        console.error("Error creating order:", orderData);
        throw new Error(orderData.message || 'Failed to create order');
    }

    return orderData;
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
    const accessToken = await getAccessToken();
    const response = await fetch(`${BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });

    const captureData = await response.json();
    if (!response.ok) {
        console.error("Error capturing order:", captureData);
        throw new Error(captureData.message || 'Order capture failed');
    }

    console.log("Capture Data:", captureData); // Checking capture response
    return captureData;
};

export const createPayment = async (amount) => {
    const accessToken = await getAccessToken();

    const paymentPayload = {
        intent: 'CAPTURE', // This is correct for PayPal v2
        purchase_units: [{
            amount: {
                currency_code: 'USD',
                value: amount.toString()
            },
            description: 'Order from ClothesStore shop'
        }],
        application_context: {
            return_url: "clothesstore://payment-success",
            cancel_url: "clothesstore://payment-cancel",
            brand_name: "ClothesStore",
            user_action: "PAY_NOW"
        }
    };

    const response = await fetch(`${BASE_URL}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(paymentPayload)
    });

    const orderData = await response.json();
    if (!response.ok) {
        console.error("Failed to create payment:", orderData);
        throw new Error(orderData.message || 'Failed to create payment');
    }

    return orderData;
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
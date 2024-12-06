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

export const createOrder = async (validAmount, selectedProducts, discountTotal) => {
    console.log('Creating PayPal order with total amount (after discounts):', validAmount);

    // Kiểm tra và ép kiểu validAmount thành số thực
    const totalAmount = parseFloat(validAmount);
    if (isNaN(totalAmount)) {
        console.error('Invalid totalAmount:', validAmount);
        throw new Error('Invalid totalAmount passed to createOrder. It must be a valid number.');
    }

    const accessToken = await getAccessToken();
    console.log('Access token obtained');

    // Tính toán item_total (tổng tiền các sản phẩm trước giảm giá)
    const itemTotal = selectedProducts.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
    ).toFixed(2);

    // Log để kiểm tra giá trị của item_total và validAmount
    console.log('Calculated item total (before discounts):', itemTotal);
    console.log('Total amount after discount (validAmount):', validAmount);

    // Các thành phần khác trong amount (thuế, phí vận chuyển, v.v.)
    const taxTotal = 0.00;
    const shippingTotal = 1.00;
    
    // Đảm bảo discountTotal không phải là undefined
    const discount = discountTotal || 0.00;

    // Tính tổng số tiền thanh toán từ các thành phần
    const totalWithTaxesAndFees = parseFloat(itemTotal) + parseFloat(shippingTotal) - parseFloat(discount);

    // Kiểm tra lại tổng số tiền
    console.log('Calculated total with taxes and fees:', totalWithTaxesAndFees);

    // Cấu hình payload
    const items = selectedProducts.map(item => {
        const productName = item.product?.name;
        const productDescription = item.product?.description || 'No description provided';

        if (!productName || productName.trim() === '') {
            console.error('Missing product name for product:', item);
            throw new Error('Product name is required');
        }

        if (typeof item.price !== 'number' || isNaN(item.price)) {
            console.error('Invalid item price:', item.price);
            throw new Error('Item price must be a valid number');
        }

        return {
            name: productName,
            description: productDescription.slice(0, 127),
            quantity: item.quantity.toString(),
            unit_amount: {
                currency_code: 'USD',
                value: item.price.toFixed(2),
            },
        };
    });

    const orderPayload = {
        intent: 'CAPTURE',
        purchase_units: [
            {
                items: items,
                amount: {
                    currency_code: 'USD',
                    value: totalWithTaxesAndFees.toFixed(2), // Tổng số tiền thanh toán sau giảm giá
                    breakdown: {
                        item_total: {
                            currency_code: 'USD',
                            value: itemTotal, // Tổng tiền sản phẩm trước giảm giá
                        },
                        tax_total: {
                            currency_code: 'USD',
                            value: taxTotal.toFixed(2), // Thuế nếu có
                        },
                        shipping: {
                            currency_code: 'USD',
                            value: shippingTotal.toFixed(2), // Phí vận chuyển nếu có
                        },
                        discount: {
                            currency_code: 'USD',
                            value: discount.toFixed(2), // Giảm giá nếu có
                        },
                    },
                },
            },
        ],
        application_context: {
            return_url: "clothesstore://payment-success",
            cancel_url: "clothesstore://payment-cancel",
            brand_name: "ClothesStore",
            user_action: "PAY_NOW",
        },
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

        if (captureData.status !== 'COMPLETED') {
            throw new Error(`Capture failed: ${captureData.status}`);
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
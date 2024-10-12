import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../components/Header';

const CheckoutScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    
    // Nhận danh sách sản phẩm được chọn từ CartScreen
    const { selectedProducts } = route.params;

    const renderOrderItem = ({ item }) => (
        <View style={styles.orderItem}>
            <Image source={{ uri: item.product.image }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.itemSize}>Size: {item.size}</Text>
                <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Header title="Checkout" onBackPress={() => navigation.goBack()} />

            <View style={styles.shippingSection}>
                <Text style={styles.sectionTitle}>Shipping Address</Text>
                <View style={styles.addressDetails}>
                    <Icon name="map-marker" size={24} color="brown" />
                    <View style={styles.addressText}>
                        <Text style={styles.addressName}>Home</Text>
                        <Text style={styles.addressLocation}>1901 Thornridge Cir. Shiloh, Hawaii 81063</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('ShippingAddress')}>
                        <Text style={styles.changeText}>CHANGE</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.shippingSection}>
                <Text style={styles.sectionTitle}>Choose Shipping Type</Text>
                <View style={styles.addressDetails}>
                    <Icon name="truck" size={24} color="brown" />
                    <View style={styles.addressText}>
                        <Text style={styles.addressName}>Economy</Text>
                        <Text style={styles.addressLocation}>Estimated Arrival 25 August 2023</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('ChooseShipping')}>
                        <Text style={styles.changeText}>CHANGE</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.orderListTitle}>Order List</Text>

            <FlatList
                data={selectedProducts}
                renderItem={renderOrderItem}
                keyExtractor={(item) => item.cartId}
                contentContainerStyle={styles.listContent}
            />

            <TouchableOpacity style={styles.paymentButton} onPress={() => navigation.navigate('Payment')}>
                <Text style={styles.paymentText}>Continue to Payment</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    shippingSection: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        color: 'black'
    },
    addressDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    addressText: {
        flex: 1,
        marginLeft: 10,
    },
    addressName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    addressLocation: {
        fontSize: 14,
        color: '#666',
    },
    changeText: {
        color: '#0000FF',
        fontWeight: '600',
    },
    orderListTitle: {
        fontSize: 25,
        color: "black",
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        paddingHorizontal: 20,
    },
    listContent: {
        paddingBottom: 80,
    },
    orderItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderColor: '#e0e0e0',
        alignItems: 'center',
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
    },
    itemDetails: {
        flex: 1,
        marginLeft: 16,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemSize: {
        fontSize: 15,
        color: '#888',
    },
    itemPrice: {
        fontSize: 16,
        marginTop: 8,
        fontWeight: 'bold',
    },
    itemQuantity: {
        fontSize: 15,
        color: '#888',
    },
    paymentButton: {
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
    paymentText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CheckoutScreen;

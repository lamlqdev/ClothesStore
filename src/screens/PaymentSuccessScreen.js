import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon2 from 'react-native-vector-icons/Ionicons';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import Header from '../components/Header';

const PaymentSuccessScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Header title="Payment" onBackPress={() => navigation.navigate('Home')} />

            <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                    <Icon2 name="checkmark" size={50} color="#fff" />
                </View>
                <Text style={styles.successText}>Payment Successful!</Text>
                <Text style={styles.subText}>Thank you for your purchase.</Text>
            </View>

            <TouchableOpacity style={styles.viewOrderButton} onPress={() => navigation.navigate('MyOrders')} >
                <Text style={styles.buttonText}>View Order</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 30,
    },
    successIcon: {
        backgroundColor: 'brown',
        width: 100,
        height: 100,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    successText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        color: Colors.black
    },
    subText: {
        fontSize: 16,
        color: '#888',
        marginTop: 10,
    },
    viewOrderButton: {
        backgroundColor: '#8B4513',
        padding: 16,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default PaymentSuccessScreen;

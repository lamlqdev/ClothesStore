import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/Ionicons';
import Icon3 from 'react-native-vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';

const PaymentScreen = () => {
    const navigation = useNavigation();
    const [selectedOption, setSelectedOption] = useState(null);

    const paymentOptions = [
        { id: 'paypal', name: 'Paypal', icon: <Icon name="paypal" size={24} color="#0070BA" /> },
        { id: 'applepay', name: 'Apple Pay', icon: <Icon name="apple" size={24} color="black" /> },
        { id: 'googlepay', name: 'Google Pay', icon: <Icon3 name="google-pay" size={24} color="#4285F4" /> },
    ];

    const handleOptionPress = (optionId) => {
        setSelectedOption(optionId);
    };

    return (
        <View style={styles.container}>
            <Header title="Payment Methods" onBackPress={() => navigation.goBack()} />
            
            <Text style={styles.paymentOptionsTitle}>Credit & Debit Cart</Text>
            <View style={styles.cardSection}>
                <TouchableOpacity style={styles.cardButton} onPress={() => navigation.navigate('AddCard')}>
                    <Icon name="credit-card" size={24} color="#8B4513" />
                    <Text style={styles.cardText}>Add Card</Text>
                    <Icon name="chevron-right" size={20} color="#8B4513" />
                </TouchableOpacity>
            </View>

            <Text style={styles.paymentOptionsTitle}>More Payment Options</Text>
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

            <TouchableOpacity style={styles.confirmButton} onPress={() => navigation.navigate('PaymentSuccess')}>
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
    cardSection: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    cardButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F5F5F5',
        padding: 15,
        borderRadius: 8,
    },
    cardText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        fontWeight: 'bold',
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
        color: "black"
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

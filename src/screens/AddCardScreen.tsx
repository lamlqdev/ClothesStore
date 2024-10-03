import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const AddCardScreen = () => {
    const navigation = useNavigation();

    const [cardHolderName, setCardHolderName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [saveCard, setSaveCard] = useState('no');

    return (
        <View style={styles.container}>
            <Header title="Add Card" onBackPress={() => navigation.goBack()} />

            <View style={styles.formContainer}>
                <Text style={styles.label}>Card Holder Name</Text>
                <TextInput
                    style={styles.input}
                    value={cardHolderName}
                    onChangeText={setCardHolderName}
                    placeholder="Enter card holder name"
                />

                <Text style={styles.label}>Card Number</Text>
                <TextInput
                    style={styles.input}
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    placeholder="Enter card number"
                    keyboardType="numeric"
                />

                <View style={styles.row}>
                    <View style={styles.inputHalfContainer}>
                        <Text style={styles.label}>Expiry Date</Text>
                        <TextInput
                            style={styles.inputHalf}
                            value={expiryDate}
                            onChangeText={setExpiryDate}
                            placeholder="MM/YY"
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputHalfContainer}>
                        <Text style={styles.label}>CVV</Text>
                        <TextInput
                            style={styles.inputHalf}
                            value={cvv}
                            onChangeText={setCvv}
                            placeholder="000"
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <View style={styles.radioContainer}>
                    <Text style={styles.label}>Save Card</Text>
                    <View style={styles.radioButtonGroup}>
                        <View style={styles.radioButton}>
                            <RadioButton
                                value="yes"
                                status={saveCard === 'yes' ? 'checked' : 'unchecked'}
                                onPress={() => setSaveCard('yes')}
                            />
                            <Text>Yes</Text>
                        </View>
                        <View style={styles.radioButton}>
                            <RadioButton
                                value="no"
                                status={saveCard === 'no' ? 'checked' : 'unchecked'}
                                onPress={() => setSaveCard('no')}
                            />
                            <Text>No</Text>
                        </View>
                    </View>
                </View>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('Payment')}>
                <Text style={styles.addButtonText}>Add Card</Text>
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
    formContainer: {
        marginTop: 30,
    },
    label: {
        fontSize: 26,
        marginBottom: 5,
        fontWeight: 'bold',
        color: Colors.black
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 5,
        padding: 12,
        marginBottom: 20,
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    inputHalfContainer: {
        flex: 1,
        marginRight: 10,
    },
    inputHalf: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 5,
        padding: 12,
        fontSize: 16,
    },
    radioContainer: {
        marginVertical: 20,
    },
    radioButtonGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    addButton: {
        backgroundColor: '#8B4513',
        padding: 16,
        borderRadius: 5,
        alignItems: 'center',
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AddCardScreen;

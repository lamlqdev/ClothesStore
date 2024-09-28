import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome icon
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';

const AddToCartButton = ({ onPress }) => {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <View style={styles.content}>
                <Icon name="shopping-cart" size={20} color="#fff" style={styles.icon} /> 
                <Text style={styles.buttonText}>Add to Cart</Text>
            </View>
        </TouchableOpacity>
    );
};

export default AddToCartButton;

const styles = StyleSheet.create({
    button: {
        backgroundColor: Colors.Brown,
        paddingVertical: 14, 
        paddingHorizontal: 25,
        borderRadius: 8, 
        alignItems: 'center',
        marginRight: 20,
        marginBottom: 15,
        marginStart: 20,
    },
    content: {
        flexDirection: 'row', 
        alignItems: 'center', 
    },
    icon: {
        marginRight: 10, 
    },
    buttonText: {
        color: Colors.White, 
        fontSize: 16, 
        fontFamily: Fonts.interBold, 
    },
});

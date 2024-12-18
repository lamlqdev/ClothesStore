import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const RatingStars = ({ onRatingChange }) => {
    const [rating, setRating] = useState(5);

    const handleRating = (star) => {
        setRating(star);
        if (onRatingChange) onRatingChange(star); // Gửi rating mới cho component cha
    };

    return (
        <View>
            <Text style={styles.textContainer}>Your overall rating</Text>
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => handleRating(star)} style={styles.starButton}>
                        <Icon
                            name={star <= rating ? 'star' : 'star-o'}
                            size={32}
                            color={star <= rating ? '#F5A623' : '#ccc'}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    textContainer: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 10,
    },
    starButton: {
        marginHorizontal: 15,
    },
});

export default RatingStars;

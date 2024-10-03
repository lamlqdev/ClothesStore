import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Fonts } from '../constants/fonts';
import { fontSize } from '../constants/dimensions';

const RatingStars = () => {
  const [rating, setRating] = useState(0);

  return (
    <View>
        <Text style={styles.textContainer}>Your overall rating</Text>
        <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starButton}>
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

const styles = {
  textContainer: {
    fontFamily: Fonts.interRegular,
    fontSize: 14,
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
};

export default RatingStars;

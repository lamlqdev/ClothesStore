import { Animated, FlatList, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import Ionicons from "react-native-vector-icons/Ionicons";
import Icon from 'react-native-vector-icons/FontAwesome';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { iconSize } from '../constants/dimensions';
import SlideItem from './SlideItem';
import Pagination from './Pagination';
import { useNavigation } from '@react-navigation/native';

const HeaderProductDetail = ({ title, showFavoriteIcon, productId, isWished, toggleWishlist }) => {
    const navigation = useNavigation();
    const [wishlistState, setWishlistState] = useState(isWished);

    // Cập nhật trạng thái wishlist khi prop isWished thay đổi
    useEffect(() => {
        setWishlistState(isWished);
    }, [isWished]);

    const handleWishlistToggle = () => {
        toggleWishlist(productId);
        setWishlistState(!wishlistState);
    };

    return (
        <View style={styles.header}>
            <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.goBack()}>
                <Ionicons name={'arrow-back'} color={Colors.Black} size={iconSize.sm} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
            {showFavoriteIcon && (
                <TouchableOpacity style={styles.favoriteIconContainer} onPress={handleWishlistToggle}>
                    <Icon name={'heart'} color={wishlistState ? 'brown' : 'gray'} size={iconSize.sm} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const Slider = ({ images, productId, isWished, toggleWishlist }) => {
    const scrollX = useRef(new Animated.Value(0)).current;
    const [index, setIndex] = useState(0);

    if (!images || !Array.isArray(images) || images.length === 0) {
        return <Text>No images available</Text>;
    }

    const validatedImages = images.map(img => ({ uri: img }));

    const handleonViewableItemsChanged = useRef(({ viewableItems }) => {
        const firstItem = viewableItems[0];
        if (firstItem && firstItem.index !== undefined) {
            setIndex(firstItem.index);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    return (
        <View>
            <HeaderProductDetail 
                showFavoriteIcon={true} 
                productId={productId} 
                isWished={isWished} 
                toggleWishlist={toggleWishlist}
            />
            <FlatList
                data={validatedImages}
                renderItem={({ item }) => <SlideItem item={item} />}
                horizontal
                pagingEnabled
                snapToAlignment="center"
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onViewableItemsChanged={handleonViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                decelerationRate="fast"
            />
            <Pagination data={validatedImages} scrollX={scrollX} />
        </View>
    );
};

export default Slider;

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        top: 25,
        left: 8,
        right: 8,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        zIndex: 1,
    },
    iconContainer: {
        position: 'absolute',
        left: 5,
        width: 35,
        height: 35,
        borderRadius: 20,
        backgroundColor: Colors.White,
        borderWidth: 0.3,
        borderColor: Colors.Black,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        color: Colors.Black,
        fontFamily: Fonts.interBold,
    },
    favoriteIconContainer: {
        position: 'absolute',
        right: 5,
        width: 35,
        height: 35,
        borderRadius: 20,
        backgroundColor: Colors.White,
        borderWidth: 0.3,
        borderColor: Colors.Black,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

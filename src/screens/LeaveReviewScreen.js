import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { Colors } from '../constants/colors';
import Header from '../components/Header';
import OrderList from '../components/OrderList';
import Separator from '../components/Separator';
import { Fonts } from '../constants/fonts';
import ReviewInput from '../components/ReviewInput';
import { useNavigation, useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const RatingStars = ({ onRatingChange }) => {
    const [rating, setRating] = useState(0);

    const handleRating = (star) => {
        setRating(star);
        onRatingChange(star);
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

const LeaveReviewScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { order } = route.params;

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [image, setImage] = useState(null);

    const addReviewToDatabase = async () => {
        try {
            // Lấy userId từ AsyncStorage
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                console.error('UserId is not available');
                return;
            }

            // Thêm review vào Firestore
            await firestore().collection('Reviews').add({
                productId: order.productId,
                userId, // Thêm userId vào dữ liệu review
                rating,
                comment,
                image,
                createdAt: firestore.FieldValue.serverTimestamp(),
            });

            console.log('Review added successfully');
        } catch (error) {
            console.error('Failed to add review:', error);
        }
    };

    const updateProductRating = async () => {
        const productRef = firestore().collection('Products').doc(order.productId);
        await firestore().runTransaction(async transaction => {
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists) throw new Error('Product does not exist.');

            const { rating: currentRating, sale } = productDoc.data();
            const updatedRating = ((currentRating * sale + rating) / (sale + 1)).toFixed(1); // Làm tròn đến 1 chữ số thập phân

            transaction.update(productRef, {
                rating: parseFloat(updatedRating), // Đảm bảo giá trị là số thực
                sale: sale + 1,
            });
        });
    };
    const updateOrderProductReviewStatus = async () => {
        const orderRef = firestore().collection('Orders').doc(order.id);

        try {
            await firestore().runTransaction(async (transaction) => {
                // Lấy tài liệu đơn hàng
                const orderDoc = await transaction.get(orderRef);
                if (!orderDoc.exists) {
                    throw new Error('Order does not exist.');
                }

                // Lấy mảng products
                const { products } = orderDoc.data();
                if (!Array.isArray(products)) {
                    throw new Error('Products field is missing or invalid.');
                }

                // Tìm sản phẩm cần cập nhật
                const updatedProducts = products.map(product => {
                    if (product.productId === order.productId) {
                        return {
                            ...product,
                            hasReviewed: true, // Cập nhật hasReviewed thành true
                        };
                    }
                    return product; // Các sản phẩm khác giữ nguyên
                });

                // Cập nhật lại mảng products
                transaction.update(orderRef, { products: updatedProducts });
            });

            console.log('Product review status updated successfully!');
        } catch (error) {
            console.error('Failed to update product review status:', error);
        }
    };


    const handleLeaveReview = async () => {
        try {
            await addReviewToDatabase();
            await updateProductRating();
            await updateOrderProductReviewStatus();
            //logOrderDetails(order);

            console.log('Review submitted and order status updated successfully!');
            navigation.goBack();
        } catch (error) {
            console.error("Error leaving review:", error);
        }
    };

    const pickImage = async () => {
        const options = {
            mediaType: 'photo',
            maxWidth: 300,
            maxHeight: 300,
            quality: 1,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorMessage) {
                console.log('ImagePicker Error: ', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                const uri = response.assets[0].uri;
                setImage(uri);
            }
        });
    };

    return (
        <View style={styles.container}>
            <View>
                <Header title="Leave Review" style={styles.header} onBackPress={() => navigation.goBack()} />
                <OrderList
                    orderList={[{
                        id: order.orderId,
                        productId: order.productId, // Thêm productId
                        productImage: order.productImage,
                        productName: order.productName,
                        size: order.size,
                        quantity: order.quantity,
                        price: order.price,
                        buttonText: 'Reorder',
                        key: `${order.id}_${order.productId}`,
                    }]}
                    onClickButton={(orderItem) => {
                        if (orderItem.buttonText === 'Reorder') {
                            navigation.navigate('ProductDetail', { productId: orderItem.productId });
                        } else {
                            handleLeaveReview();
                        }
                    }}
                />

                <Separator />
                <Text style={styles.textQuestion}>How is your Order</Text>
                <Separator />
                <RatingStars onRatingChange={setRating} />
                <Separator />
                <ReviewInput onCommentChange={setComment} />

                {/* Add photo section */}
                <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                    <Icon name="camera" size={20} color={Colors.Brown} />
                    <Text style={styles.addPhotoText}>Add photo</Text>
                </TouchableOpacity>
                {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={handleLeaveReview}>
                    <Text style={styles.submitText}>Submit</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default LeaveReviewScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        padding: 10,
        backgroundColor: Colors.White,
        justifyContent: 'space-between',
    },
    textQuestion: {
        fontFamily: Fonts.interBold,
        fontSize: 20,
        color: Colors.Black,
        textAlign: 'center',
        marginVertical: 15,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#E5E5E5',
        padding: 15,
        borderRadius: 10,
        marginRight: 10,
        alignItems: 'center',
    },
    cancelText: {
        fontFamily: Fonts.interRegular,
        color: Colors.Black,
    },
    submitButton: {
        flex: 1,
        backgroundColor: '#8B4513',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    submitText: {
        fontFamily: Fonts.interRegular,
        color: Colors.White,
    },
    addPhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 15,
    },
    addPhotoText: {
        marginLeft: 10,
        fontFamily: Fonts.interRegular,
        color: Colors.Brown,
    },
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginTop: 10,
        alignSelf: 'center',
    },
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
});

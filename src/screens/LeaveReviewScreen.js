import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { launchImageLibrary } from 'react-native-image-picker';
import { Colors } from '../constants/colors';
import Header from '../components/Header';
import OrderList from '../components/OrderList';
import Separator from '../components/Separator';
import { Fonts } from '../constants/fonts';
import ReviewInput from '../components/ReviewInput';
import { useNavigation, useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import RatingStars from '../components/RatingStar';

const LeaveReviewScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { order, product } = route.params;
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [image, setImage] = useState(null);

    const addToCart = async (productId, selectedSize, quantity) => {
        try {
            const userId = order.userId; // Lấy userId từ order
            if (!userId || !selectedSize) {
                Alert.alert('Please select product size');
                return;
            }

            const productSnapshot = await firestore().collection('Products').doc(productId).get();
            if (!productSnapshot.exists) {
                console.warn(`Product with ID ${productId} not found`);
                return;
            }

            const productData = productSnapshot.data();
            const sizeList = productData.sizelist || [];

            const selectedSizeData = sizeList.find(item => item.size === selectedSize);
            if (!selectedSizeData) {
                console.warn(`Size ${selectedSize} not available for product ID ${productId}`);
                return;
            }

            const stock = selectedSizeData.quantity;
            if (stock <= 0) {
                console.warn(`Size ${selectedSize} is out of stock for product ID ${productId}`);
                return;
            }

            const cartRef = firestore().collection('Cart');
            const cartItem = {
                userId,
                productId,
                size: selectedSize,
                quantity: quantity,
                createdAt: firestore.FieldValue.serverTimestamp(),
            };

            const existingCartItemSnapshot = await cartRef
                .where('userId', '==', userId)
                .where('productId', '==', productId)
                .where('size', '==', selectedSize)
                .limit(1)
                .get();

            let cartId;
            if (!existingCartItemSnapshot.empty) {
                const existingCartItem = existingCartItemSnapshot.docs[0];
                cartId = existingCartItem.id;
                const newQuantity = existingCartItem.data().quantity + 1;

                if (newQuantity > stock) {
                    console.warn(`The number of products in the cart exceeds the inventory quantity for product ID ${productId}.`);
                    return;
                }

                await cartRef.doc(cartId).update({ quantity: newQuantity });
            } else {
                const newCartDoc = await cartRef.add(cartItem);
                cartId = newCartDoc.id;
            }

            await firestore().collection('users').doc(userId).update({
                cartlist: firestore.FieldValue.arrayUnion(cartId),
            });

            console.log(`Product ID ${productId} (Size: ${selectedSize}) added to cart.`);
        } catch (error) {
            console.error(`Error adding product ID ${productId} to cart: `, error);
        }
    };

    const addReviewToDatabase = async () => {
        try {
            const userId = order.userId;
            if (!userId) {
                console.error('UserId is not available');
                return;
            }

            // Lưu ảnh Base64 vào Firestore
            await firestore().collection('Reviews').add({
                productId: product.productId,
                userId,
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
        const productRef = firestore().collection('Products').doc(product.productId);
    
        await firestore().runTransaction(async transaction => {
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists) throw new Error('Product does not exist.');
    
            const { rating: currentRating = 0, numberofreviews = 0 } = productDoc.data();
    
            // Tính toán xếp hạng mới
            const updatedRating = ((currentRating * numberofreviews + rating) / (numberofreviews + 1)).toFixed(1);
    
            // Cập nhật giá trị mới vào Firestore
            transaction.update(productRef, {
                rating: parseFloat(updatedRating), // Đảm bảo rating là số thực
                numberofreviews: numberofreviews + 1, // Tăng số lượng review lên 1
            });
        });
    };
    
    

    const updateOrderProductReviewStatus = async () => {
        const orderRef = firestore().collection('Orders').doc(order.id);

        try {
            await firestore().runTransaction(async (transaction) => {
                const orderDoc = await transaction.get(orderRef);
                if (!orderDoc.exists) {
                    throw new Error('Order does not exist.');
                }

                const { products } = orderDoc.data();
                if (!Array.isArray(products)) {
                    throw new Error('Products field is missing or invalid.');
                }

                const updatedProducts = products.map(prod => {
                    if (prod.productId === product.productId) {
                        return {
                            ...prod,
                            hasReviewed: true,
                        };
                    }
                    return prod;
                });

                transaction.update(orderRef, { products: updatedProducts });
            });

            console.log('Product review status updated successfully!');
        } catch (error) {
            console.error('Failed to update product review status:', error);
        }
    };

    const handleLeaveReview = async () => {
        if (comment.trim().length > 200) {
            Alert.alert("Comment too long", "Please keep comments under 200 words.");
            return;
        }
        try {
            await addReviewToDatabase();
            await updateProductRating();
            await updateOrderProductReviewStatus();
            console.log('Review submitted and order status updated successfully!');
            navigation.goBack();
        } catch (error) {
            console.error("Error leaving review:", error);
        }
    };


    // Cập nhật hàm pickImage để chuyển ảnh thành Base64
    const pickImage = async () => {
        const options = {
            mediaType: 'photo',
            maxWidth: 300,
            maxHeight: 300,
            quality: 1,
            includeBase64: true
        };

        launchImageLibrary(options, (response) => {
            console.log("Image picker response:", response);  // Xem phản hồi từ Image Picker

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorMessage) {
                console.log('ImagePicker Error: ', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                const selectedImage = response.assets[0];

                // Kiểm tra nếu Base64 tồn tại trong phản hồi
                if (selectedImage.base64) {
                    console.log("Selected image base64:", selectedImage.base64); // In Base64 ra console
                    setImage(`data:image/jpeg;base64,${selectedImage.base64}`);  // Cập nhật state image
                } else {
                    console.log("No Base64 data found for the image.");
                }
            }
        });
    };

    return (
        <View style={styles.container}>
            <View>
                <Header title="Leave Review" style={styles.header} onBackPress={() => navigation.goBack()} />
                <OrderList
                    orderList={[{
                        id: order.id,
                        productId: product.productId,
                        productImage: product.productImage,
                        productName: product.productName,
                        size: product.size,
                        quantity: product.quantity,
                        price: product.price,
                        buttonText: 'Reorder',
                        key: `${order.id}_${product.productId}`,
                    }]}
                    onClickButton={async () => {
                        try {
                            // Chỉ thêm sản phẩm đang được đánh giá vào giỏ hàng
                            await addToCart(product.productId, product.size, product.quantity);
                            navigation.navigate('Cart'); // Điều hướng sang giỏ hàng
                        } catch (error) {
                            console.error('Error while reordering product:', error);
                            Alert.alert('Failed to reorder product. Please try again.');
                        }
                    }}
                />


                <Separator />
                <Text style={styles.textQuestion}>How is your Order</Text>
                <Separator />
                <RatingStars onRatingChange={setRating} />
                <Separator />
                <ReviewInput onCommentChange={setComment} />

                <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                    <Icon name="camera" size={20} color={Colors.Brown} />
                    <Text style={styles.addPhotoText}>Add photo</Text>
                </TouchableOpacity>
                {image && (
                    <Image source={{ uri: image }} style={styles.imagePreview} />
                )}

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
        backgroundColor: 'White',
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
});

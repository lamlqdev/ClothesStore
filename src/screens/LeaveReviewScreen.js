import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Colors } from '../constants/colors';
import Header from '../components/Header';
import { spacing } from '../constants/dimensions';
import OrderList from '../components/OrderList';
import Separator from '../components/Separator';
import { Fonts } from '../constants/fonts';
import RatingStars from '../components/RatingStar';
import ReviewInput from '../components/ReviewInput';
import ActionButtons from '../components/ActionButton';

const completedOrders = [
    {
        id: '2',
        productImage: 'https://brabions.com/cdn/shop/products/image_20cb4685-80d3-43fa-b180-98cc626964dd.jpg?v=1620246884',
        productName: 'Black Hoodie',
        size: 'L',
        quantity: 5,
        price: 65.50,
    },
];

const LeaveReviewScreen = () => {

    const handleLeaveReview = (item) => {
        console.log('Tracking order for:', item.productName);
    };

    return (
        <View style={styles.container}>
            <View>
                <Header title={"Leave Review"} style={styles.header} />
                <OrderList
                    orderList={completedOrders.map(order => ({
                        ...order,
                        buttonText: 'Re-Order',
                    }))}
                    onClickButton={handleLeaveReview}
                />
                <Separator />
                <Text style={styles.textQuestion}>How is your Order</Text>
                <Separator />
                <RatingStars />
                <Separator />
                <ReviewInput />
            </View>
            <View style={styles.buttonContainer}>
                <ActionButtons />
            </View>
        </View>
    );
}

export default LeaveReviewScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        padding: spacing.sm,
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
        marginTop: 'auto',
    },
});

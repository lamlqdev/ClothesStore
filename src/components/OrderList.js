import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import OrderCard from './OrderCard'; // Đảm bảo đã import đúng đường dẫn đến OrderCard component
import { Colors } from '../constants/colors';
import { spacing } from '../constants/dimensions';

const OrderList = ({ orderList, onClickButton }) => {

  const renderItem = ({ item }) => (
    <OrderCard
      productImage={item.productImage}
      productName={item.productName}
      size={item.size}
      quantity={item.quantity}
      price={item.price}
      buttonText={item.buttonText}
      onClickButton={() => onClickButton(item)}
    />
  );


  return (
    <FlatList
      data={orderList}
      renderItem={renderItem}
      keyExtractor={(item) => item.key}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={styles.contentContainer}
      initialNumToRender={5}
      windowSize={10}
      showsVerticalScrollIndicator={false}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginStart: 10,
    marginEnd: 10,
  },
  contentContainer: {
    paddingBottom: spacing.lg,
  },
  separator: {
    height: 0.7,
    backgroundColor: Colors.LightGray,
    marginHorizontal: spacing.sm,
  },
});

export default OrderList;
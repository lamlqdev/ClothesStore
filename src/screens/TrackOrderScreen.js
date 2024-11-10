import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Header from '../components/Header'
import { spacing } from '../constants/dimensions'
import { Colors } from '../constants/colors'
import OrderList from '../components/OrderList'
import Separator from '../components/Separator'
import OrderDetails from '../components/OrderDetail'
import OrderStatus from '../components/OrderStatus'
import { useRoute } from '@react-navigation/native';

const activeOrders = [
  {
      id: '1',
      productImage: 'https://thursdayboots.com/cdn/shop/products/1024x1024-Men-Moto-Tobacco-050322-1_1024x1024.jpg?v=1652112663',
      productName: 'Brown Jacket',
      size: 'XL',
      quantity: 10,
      price: 83.97,
  },
]

const statuses = [
  {
    title: 'Order Placed',
    time: '23 Aug 2023, 04:25 PM',
    completed: true,
    icon: 'receipt',
  },
  {
    title: 'In Progress',
    time: '23 Aug 2023, 03:54 PM',
    completed: true,
    icon: 'inventory',
  },
  {
    title: 'Shipped',
    time: 'Expected 02 Sep 2023',
    completed: false,
    icon: 'local-shipping',
  },
  {
    title: 'Delivered',
    time: '23 Aug 2023, 2023',
    completed: false,
    icon: 'inventory',
  },
];

const TrackOrderScreen = ({navigation}) => {

  const route = useRoute();
  const { order } = route.params;
  console.log("Received Order:", order);
  const handleTrackOrder = (item) => {
    console.log('Tracking order for:', item.productName);
};

  return (
    <View style={styles.container}>
      <View>
      <Header title="Track Order" 
       onBackPress={() => navigation.goBack()}
      />
      <OrderList
        orderList={activeOrders.map(order => ({
            ...order,
            buttonText: '',
        }))}
        
        onClickButton={handleTrackOrder}
      />
      <Separator style={styles.separator}/>
      <OrderDetails 
        deliveryDate="03 Sep 2023" 
        trackingId="TRK452126542" 
      />
      <Separator style={styles.separator}/>
      <OrderStatus statuses={statuses}/>
      </View>
      
    </View>
  )
}

export default TrackOrderScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    padding: spacing.sm,
    backgroundColor: Colors.White,
    justifyContent: 'space-between',  
},
  separator: {
    marginTop: 20
  }

})
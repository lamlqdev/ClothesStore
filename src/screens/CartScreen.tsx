import React, { useState } from 'react';
import { View, Text, StatusBar, FlatList, Image, TouchableOpacity, TextInput, StyleSheet, Modal } from 'react-native';
import { Colors } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import Header from '../components/Header';

const cartItems = [
  {
    id: '1',
    name: 'Brown Jacket',
    size: 'XL',
    price: 83.97,
    image: { uri: 'https://thursdayboots.com/cdn/shop/products/1024x1024-Men-Moto-Tobacco-050322-1_1024x1024.jpg?v=1652112663' },
    quantity: 1,
  },
  {
    id: '2',
    name: 'Brown Suite',
    size: 'XL',
    price: 120,
    image: { uri: 'https://brabions.com/cdn/shop/products/image_20cb4685-80d3-43fa-b180-98cc626964dd.jpg?v=1620246884' },
    quantity: 1,
  },
  {
    id: '3',
    name: 'Yellow Shirt',
    size: 'XL',
    price: 60,
    image: { uri: 'https://m.media-amazon.com/images/I/6155ycyBqWL._AC_UY1000_.jpg' },
    quantity: 1,
  },
  {
    id: '4',
    name: 'Red Dress',
    size: 'L',
    price: 500,
    image: { uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSf05jWbUmZSFcnHa2oJVV39tUvN-iJMpfyZw&s' },
    quantity: 1,
  }
];

const CartScreen = () => {
  const [items, setItems] = useState(cartItems);
  const [promoCode, setPromoCode] = useState('');
  const [showPromo, setShowPromo] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [removeQuantity, setRemoveQuantity] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const navigation = useNavigation();

  const handleItemPress = (item) => {
    setSelectedItem(item);
    setShowPromo(true);
  };

  const handleRemoveItem = (item) => {
    setItemToRemove(item);
    setRemoveQuantity(item.quantity);
    setShowRemoveModal(true);
  };

  const confirmRemoveItem = () => {
    if (removeQuantity >= itemToRemove.quantity) {
      setItems(items.filter(i => i.id !== itemToRemove.id));
    } else {
      setItems(items.map(i => i.id === itemToRemove.id ? { ...i, quantity: i.quantity - removeQuantity } : i));
    }
    setShowRemoveModal(false);
  };

  const handleIncreaseQuantity = (item) => {
    setItems(items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
  };

  const handleDecreaseQuantity = (item) => {
    if (item.quantity > 1) {
      setItems(items.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i));
    }
  };

  const renderCartItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity
          onPress={() => handleRemoveItem(item)}
          style={styles.trashContainer}
        >
          <Text style={styles.trashIcon}>🗑</Text>
        </TouchableOpacity>
      )}
    >
      <View style={styles.cartItem}>
        <TouchableOpacity onPress={() => handleItemPress(item)} style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Image source={item.image} style={styles.itemImage} />
          
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemSize}>Size: {item.size}</Text>
            <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.quantityControl}>
          <TouchableOpacity onPress={() => handleDecreaseQuantity(item)} style={styles.quantityButton}>
            <Text style={styles.quantityText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityNumber}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => handleIncreaseQuantity(item)} style={styles.quantityButton}>
            <Text style={styles.quantityText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Swipeable>
  );  

  const calculateTotal = () => {
    const subTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = 35;
    const deliveryFee = 25;
    const total = subTotal + deliveryFee - discount;
    return { subTotal, discount, deliveryFee, total };
  };

  const { subTotal, discount, deliveryFee, total } = calculateTotal();

  return (
    <GestureHandlerRootView style={{ flex: 1, paddingBottom: 80 }}>
      <View style={styles.container}>
        <Header title="My Cart" onBackPress={undefined} />
        <FlatList
          data={items}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />

        {selectedItem && (
          <>
            <View style={styles.promoContainer}>
              <TextInput
                style={styles.promoInput}
                placeholder="Promo Code"
                value={promoCode}
                onChangeText={setPromoCode}
              />
              <TouchableOpacity style={styles.applyButton}>
                <Text style={styles.applyText}>Apply</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>Sub-Total</Text>
                <Text style={styles.summaryText}>${subTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>Delivery Fee</Text>
                <Text style={styles.summaryText}>${deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>Discount</Text>
                <Text style={styles.summaryText}>-${discount.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.totalText}>Total Cost</Text>
                <Text style={styles.totalText}>${total.toFixed(2)}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => navigation.navigate('Checkout')}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </>
        )}

        <Modal visible={showRemoveModal} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Remove from Cart?</Text>
              <View style={styles.modalItemDetails}>
                <Image source={itemToRemove?.image} style={styles.modalItemImage} />
                <View>
                  <Text style={styles.itemName}>{itemToRemove?.name}</Text>
                  <Text>{itemToRemove?.size}</Text>
                  <Text style={styles.itemName}>${itemToRemove?.price}</Text>
                </View>
              </View>

              <View style={styles.quantityControl}>
                <TouchableOpacity onPress={() => setRemoveQuantity(removeQuantity > 1 ? removeQuantity - 1 : 1)} style={styles.quantityButton}>
                  <Text style={styles.quantityText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityNumber}>{removeQuantity}</Text>
                <TouchableOpacity onPress={() => setRemoveQuantity(removeQuantity + 1)} style={styles.quantityButton}>
                  <Text style={styles.quantityText}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setShowRemoveModal(false)} style={styles.modalCancelButton}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmRemoveItem} style={styles.modalRemoveButton}>
                  <Text style={styles.modalButtonText}>Yes, Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cartItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center'
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemSize: {
    fontSize: 15,
    color: '#888',
  },
  itemPrice: {
    fontSize: 16,
    marginTop: 8,
    fontWeight: 'bold',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  quantityButton: {
    padding: 8,
    backgroundColor: Colors.Brown,
    borderRadius: 5,
  },
  quantityText: {
    fontSize: 18,
    color: 'white',
  },
  quantityNumber: {
    marginHorizontal: 8,
    fontSize: 16,
  },
  promoContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  promoInput: {
    flex: 1,
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 8,
    borderRadius: 5,
  },
  applyButton: {
    marginLeft: 8,
    padding: 10,
    backgroundColor: Colors.Brown,
    borderRadius: 5,
  },
  applyText: {
    color: '#fff',
  },
  summaryContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 16,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutButton: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.Brown,
    borderRadius: 5,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trashContainer: {
    backgroundColor: '#ff5252',
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
  },
  trashIcon: {
    color: '#fff',
    fontSize: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalItemImage: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    padding: 12,
    backgroundColor: Colors.Grey,
    borderRadius: 15,
    flex: 1,
    marginRight: 8,
  },
  modalRemoveButton: {
    padding: 12,
    backgroundColor: Colors.Brown,
    borderRadius: 15,
    flex: 1,
  },
  modalButtonText: {
    textAlign: 'center',
    color: '#fff',
  },
});

export default CartScreen;

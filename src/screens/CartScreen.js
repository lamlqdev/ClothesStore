import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, Modal, Image, TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { auth } from '../firebaseConfig';
import Header from '../components/Header';
import CheckBox from '@react-native-community/checkbox';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const user = auth.currentUser;
      setUserId(user.uid);
    };

    fetchUserId();
  }, []);


  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
  
      const fetchCartListAndProducts = async () => {
        try {
          // Lấy cartlist của người dùng từ tài liệu người dùng trong Firestore
          const userDoc = await firestore().collection('users').doc(userId).get();
          const userData = userDoc.data();
          let cartlist = userData?.cartlist || [];
  
          // Đảo ngược thứ tự của cartlist
          cartlist = cartlist.reverse();
  
          if (cartlist.length === 0) {
            console.log('User has no items in the cart.');
            setCartItems([]);
            setLoading(false);
            return;
          }
  
          // Lấy dữ liệu giỏ hàng từ Firestore và lọc các sản phẩm có cartId trong cartlist
          const cartData = cartlist.map(async (cartId) => {
            const cartDoc = await firestore().collection('Cart').doc(cartId).get();
            const cartItem = cartDoc.data();
  
            if (!cartItem) {
              console.warn('Cart item not found:', cartId);
              return null;
            }
  
            const productDoc = await firestore()
              .collection('Products')
              .doc(cartItem.productId)
              .get();
  
            if (!productDoc.exists) {
              console.warn('Product not found:', cartItem.productId);
              return null;
            }
  
            const productData = productDoc.data();
  
            // Kiểm tra sizelist có tồn tại và là mảng không
            if (!productData.sizelist || !Array.isArray(productData.sizelist)) {
              console.warn('Invalid sizelist for product:', cartItem.productId);
              return null;
            }
  
            const sizeInfo = productData.sizelist.find(item => item.size === cartItem.size);
  
            if (!sizeInfo) {
              console.warn('Size not found for product:', cartItem.productId);
              return null;
            }
  
            return {
              cartId,
              product: productData,
              productId: cartItem.productId,
              size: cartItem.size,
              quantity: cartItem.quantity,
              stock: sizeInfo?.quantity || 0, // Fallback for stock
              price: productData.price,
            };
          });
  
          // Chờ tất cả các sản phẩm trong cartlist
          const items = await Promise.all(cartData);
          setCartItems(items.filter(item => item !== null));
          setLoading(false);
  
        } catch (error) {
          console.error('Error fetching cartlist and products:', error);
          setLoading(false);
        }
      };
  
      fetchCartListAndProducts();
    }, [userId])
  );
  

  const handleQuantityChange = (cartId, newQuantity, stock) => {
    if (newQuantity < 1 || newQuantity > stock) {
      Alert.alert('Invalid quantity. Please enter a valid number.');
    } else {
      firestore()
        .collection('Cart')
        .doc(cartId)
        .update({ quantity: newQuantity })
        .then(() => {
          setCartItems((prevItems) =>
            prevItems.map((item) =>
              item.cartId === cartId ? { ...item, quantity: newQuantity } : item
            )
          );
          setSelectedItems([]);
          setSelectAll(false);
        })
        .catch((error) => console.error('Error updating cart quantity:', error));
    }
  };

  const handleInputChange = (item, value) => {
    const newQuantity = parseInt(value);
    if (!isNaN(newQuantity)) {
      handleQuantityChange(item.cartId, newQuantity, item.stock);
    }
  };

  const handleIncreaseQuantity = (item) => {
    handleQuantityChange(item.cartId, item.quantity + 1, item.stock);
  };

  const handleDecreaseQuantity = (item) => {
    if (item.quantity > 1) {
      handleQuantityChange(item.cartId, item.quantity - 1, item.stock);
    }
  };

  const handleRemoveItem = (item) => {
    setItemToRemove(item);
    setShowRemoveModal(true);
  };

  const confirmRemoveItem = async () => {
    try {
      await firestore()
        .collection('Cart')
        .doc(itemToRemove.cartId)
        .delete();
      setCartItems(cartItems.filter(i => i.cartId !== itemToRemove.cartId));

      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          cartlist: firestore.FieldValue.arrayRemove(itemToRemove.cartId),
        });

      setShowRemoveModal(false);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length > 0) {
      console.log('Selected Products:', selectedItems);
      navigation.navigate('Checkout', { selectedProducts: selectedItems });
      setSelectedItems([]);
      setSelectAll(false);
    } else {
      Alert.alert('Please select products to checkout.');
    }
  };

  useEffect(() => {
    const newTotal = selectedItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    calculateTotal(newTotal);
  }, [selectedItems, cartItems]);

  const toggleSelectItem = (item) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...cartItems]);
    }
    setSelectAll(!selectAll);
  };

  const calculateTotal = () => {
    const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return total % 1 === 0 ? total.toString() : total.toFixed(2);
  };

  const renderCartItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity onPress={() => handleRemoveItem(item)} style={styles.trashContainer}>
          <Text style={styles.trashIcon}>🗑</Text>
        </TouchableOpacity>
      )}
    >
      <View style={styles.cartItem}>
        <View style={styles.leftContainer}>
          <CheckBox
            value={selectedItems.includes(item)}
            onValueChange={() => toggleSelectItem(item)}
            tintColors={{ true: Colors.Brown, false: '#ccc' }}
          />
          <Image source={{ uri: item.product.image }} style={styles.itemImage} />
        </View>
        <View style={styles.itemDetails}>
          <Text style={styles.productName}>{item.product.name}</Text>
          <Text style={styles.sizeText}>Size: {item.size}</Text>
          <Text style={styles.priceText}>Price: ${item.price}</Text>
          <View style={styles.quantityControl}>
            <TouchableOpacity onPress={() => handleDecreaseQuantity(item)} style={styles.quantityButton}>
              <Text style={styles.quantityText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.quantityInput}
              keyboardType="numeric"
              value={item.quantity.toString()}
              onChangeText={(value) => handleInputChange(item, value)}
            />
            <TouchableOpacity onPress={() => handleIncreaseQuantity(item)} style={styles.quantityButton}>
              <Text style={styles.quantityText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Swipeable>
  );

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Header title="My Cart" />

        <View style={styles.selectAllContainer}>
          <CheckBox
            value={selectAll}
            onValueChange={toggleSelectAll}
            tintColors={{ true: Colors.Brown, false: '#ccc' }}
          />
          <Text style={styles.selectAllText}>Select All</Text>
        </View>

        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.cartId}
          renderItem={renderCartItem}
          contentContainerStyle={styles.flatListContent}
        />

        <View style={styles.footer}>
          <View style={styles.summaryContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>Total:</Text>
              <Text style={styles.totalText}>${calculateTotal()}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal visible={showRemoveModal} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Remove from Cart?</Text>
              <View style={styles.modalItemDetails}>
                <Image source={{ uri: itemToRemove?.product?.image }} style={styles.modalItemImage} />
                <View>
                  <Text style={styles.itemName}>{itemToRemove?.product?.name}</Text>
                  <Text>Size: {itemToRemove?.size}</Text>
                  <Text style={styles.itemName}>${itemToRemove?.price}</Text>
                </View>
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
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#ddd'
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginLeft: 10,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
  },
  productName: {
    fontFamily: Fonts.interBold,
    fontSize: 16,
    marginBottom: 8,
    color: 'black'
  },
  sizeText: {
    fontFamily: Fonts.interRegular,
    marginBottom: 4,
    color: 'black'
  },
  priceText: {
    fontFamily: Fonts.interRegular,
    marginBottom: 4,
    color: 'black'
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: Colors.Gray,
    borderRadius: 5,
    padding: 8,
    width: 40,
    textAlign: 'center',
    color: 'black'
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.Brown,
    borderRadius: 5,
  },
  quantityText: {
    fontSize: 20,
    color: 'white',
  },
  quantityNumber: {
    marginHorizontal: 12,
    fontSize: 18,
    color: 'black'
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  selectAllText: {
    fontFamily: Fonts.interBold,
    fontSize: 16,
    marginLeft: 8,
  },
  flatListContent: {
    paddingBottom: 150,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 80,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalText: {
    fontFamily: Fonts.interBold,
    fontSize: 18,
  },
  checkoutButton: {
    padding: 16,
    backgroundColor: Colors.Brown,
    borderRadius: 30,
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

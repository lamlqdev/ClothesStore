import React from 'react';
import { View, Text, Image, StatusBar, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Colors } from '../constants/colors';
import Header from '../components/Header';
import { fontSize, iconSize, spacing } from '../constants/dimensions';
import Feather from 'react-native-vector-icons/Feather';
import { Fonts } from '../constants/fonts';

const menuItems = [
  { title: 'Your profile', icon: 'user' },
  { title: 'Payment Methods', icon: 'credit-card' },
  { title: 'My Orders', icon: 'shopping-bag' },
  { title: 'Settings', icon: 'settings' },
  { title: 'Help Center', icon: 'help-circle' },
  { title: 'Privacy Policy', icon: 'lock' },
  { title: 'Invites Friends', icon: 'users' },
  { title: 'Log out', icon: 'log-out' },
];

// Cập nhật renderItem để nhận navigation đúng cách
const renderItem = ({ item, navigation }) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={() => {
      if (item.title === 'Settings') {
        navigation.navigate('Setting'); // Điều hướng sang màn hình Settings
      }
    }}
  >
    <View style={styles.menuIconContainer}>
      <Feather name={item.icon} size={28} color={Colors.Brown} />
    </View>
    <Text style={styles.menuText}>{item.title}</Text>
    <Feather name="chevron-right" size={iconSize.md} color={Colors.Brown} />
  </TouchableOpacity>
);

const ProfileScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.White} />

      <Header title="Profile" />

      <View style={styles.profileImageContainer}>
        <Image
          source={require('../../assets/images/profile_picture.png')}
          style={styles.profileImage}
        />
        <TouchableOpacity style={styles.editIconContainer}>
          <Feather name={"edit-3"} size={iconSize.sm} color={Colors.White} />
        </TouchableOpacity>
      </View>

      <View style={styles.nameContainer}>
        <Text style={styles.name}>Le Quang Lam</Text>
      </View>

      <FlatList
        data={menuItems}
        renderItem={({ item }) => renderItem({ item, navigation })} // Truyền navigation vào renderItem
        keyExtractor={(item) => item.title}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.sm,
    backgroundColor: Colors.White,
  },
  profileImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  profileImage: {
    height: 90,
    width: 90,
    borderRadius: 15,
  },
  editIconContainer: {
    height: 30,
    width: 30,
    backgroundColor: Colors.Brown,
    borderColor: Colors.White,
    borderWidth: 2,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    marginLeft: 60,
  },
  nameContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  name: {
    fontFamily: Fonts.interBold,
    fontSize: fontSize.lg,
    color: Colors.Black,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    marginStart: 5,
    marginEnd: 10,
    backgroundColor: Colors.White,
  },
  menuIconContainer: {
    width: 40,
    marginEnd: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: fontSize.md,
    color: Colors.Black,
    marginLeft: spacing.sm,
    fontFamily: Fonts.interMedium,
  },
  separator: {
    height: 0.7,
    backgroundColor: Colors.LightGray,
    marginHorizontal: spacing.sm,
  },
});

export default ProfileScreen;

import React from 'react';
import { View, Text, StatusBar, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';  // Import useNavigation hook
import { Colors } from '../constants/colors';
import Header from '../components/Header';
import { fontSize, iconSize, spacing } from '../constants/dimensions';
import Feather from 'react-native-vector-icons/Feather';
import { Fonts } from '../constants/fonts';

const settingsItems = [
  { title: 'Notification Settings', icon: 'bell', screen: 'NotificationSettings' },
  { title: 'Password Manager', icon: 'key', screen: 'PasswordManager' },
  { title: 'Delete Account', icon: 'trash-2', screen: 'DeleteAccount' },
];

const SettingsScreen = ({navigation}) => {

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => {
        if (item.screen === 'PasswordManager') {
          navigation.navigate('PasswordManager');
        }else if(item.screen === 'NotificationSettings') {
          navigation.navigate('Notification');
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.White} />

      {/* Header reused from ProfileScreen */}
      <Header 
      title="Settings" 
      onBackPress={() => navigation.goBack()} 
      />

      <FlatList
        data={settingsItems}
        renderItem={renderItem}
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
    backgroundColor: Colors.White
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
    fontFamily: Fonts.interMedium
  },
  separator: {
    height: 0.7,
    backgroundColor: Colors.LightGray, 
    marginHorizontal: spacing.sm, 
  },
});

export default SettingsScreen;

import React, { useState } from 'react';
import { View, Text, Image, StatusBar, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native';
import { Colors } from '../constants/colors';
import Header from '../components/Header';
import { fontSize, iconSize, spacing } from '../constants/dimensions';
import Feather from 'react-native-vector-icons/Feather';
import { Fonts } from '../constants/fonts';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const menuItems = [
    { title: 'Your profile', icon: 'user' },
    { title: 'Payment Methods', icon: 'credit-card' },
    { title: 'My Orders', icon: 'shopping-bag' },
    { title: 'Settings', icon: 'settings' },
    { title: 'Contact Us', icon: 'help-circle' },
    { title: 'Privacy Policy', icon: 'lock' },
    { title: 'Log out', icon: 'log-out' },
];

const ProfileScreen = ({ navigation, onLogout }) => {
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
                if (item.title === 'Settings') {
                    navigation.navigate('Setting');
                } else if (item.title === 'Payment Methods') {
                    navigation.navigate('Payment', { fromProfile: true });
                } else if (item.title === 'Privacy Policy') {
                    navigation.navigate('PrivacyPolicy', { fromProfile: true });
                } else if (item.title === 'Contact Us') {
                    navigation.navigate('ContactUs', { fromProfile: true });
                } else if (item.title === 'Log out') {
                    setLogoutModalVisible(true);
                } else if (item.title === 'My Orders') {
                    navigation.navigate('MyOrders', { fromProfile: true });
                }
            }}
        >
            <View style={styles.menuIconContainer}>
                <Feather name={item.icon} size={24} color={Colors.Black} />
            </View>
            <Text style={styles.menuText}>{item.title}</Text>
            <Feather name="chevron-right" size={iconSize.md} color={Colors.Black} />
        </TouchableOpacity>
    );

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userId');
        } catch (error) {
            console.error('Failed to logout:', error);
        }

        if (onLogout) {
            onLogout();
        }

        navigation.navigate('SignIn');
    };

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
                    <Feather name={"edit-2"} size={iconSize.sm} color={Colors.White} />
                </TouchableOpacity>
            </View>

            <View style={styles.nameContainer}>
                <Text style={styles.name}>Le Quang Lam</Text>
            </View>

            <FlatList
                data={menuItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.title}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={logoutModalVisible}
                onRequestClose={() => setLogoutModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Are you sure you want to log out?</Text>
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonCancel]}
                                onPress={() => setLogoutModalVisible(false)}
                            >
                                <Text style={styles.textStyleCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonLogout]}
                                onPress={() => {
                                    setLogoutModalVisible(false);
                                    handleLogout();
                                }}
                            >
                                <Text style={styles.textStyleLogout}>Yes, Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.White,
    },
    profileImageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.md,
    },
    profileImage: {
        height: 80,
        width: 80,
        borderRadius: 40,
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: '40%',
        height: 24,
        width: 24,
        backgroundColor: Colors.Brown,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nameContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: spacing.sm,
    },
    name: {
        fontFamily: Fonts.interSemiBold,
        fontSize: fontSize.lg,
        color: 'black',
        fontWeight: 'bold'
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
    },
    menuIconContainer: {
        width: 30,
        marginEnd: spacing.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuText: {
        flex: 1,
        fontSize: fontSize.md,
        color: 'black',
        fontFamily: Fonts.interRegular,
        fontWeight: 'bold'
    },
    separator: {
        height: 1,
        backgroundColor: Colors.LightGray,
    },
    centeredView: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '100%',
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalText: {
        marginBottom: 15,
        color: 'black',
        fontWeight: 'bold',
        textAlign: "center",
        fontSize: fontSize.md,
        fontFamily: Fonts.interMedium,
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        width: '48%',
    },
    buttonCancel: {
        backgroundColor: Colors.White,
        borderWidth: 1,
        borderColor: Colors.Brown,
    },
    buttonLogout: {
        backgroundColor: Colors.Brown,
    },
    textStyleCancel: {
        color: Colors.Brown,
        fontWeight: "bold",
        textAlign: "center",
        fontFamily: Fonts.interSemiBold,
    },
    textStyleLogout: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        fontFamily: Fonts.interSemiBold,
    },
});

export default ProfileScreen;

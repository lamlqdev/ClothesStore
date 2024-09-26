import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';

interface ContactItem {
    icon: string;
    title: string;
    content: string;
}

const contactItems: ContactItem[] = [
    { icon: 'headset-mic', title: 'Customer Service', content: 'Our customer service is available 24/7' },
    { icon: 'whatsapp', title: 'WhatsApp', content: '0943738650' },
    { icon: 'language', title: 'Website', content: 'www.example.com' },
    { icon: 'facebook', title: 'Facebook', content: 'facebook.com/example' },
    { icon: 'history', title: 'Twitter', content: 'twitter.com/example' },
    { icon: 'camera-alt', title: 'Instagram', content: 'instagram.com/example' },
];

const ContactUsScreen = () => {
    const [expandedItem, setExpandedItem] = useState<string | null>(null);
    const navigation = useNavigation();

    const toggleItem = (title: string) => {
        setExpandedItem(expandedItem === title ? null : title);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Contact Us" onBackPress={() => navigation.goBack()} />

            <ScrollView>
                {contactItems.map((item) => (
                    <TouchableOpacity
                        key={item.title}
                        style={styles.itemContainer}
                        onPress={() => toggleItem(item.title)}
                    >
                        <View style={styles.itemHeader}>
                            <Icon name={item.icon} size={24} color="brown" />
                            <Text style={styles.itemTitle}>{item.title}</Text>
                            <Icon
                                name={expandedItem === item.title ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                size={24}
                                color="#000"
                            />
                        </View>
                        {expandedItem === item.title && (
                            <Text style={styles.itemContent}>{item.content}</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    itemContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    itemTitle: {
        flex: 1,
        fontSize: 26,
        fontWeight: 'bold',
        marginLeft: 16,
        color: 'black'
    },
    itemContent: {
        padding: 16,
        paddingTop: 0,
        paddingLeft: 56,
        fontSize: 26,
        color: 'black'
    },
});

export default ContactUsScreen;
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';

const PrivacyPolicyScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Header title="Privacy Policy" onBackPress={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>Privacy Policy</Text>
                <Text style={styles.paragraph}>
                    Your privacy is important to us. This privacy policy explains how we collect, use, and disclose information about you when you use our services.
                </Text>
                <Text style={styles.subTitle}>Information We Collect</Text>
                <Text style={styles.paragraph}>
                    We collect information that you provide to us directly, such as when you create an account, make a purchase, or contact us for support.
                </Text>
                <Text style={styles.subTitle}>How We Use Your Information</Text>
                <Text style={styles.paragraph}>
                    We may use your information to:
                </Text>
                <Text style={styles.listItem}>- Provide, maintain, and improve our services.</Text>
                <Text style={styles.listItem}>- Process transactions and send you related information.</Text>
                <Text style={styles.listItem}>- Communicate with you about products, services, and promotions.</Text>
                <Text style={styles.subTitle}>Sharing Your Information</Text>
                <Text style={styles.paragraph}>
                    We do not sell your personal information. We may share your information with third-party service providers to perform services on our behalf.
                </Text>
                <Text style={styles.subTitle}>Your Rights</Text>
                <Text style={styles.paragraph}>
                    You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us.
                </Text>
                <Text style={styles.subTitle}>Changes to This Privacy Policy</Text>
                <Text style={styles.paragraph}>
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                </Text>
                <Text style={styles.paragraph}>
                    This policy is effective as of [Insert Date].
                </Text>
            </ScrollView>
            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 5,
    },
    paragraph: {
        fontSize: 16,
        marginBottom: 10,
        lineHeight: 22,
    },
    listItem: {
        fontSize: 16,
        marginBottom: 5,
        lineHeight: 22,
        marginLeft: 10,
    },
    button: {
        padding: 15,
        backgroundColor: '#8B4513',
        borderRadius: 5,
        alignItems: 'center',
        margin: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default PrivacyPolicyScreen;

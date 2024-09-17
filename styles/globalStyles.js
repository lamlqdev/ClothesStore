import { StyleSheet } from 'react-native';
import { Colors } from '../src/constants/colors';

const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.White,  
        alignItems: 'center',
        justifyContent: 'center',
    },
    shadow: {
        shadowColor: '#7F5DF0',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
    },
});

export default globalStyles;

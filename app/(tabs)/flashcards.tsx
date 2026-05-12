import { StyleSheet, Text, View } from 'react-native';

export default function ThemesScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Muistikortit</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#67645E'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 50,
        color: '#D1F0FD'
    },
    quote: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#D1F0FD'
    }
});
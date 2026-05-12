import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <LinearGradient
      colors={['#67645E', '#3d3c38']}
      style={styles.container}
    >
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Luku⁺</Text>
      </View>
      <View style={styles.quoteContainer}>
        <Text style={styles.quote}>
          "Don't walk in front of me… I may not follow.
          Don't walk behind me… I may not lead.
          Walk beside me… just be my friend."
        </Text>
      </View>
      <Text style={styles.text}>Albert Camus</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#67645E'
  },
  titleContainer: {
    borderRadius: 8,
    padding: 16,
    shadowColor: '#52504b',
    shadowRadius: 3,
    shadowOpacity: 1,
    shadowOffset: { width: 1, height: 1 },
    elevation: 5,
    backgroundColor: '#67645E'
  },
  title: {
    fontSize: 76,
    fontWeight: 'bold',
    color: '#D1F0FD'
  },
  quoteContainer: {
    marginTop: 20,
  },
  quote: {
    fontSize: 16,
    textAlign: 'left',
    color: '#D1F0FD',
  },
  text: {
    marginTop: 20,
    fontSize: 14,
    color: '#D1F0FD',
  }
});
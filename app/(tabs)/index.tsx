import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Quote {
  id: string;
  text: string;
  author: string;
}

export default function HomeScreen() {
  const [quote, setQuote] = useState<Quote | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadRandomQuote = () => {
        try {
          const quotes: Quote[] = require('../../src/data/quotes.json');
          const randomIndex = Math.floor(Math.random() * quotes.length);
          setQuote(quotes[randomIndex]);
        } catch (error) {
          console.error('Virhe sitaattien lataamisessa:', error);
          setQuote({
            id: '0',
            text: 'Oppiminen on elämän paras seikkailu.',
            author: 'Tuntematon'
          });
        }
      };

      loadRandomQuote();
    }, [])
  );

  return (
    <LinearGradient
      colors={['#67645E', '#3d3c38']}
      style={styles.container}
    >
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Luku⁺</Text>
      </View>

      {quote && (
        <View style={styles.quoteContainer}>
          <Text style={styles.quote}>
            "{quote.text}"
          </Text>
          <Text style={styles.author}>— {quote.author}</Text>
        </View>
      )}
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
    marginTop: 40,
    paddingHorizontal: 20,
  },
  quote: {
    fontSize: 16,
    textAlign: 'center',
    color: '#D1F0FD',
    lineHeight: 24,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  author: {
    fontSize: 14,
    color: '#D1F0FD',
    textAlign: 'center',
    opacity: 0.8,
  }
});
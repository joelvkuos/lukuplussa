import { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useFlashcards } from '../../hooks/useFlashcards';

interface Term {
    id: string;
    term: string;
    category: string;
    definition: string;
}

export default function FlashcardsScreen() {
    const [terms, setTerms] = useState<Term[]>([]);
    const flashcards = useFlashcards(terms);

    useEffect(() => {
        const loadTerms = async () => {
            try {
                const termsData = require('../../src/data/terms.json');
                setTerms(termsData);
            } catch (error) {
                console.error('Virhe termien lataamisessa:', error);
            }
        };

        loadTerms();
    }, []);

    if (!flashcards.isSessionActive) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Muistikortit</Text>

                <View style={styles.statsContainer}>
                    <Text style={styles.statsLabel}>Termeissä yhteensä:</Text>
                    <Text style={styles.statsValue}>{terms.length}</Text>
                </View>

                <ScrollView style={styles.categoriesContainer}>
                    <Text style={styles.categoriesTitle}>Kategoriat:</Text>
                    {Array.from(new Set(terms.map((t) => t.category))).map(
                        (category) => {
                            const count = terms.filter((t) => t.category === category).length;
                            return (
                                <View key={category} style={styles.categoryItem}>
                                    <Text style={styles.categoryName}>{category}</Text>
                                    <Text style={styles.categoryCount}>{count} termiä</Text>
                                </View>
                            );
                        }
                    )}
                </ScrollView>

                <TouchableOpacity
                    style={styles.startButton}
                    onPress={flashcards.startSession}
                >
                    <Text style={styles.startButtonText}>Aloita harjoittelu</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (flashcards.isSessionComplete) {
        const total = flashcards.correctCount + flashcards.incorrectCount;
        const percentage =
            total > 0
                ? Math.round((flashcards.correctCount / total) * 100)
                : 0;

        return (
            <View style={styles.container}>
                <Text style={styles.title}>Harjoittelu valmis! 🎉</Text>

                <View style={styles.resultContainer}>
                    <View style={styles.resultBox}>
                        <Text style={styles.resultLabel}>Oikein</Text>
                        <Text style={[styles.resultNumber, styles.correctColor]}>
                            {flashcards.correctCount}
                        </Text>
                    </View>

                    <View style={styles.resultBox}>
                        <Text style={styles.resultLabel}>Väärin</Text>
                        <Text style={[styles.resultNumber, styles.incorrectColor]}>
                            {flashcards.incorrectCount}
                        </Text>
                    </View>

                    <View style={styles.resultBox}>
                        <Text style={styles.resultLabel}>Osuus</Text>
                        <Text style={styles.resultNumber}>{percentage}%</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.restartButton}
                    onPress={flashcards.startSession}
                >
                    <Text style={styles.restartButtonText}>Harjoittele uudelleen</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.homeButton}
                    onPress={flashcards.endSession}
                >
                    <Text style={styles.homeButtonText}>Takaisin</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                    {flashcards.currentIndex + 1} / {flashcards.totalTerms}
                </Text>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${flashcards.progress}%` },
                        ]}
                    />
                </View>
            </View>

            <View style={styles.sessionStats}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Oikein</Text>
                    <Text style={[styles.statValue, styles.correctColor]}>
                        {flashcards.correctCount}
                    </Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Väärin</Text>
                    <Text style={[styles.statValue, styles.incorrectColor]}>
                        {flashcards.incorrectCount}
                    </Text>
                </View>
            </View>

            {flashcards.currentCard && (
                <TouchableOpacity
                    style={[
                        styles.card,
                        flashcards.isFlipped && styles.cardFlipped,
                    ]}
                    onPress={flashcards.flipCard}
                    activeOpacity={0.8}
                >
                    <Text style={styles.cardLabel}>
                        {flashcards.isFlipped ? 'Määritelmä' : 'Termi'}
                    </Text>

                    <Text style={styles.cardText}>
                        {flashcards.isFlipped
                            ? flashcards.currentCard.definition
                            : flashcards.currentCard.term}
                    </Text>

                    <Text style={styles.cardCategory}>
                        {flashcards.currentCard.category}
                    </Text>

                    <Text style={styles.flipHint}>
                        {flashcards.isFlipped ? 'Paina käännettäväksi' : 'Paina nähdäksesi vastaus'}
                    </Text>
                </TouchableOpacity>
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.responseButton, styles.incorrectButton]}
                    onPress={flashcards.markIncorrect}
                >
                    <Text style={styles.buttonText}>En osaa</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.responseButton, styles.correctButton]}
                    onPress={flashcards.markCorrect}
                >
                    <Text style={styles.buttonText}>Osaan</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.endSessionButton}
                onPress={flashcards.endSession}
            >
                <Text style={styles.endSessionButtonText}>Lopeta harjoittelu</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#67645E',
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#D1F0FD',
        marginBottom: 30,
        textAlign: 'center',
    },

    statsContainer: {
        backgroundColor: '#5A5954',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        alignItems: 'center',
    },

    statsLabel: {
        fontSize: 16,
        color: '#D1F0FD',
        marginBottom: 5,
    },

    statsValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFB6C1',
    },

    categoriesContainer: {
        flex: 1,
        marginBottom: 20,
        maxHeight: 300,
    },

    categoriesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#D1F0FD',
        marginBottom: 10,
    },

    categoryItem: {
        backgroundColor: '#5A5954',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    categoryName: {
        fontSize: 16,
        color: '#D1F0FD',
        fontWeight: '600',
    },

    categoryCount: {
        fontSize: 14,
        color: '#FFB6C1',
    },

    startButton: {
        backgroundColor: '#4CAF50',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
    },

    startButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },

    progressContainer: {
        marginBottom: 20,
    },

    progressText: {
        color: '#D1F0FD',
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '600',
    },

    progressBar: {
        height: 8,
        backgroundColor: '#5A5954',
        borderRadius: 4,
        overflow: 'hidden',
    },

    progressFill: {
        height: '100%',
        backgroundColor: '#FFB6C1',
    },

    sessionStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        paddingHorizontal: 10,
    },

    statItem: {
        alignItems: 'center',
        backgroundColor: '#5A5954',
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
    },

    statLabel: {
        fontSize: 12,
        color: '#D1F0FD',
        marginBottom: 5,
    },

    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },

    correctColor: {
        color: '#4CAF50',
    },

    incorrectColor: {
        color: '#FF6B6B',
    },

    card: {
        flex: 1,
        backgroundColor: '#5A5954',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#D1F0FD',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },

    cardFlipped: {
        borderColor: '#FFB6C1',
    },

    cardLabel: {
        fontSize: 12,
        color: '#FFB6C1',
        marginBottom: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
    },

    cardText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#D1F0FD',
        textAlign: 'center',
        marginVertical: 15,
    },

    cardCategory: {
        fontSize: 12,
        color: '#D1F0FD',
        fontStyle: 'italic',
        marginTop: 10,
        opacity: 0.7,
    },

    flipHint: {
        fontSize: 11,
        color: '#D1F0FD',
        marginTop: 20,
        opacity: 0.6,
    },

    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 15,
    },

    responseButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },

    correctButton: {
        backgroundColor: '#4CAF50',
    },

    incorrectButton: {
        backgroundColor: '#FF6B6B',
    },

    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },

    endSessionButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderWidth: 2,
        borderColor: '#D1F0FD',
        borderRadius: 8,
        alignItems: 'center',
    },

    endSessionButtonText: {
        color: '#D1F0FD',
        fontSize: 14,
        fontWeight: '600',
    },

    resultContainer: {
        flex: 1,
        justifyContent: 'center',
        marginBottom: 30,
    },

    resultBox: {
        backgroundColor: '#5A5954',
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
        alignItems: 'center',
    },

    resultLabel: {
        fontSize: 16,
        color: '#D1F0FD',
        marginBottom: 10,
    },

    resultNumber: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#D1F0FD',
    },

    restartButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },

    restartButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },

    homeButton: {
        paddingVertical: 12,
        borderWidth: 2,
        borderColor: '#D1F0FD',
        borderRadius: 8,
        alignItems: 'center',
    },

    homeButtonText: {
        color: '#D1F0FD',
        fontSize: 14,
        fontWeight: '600',
    },
});
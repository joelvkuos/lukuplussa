import { useEffect, useState } from 'react';
import {
    SafeAreaView,
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

    // ALOITUS NÄKYMÄ
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

                {/* Jatka harjoittelua -painikki, näytetään vain jos on kesken oleva sessio */}
                {flashcards.hasOngoingSession && (
                    <>
                        <TouchableOpacity
                            style={styles.resumeButton}
                            onPress={flashcards.resumeSession}
                        >
                            <Text style={styles.resumeButtonText}>
                                Jatka harjoittelua ({flashcards.currentIndex + 1} / {flashcards.totalTerms})
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.ongoingStatsRow}>
                            <View style={styles.ongoingStatItem}>
                                <Text style={styles.ongoingStatLabel}>Oikein</Text>
                                <Text style={[styles.ongoingStatValue, styles.correctColor]}>
                                    {flashcards.correctCount}
                                </Text>
                            </View>
                            <View style={styles.ongoingStatItem}>
                                <Text style={styles.ongoingStatLabel}>Väärin</Text>
                                <Text style={[styles.ongoingStatValue, styles.incorrectColor]}>
                                    {flashcards.incorrectCount}
                                </Text>
                            </View>
                        </View>
                    </>
                )}

                <TouchableOpacity
                    style={styles.startButton}
                    onPress={flashcards.startSession}
                >
                    <Text style={styles.startButtonText}>
                        {flashcards.hasOngoingSession ? 'Aloita alusta' : 'Aloita harjoittelu'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    // VALMISTUMIS NÄKYMÄ
    if (flashcards.isSessionComplete) {
        const total = flashcards.correctCount + flashcards.incorrectCount;
        const percentage =
            total > 0
                ? Math.round((flashcards.correctCount / total) * 100)
                : 0;

        return (
            <SafeAreaView style={styles.container}>
                <ScrollView
                    style={styles.scrollContent}
                    contentContainerStyle={styles.resultScrollContainer}
                    showsVerticalScrollIndicator={true}
                >
                    <Text style={styles.title}>Harjoittelu valmis!</Text>

                    <View style={styles.resultContainerBox}>
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
                </ScrollView>
            </SafeAreaView>
        );
    }

    // HARJOITTELU-NÄKYMÄ
    return (
        <SafeAreaView style={styles.sessionContainer}>
            <ScrollView
                style={styles.scrollContent}
                contentContainerStyle={styles.scrollContentContainer}
                showsVerticalScrollIndicator={true}
            >
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
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#67645E',
    },

    // ALOITUS NÄKYMÄ
    startScrollContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#D1F0FD',
        marginBottom: 30,
        marginTop: 80,
        textAlign: 'center',
    },


    statsContainer: {
        backgroundColor: '#3d3c38',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#D1F0FD',
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
        color: '#D1F0FD',
    },

    categoriesContainer: {
        flex: 1,
        marginBottom: 20,
        maxHeight: 200,
    },

    categoriesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#D1F0FD',
        marginBottom: 10,
    },

    categoryItem: {
        backgroundColor: '#3d3c38',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1F0FD',
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
        color: '#D1F0FD',
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
    // Jatka harjoittelua painikki
    resumeButton: {
        backgroundColor: '#3d3c38',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#D1F0FD',
    },

    resumeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // Kesken olevan sessio tilastot
    ongoingStatsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 15,
    },

    ongoingStatItem: {
        flex: 1,
        backgroundColor: '#5A5954',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1F0FD',
    },

    ongoingStatLabel: {
        fontSize: 12,
        color: '#D1F0FD',
        marginBottom: 5,
    },

    ongoingStatValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },

    // HARJOITTELU-NÄKYMÄ

    sessionContainer: {
        flex: 1,
        backgroundColor: '#67645E',
    },

    scrollContent: {
        flex: 1,
    },

    scrollContentContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
    },

    progressContainer: {
        marginBottom: 20,
        marginTop: 80,
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
        backgroundColor: '#4CAF50',
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
        minHeight: 250,
    },

    cardFlipped: {
        borderColor: '#D1F0FD',
    },

    cardLabel: {
        fontSize: 12,
        color: '#D1F0FD',
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
        marginBottom: 20,
    },

    endSessionButtonText: {
        color: '#D1F0FD',
        fontSize: 14,
        fontWeight: '600',
    },

    // VALMISTUMIS NÄKYMÄ
    resultScrollContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
    },

    resultContainerBox: {
        marginBottom: 20,
        gap: 12,
    },

    resultBox: {
        backgroundColor: '#5A5954',
        padding: 20,
        borderRadius: 12,
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

    resultSummary: {
        backgroundColor: '#5A5954',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#FFB6C1',
    },

    summaryText: {
        fontSize: 16,
        color: '#D1F0FD',
        marginBottom: 10,
        lineHeight: 22,
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
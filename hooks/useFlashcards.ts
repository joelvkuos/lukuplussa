import { useCallback, useState } from 'react';

interface Term {
    id: string;
    term: string;
    category: string;
    definition: string;
}

interface FlashcardState {
    currentIndex: number;
    isFlipped: boolean;
    correctCount: number;
    incorrectCount: number;
    sessionTerms: Term[];
    isSessionActive: boolean;
}

export const useFlashcards = (allTerms: Term[]) => {
    const [state, setState] = useState<FlashcardState>({
        currentIndex: 0,
        isFlipped: false,
        correctCount: 0,
        incorrectCount: 0,
        sessionTerms: [],
        isSessionActive: false,
    });

    const startSession = useCallback(() => {
        const shuffled = [...allTerms].sort(() => Math.random() - 0.5);
        setState((prev) => ({
            ...prev,
            sessionTerms: shuffled,
            isSessionActive: true,
            currentIndex: 0,
            isFlipped: false,
            correctCount: 0,
            incorrectCount: 0,
        }));
    }, [allTerms]);

    const flipCard = useCallback(() => {
        setState((prev) => ({
            ...prev,
            isFlipped: !prev.isFlipped,
        }));
    }, []);

    const markCorrect = useCallback(() => {
        setState((prev) => ({
            ...prev,
            correctCount: prev.correctCount + 1,
            isFlipped: false,
            currentIndex: prev.currentIndex + 1,
        }));
    }, []);

    const markIncorrect = useCallback(() => {
        setState((prev) => ({
            ...prev,
            incorrectCount: prev.incorrectCount + 1,
            isFlipped: false,
            currentIndex: prev.currentIndex + 1,
        }));
    }, []);

    const endSession = useCallback(() => {
        setState((prev) => ({
            ...prev,
            isSessionActive: false,
        }));
    }, []);

    const isSessionComplete =
        state.isSessionActive &&
        state.currentIndex >= state.sessionTerms.length;

    const currentCard =
        state.sessionTerms.length > 0
            ? state.sessionTerms[state.currentIndex]
            : null;

    return {
        ...state,
        startSession,
        flipCard,
        markCorrect,
        markIncorrect,
        endSession,
        isSessionComplete,
        currentCard,
        progress:
            state.sessionTerms.length > 0
                ? ((state.currentIndex + 1) / state.sessionTerms.length) * 100
                : 0,
        totalTerms: state.sessionTerms.length,
    };
};
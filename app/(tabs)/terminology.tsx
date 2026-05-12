import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import termsData from '../../src/data/terms.json';

type Term = {
    id: string;
    term: string;
    category: string;
    definition: string;
    isUserAdded?: boolean;
};

export default function TerminologyScreen() {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [allTerms, setAllTerms] = useState<Term[]>(termsData);
    const [modalVisible, setModalVisible] = useState(false);
    const [newTerm, setNewTerm] = useState('');
    const [newDefinition, setNewDefinition] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        loadUserTerms();
        loadCategories();
    }, []);

    const loadUserTerms = async () => {
        try {
            const stored = await AsyncStorage.getItem('userTerms');
            if (stored) {
                const userTerms = JSON.parse(stored);
                setAllTerms([...termsData, ...userTerms]);
            }
        } catch (error) {
            console.error('Virhe termien lataamisessa:', error);
        }
    };

    const loadCategories = () => {
        const defaultCategories = Array.from(
            new Set(termsData.map((t) => t.category))
        ).sort();
        setCategories(defaultCategories);
    };

    const saveUserTerms = async (terms: Term[]) => {
        try {
            const userTerms = terms.filter((t) => t.isUserAdded);
            await AsyncStorage.setItem('userTerms', JSON.stringify(userTerms));
            loadCategories();
        } catch (error) {
            console.error('Virhe termien tallentamisessa:', error);
        }
    };

    const addOrEditTerm = async () => {
        if (!newTerm.trim() || !newDefinition.trim() || !newCategory.trim()) {
            Alert.alert('Virhe', 'Täytä kaikki kentät');
            return;
        }

        let updatedTerms;

        if (editingId) {
            updatedTerms = allTerms.map((t) =>
                t.id === editingId && t.isUserAdded
                    ? { ...t, term: newTerm, definition: newDefinition, category: newCategory }
                    : t
            );
            Alert.alert('Onnistui', 'Termi päivitetty');
        } else {
            const newId = Math.random().toString(36).substr(2, 9);
            updatedTerms = [
                ...allTerms,
                {
                    id: newId,
                    term: newTerm,
                    definition: newDefinition,
                    category: newCategory,
                    isUserAdded: true,
                },
            ];
            Alert.alert('Onnistui', 'Termi lisätty');
        }

        setAllTerms(updatedTerms);
        await saveUserTerms(updatedTerms);
        resetModal();
    };

    const deleteTerm = async (id: string) => {
        const term = allTerms.find((t) => t.id === id);
        if (!term?.isUserAdded) {
            Alert.alert('Virhe', 'Voit poistaa vain omia termejasi');
            return;
        }

        Alert.alert('Vahvista poistaminen', 'Haluatko poistaa tämän termin?', [
            { text: 'Peruuta' },
            {
                text: 'Poista',
                onPress: async () => {
                    const updatedTerms = allTerms.filter((t) => t.id !== id);
                    setAllTerms(updatedTerms);
                    await saveUserTerms(updatedTerms);
                },
            },
        ]);
    };

    const editTerm = (term: Term) => {
        if (!term.isUserAdded) {
            Alert.alert('Virhe', 'Voit muokata vain omia termejäsi');
            return;
        }
        setEditingId(term.id);
        setNewTerm(term.term);
        setNewDefinition(term.definition);
        setNewCategory(term.category);
        setModalVisible(true);
    };

    const resetModal = () => {
        setNewTerm('');
        setNewDefinition('');
        setNewCategory('');
        setEditingId(null);
        setModalVisible(false);
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const filteredTerms = allTerms.filter(
        (term) =>
            term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
            term.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
            term.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchInput}
                placeholder="Etsi termejä..."
                placeholderTextColor="#8B8980"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add-circle" size={24} color="#D1F0FD" />
                <Text style={styles.addButtonText}>Lisää uusi termi</Text>
            </TouchableOpacity>

            <FlatList
                data={filteredTerms}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 10, padding: 12 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.termCard,
                            item.isUserAdded && styles.userTermCard,
                        ]}
                        onPress={() => toggleExpand(item.id)}
                    >
                        <View style={styles.termHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.termTitle}>{item.term}</Text>
                                <Text style={styles.category}>{item.category}</Text>
                            </View>
                            {item.isUserAdded && (
                                <View style={styles.termActions}>
                                    <TouchableOpacity
                                        onPress={() => editTerm(item)}
                                        style={styles.actionButton}
                                    >
                                        <Ionicons name="pencil" size={18} color="#D1F0FD" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => deleteTerm(item.id)}
                                        style={styles.actionButton}
                                    >
                                        <Ionicons name="trash" size={18} color="#D1F0FD" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        {expandedId === item.id && (
                            <Text style={styles.termDefinition}>{item.definition}</Text>
                        )}
                    </TouchableOpacity>
                )}
            />

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={resetModal}
            >
                <View style={styles.modalContainer}>
                    <ScrollView style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={resetModal}
                        >
                            <Ionicons name="close" size={24} color="#D1F0FD" />
                        </TouchableOpacity>

                        <Text style={styles.modalTitle}>
                            {editingId ? 'Muokkaa termiä' : 'Lisää uusi termi'}
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Käsite"
                            placeholderTextColor="#8B8980"
                            value={newTerm}
                            onChangeText={setNewTerm}
                        />

                        <Text style={styles.pickerLabel}>Valitse kategoria:</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={newCategory}
                                onValueChange={(itemValue: string) => setNewCategory(itemValue)}
                                style={styles.picker}
                                itemStyle={styles.pickerItem}
                            >
                                <Picker.Item label="Valitse kategoria..." value="" />
                                {categories.map((category) => (
                                    <Picker.Item
                                        key={category}
                                        label={category}
                                        value={category}
                                    />
                                ))}
                            </Picker>
                        </View>

                        <TextInput
                            style={[styles.input, styles.definitionInput]}
                            placeholder="Määritelmä"
                            placeholderTextColor="#8B8980"
                            value={newDefinition}
                            onChangeText={setNewDefinition}
                            multiline={true}
                            numberOfLines={6}
                        />

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={addOrEditTerm}
                        >
                            <Text style={styles.submitButtonText}>
                                {editingId ? 'Päivitä termi' : 'Lisää termi'}
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#67645E',
    },
    searchInput: {
        backgroundColor: '#3d3c38',
        color: '#D1F0FD',
        padding: 12,
        margin: 12,
        marginTop: 80,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1F0FD',
        fontSize: 16,
    },
    addButton: {
        flexDirection: 'row',
        backgroundColor: '#3d3c38',
        margin: 12,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1F0FD',
    },
    addButtonText: {
        color: '#D1F0FD',
        marginLeft: 8,
        fontSize: 16,
        fontWeight: 'bold',
    },
    termCard: {
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1F0FD',
        backgroundColor: '#67645E',
    },
    userTermCard: {
        borderColor: '#FFD700',
        backgroundColor: '#3d3c38',
    },
    termHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    termTitle: {
        color: '#D1F0FD',
        fontSize: 18,
        fontWeight: 'bold',
    },
    category: {
        fontSize: 12,
        color: '#D1F0FD',
        backgroundColor: '#3d3c38',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    termDefinition: {
        fontSize: 16,
        color: '#D1F0FD',
        marginTop: 12,
        lineHeight: 20,
    },
    termActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#3d3c38',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '90%',
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#D1F0FD',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#67645E',
        color: '#D1F0FD',
        padding: 12,
        marginBottom: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1F0FD',
        fontSize: 16,
    },
    pickerLabel: {
        fontSize: 14,
        color: '#D1F0FD',
        marginBottom: 8,
        fontWeight: 'bold',
    },
    pickerContainer: {
        backgroundColor: '#67645E',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1F0FD',
        marginBottom: 12,
        overflow: 'hidden',
    },
    picker: {
        color: '#D1F0FD',
        backgroundColor: '#67645E',
    },
    pickerItem: {
        color: '#D1F0FD',
    },
    definitionInput: {
        textAlignVertical: 'top',
        minHeight: 100,
    },
    submitButton: {
        backgroundColor: '#D1F0FD',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: '#3d3c38',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
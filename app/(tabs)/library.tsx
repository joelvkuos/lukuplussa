import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type Book = {
    id: string;
    title: string;
    author: string;
    description?: string;
    photo: string;
    addedDate: string;
};

export default function LibraryScreen() {
    const [books, setBooks] = useState<Book[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [cameraVisible, setCameraVisible] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [newTitle, setNewTitle] = useState('');
    const [newAuthor, setNewAuthor] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [photo, setPhoto] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const cameraRef = useRef<any>(null);

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        try {
            const stored = await AsyncStorage.getItem('userBooks');
            if (stored) {
                setBooks(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Virhe kirjojen lataamisessa:', error);
        }
    };

    const saveBooks = async (updatedBooks: Book[]) => {
        try {
            await AsyncStorage.setItem('userBooks', JSON.stringify(updatedBooks));
            setBooks(updatedBooks);
        } catch (error) {
            console.error('Virhe kirjojen tallentamisessa:', error);
        }
    };

    const handleOpenCamera = async () => {
        if (!permission?.granted) {
            const result = await requestPermission();

            if (!result.granted) {
                Alert.alert('Virhe', 'Kamera-oikeuksia tarvitaan kuvan ottamiseen');
                return;
            }
        }

        setCameraReady(false);
        setCameraVisible(true);
    };

    const handleCloseCamera = () => {
        setCameraVisible(false);
        setCameraReady(false);
    };

    const takePicture = async () => {
        if (!cameraRef.current || !cameraReady) {
            return;
        }

        try {
            const capturedPhoto = await cameraRef.current.takePictureAsync({ base64: true });

            if (capturedPhoto.base64) {
                setPhoto(`data:image/jpg;base64,${capturedPhoto.base64}`);
            } else {
                setPhoto(capturedPhoto.uri);
            }

            setCameraVisible(false);
        } catch (error) {
            console.error('Virhe kuvan ottamisessa:', error);
        }
    };

    const addOrEditBook = async () => {
        if (!newTitle.trim() || !newAuthor.trim() || !photo) {
            Alert.alert('Virhe', 'Täytä otsikko, kirjoittaja ja ota kuva');
            return;
        }

        if (editingId) {
            // Muokkaa olemassa olevaa kirjaa
            const updatedBooks = books.map((book) =>
                book.id === editingId
                    ? {
                        ...book,
                        title: newTitle,
                        author: newAuthor,
                        description: newDescription,
                        photo: photo,
                    }
                    : book
            );
            await saveBooks(updatedBooks);
            Alert.alert('Onnistui', 'Kirja päivitetty');
        } else {
            // Lisää uusi kirja
            const newBook: Book = {
                id: Math.random().toString(36).substr(2, 9),
                title: newTitle,
                author: newAuthor,
                description: newDescription,
                photo: photo,
                addedDate: new Date().toLocaleDateString('fi-FI'),
            };

            const updatedBooks = [...books, newBook];
            await saveBooks(updatedBooks);
            Alert.alert('Onnistui', 'Kirja lisätty kirjastoon');
        }

        resetModal();
    };

    const editBook = (book: Book) => {
        setEditingId(book.id);
        setNewTitle(book.title);
        setNewAuthor(book.author);
        setNewDescription(book.description || '');
        setPhoto(book.photo);
        setModalVisible(true);
    };

    const deleteBook = (id: string) => {
        Alert.alert('Vahvista poistaminen', 'Haluatko poistaa tämän kirjan?', [
            { text: 'Peruuta' },
            {
                text: 'Poista',
                onPress: async () => {
                    const updatedBooks = books.filter((b) => b.id !== id);
                    await saveBooks(updatedBooks);
                },
            },
        ]);
    };

    const resetModal = () => {
        setNewTitle('');
        setNewAuthor('');
        setNewDescription('');
        setPhoto(null);
        setEditingId(null);
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add-circle" size={24} color="#D1F0FD" />
                <Text style={styles.addButtonText}>Lisää kirja</Text>
            </TouchableOpacity>

            {books.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="book-outline" size={48} color="#D1F0FD" />
                    <Text style={styles.emptyText}>Kirjastosi on vielä tyhjä</Text>
                    <Text style={styles.emptySubtext}>Lisää ensimmäinen kirja napsauttamalla painiketta ylhäällä</Text>
                </View>
            ) : (
                <FlatList
                    data={books}
                    keyExtractor={(item) => item.id}
                    numColumns={1}
                    contentContainerStyle={{ paddingBottom: 100, paddingTop: 10, padding: 8 }}
                    renderItem={({ item }) => (
                        <View style={styles.bookCard}>
                            <Image
                                source={{ uri: item.photo }}
                                style={styles.bookImage}
                            />
                            <View style={styles.bookInfo}>
                                <Text style={styles.bookTitle} numberOfLines={2}>
                                    {item.title}
                                </Text>
                                <Text style={styles.bookAuthor} numberOfLines={1}>
                                    {item.author}
                                </Text>
                                {item.description && (
                                    <Text style={styles.bookDescription} numberOfLines={2}>
                                        {item.description}
                                    </Text>
                                )}
                                <Text style={styles.bookDate}>{item.addedDate}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => editBook(item)}
                            >
                                <Ionicons name="pencil" size={18} color="#D1F0FD" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => deleteBook(item.id)}
                            >
                                <Ionicons name="trash" size={20} color="#D1F0FD" />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={cameraVisible ? handleCloseCamera : resetModal}
            >
                <View style={styles.modalContainer}>
                    {cameraVisible ? (
                        <View style={styles.cameraScreen}>
                            <CameraView
                                ref={cameraRef}
                                style={styles.camera}
                                facing="back"
                                onCameraReady={() => setCameraReady(true)}
                            />

                            <View style={styles.cameraControlsOverlay}>
                                <TouchableOpacity
                                    style={styles.cameraCancelButton}
                                    onPress={handleCloseCamera}
                                >
                                    <Ionicons name="close" size={28} color="#D1F0FD" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.cameraShutterButton}
                                    onPress={takePicture}
                                    disabled={!cameraReady}
                                >
                                    <Ionicons name="camera" size={32} color="#D1F0FD" />
                                </TouchableOpacity>
                                <View style={{ width: 50 }} />
                            </View>
                        </View>
                    ) : (
                        <ScrollView style={styles.modalContent}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={resetModal}
                            >
                                <Ionicons name="close" size={24} color="#D1F0FD" />
                            </TouchableOpacity>

                            <Text style={styles.modalTitle}>
                                {editingId ? 'Muokkaa kirjaa' : 'Lisää kirja kirjastoon'}
                            </Text>

                            {photo ? (
                                <View style={styles.photoPreview}>
                                    <Image source={{ uri: photo }} style={styles.previewImage} />
                                    <TouchableOpacity
                                        style={styles.retakeButton}
                                        onPress={handleOpenCamera}
                                    >
                                        <Ionicons name="camera" size={20} color="#D1F0FD" />
                                        <Text style={styles.retakeButtonText}>Ota uusi kuva</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.cameraButton}
                                    onPress={handleOpenCamera}
                                >
                                    <Ionicons name="camera" size={32} color="#D1F0FD" />
                                    <Text style={styles.cameraButtonText}>Ota kuva kirjasta</Text>
                                </TouchableOpacity>
                            )}

                            <TextInput
                                style={styles.input}
                                placeholder="Kirjan otsikko"
                                placeholderTextColor="#8B8980"
                                value={newTitle}
                                onChangeText={setNewTitle}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Kirjoittaja"
                                placeholderTextColor="#8B8980"
                                value={newAuthor}
                                onChangeText={setNewAuthor}
                            />
                            <TextInput
                                style={[styles.input, styles.descriptionInput]}
                                placeholder="Kuvaus (valinnainen)"
                                placeholderTextColor="#8B8980"
                                value={newDescription}
                                onChangeText={setNewDescription}
                                multiline={true}
                                numberOfLines={4}
                            />

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={addOrEditBook}
                            >
                                <Text style={styles.submitButtonText}>
                                    {editingId ? 'Tallenna muutokset' : 'Lisää kirja'}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    )}
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
    addButton: {
        flexDirection: 'row',
        backgroundColor: '#3d3c38',
        margin: 12,
        marginTop: 80,
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyText: {
        color: '#D1F0FD',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
    },
    emptySubtext: {
        color: '#8B8980',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    bookCard: {
        flex: 1,
        backgroundColor: '#3d3c38',
        borderRadius: 12,
        margin: 6,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#D1F0FD',
    },
    bookImage: {
        width: '100%',
        height: 150,
        backgroundColor: '#67645E',
    },
    bookInfo: {
        padding: 12,
    },
    bookTitle: {
        color: '#D1F0FD',
        fontSize: 14,
        fontWeight: 'bold',
    },
    bookAuthor: {
        color: '#8B8980',
        fontSize: 12,
        marginTop: 4,
    },
    bookDescription: {
        color: '#D1F0FD',
        fontSize: 11,
        marginTop: 4,
        lineHeight: 14,
    },
    bookDate: {
        color: '#8B8980',
        fontSize: 10,
        marginTop: 6,
    },
    editButton: {
        position: 'absolute',
        top: 8,
        right: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 8,
        borderRadius: 6,
    },
    deleteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 8,
        borderRadius: 6,
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
    photoPreview: {
        alignItems: 'center',
        marginBottom: 16,
    },
    previewImage: {
        width: 150,
        height: 200,
        borderRadius: 8,
        marginBottom: 8,
    },
    retakeButton: {
        flexDirection: 'row',
        backgroundColor: '#67645E',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1F0FD',
    },
    retakeButtonText: {
        color: '#D1F0FD',
        marginLeft: 8,
        fontWeight: 'bold',
    },
    cameraButton: {
        backgroundColor: '#67645E',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#D1F0FD',
    },
    cameraButtonText: {
        color: '#D1F0FD',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 8,
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
    descriptionInput: {
        textAlignVertical: 'top',
        minHeight: 80,
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
    camera: {
        flex: 1,
    },
    cameraScreen: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000000',
    },
    cameraControlsOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 40,
        flexDirection: 'row',
        paddingHorizontal: 20,
        zIndex: 10,
    },
    cameraCancelButton: {
        padding: 12,
    },
    cameraShutterButton: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 50,
    },
});
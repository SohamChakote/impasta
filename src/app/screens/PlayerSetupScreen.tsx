import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    BackHandler,
    Animated,
    Platform,
    Modal // <-- Imported Modal
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';

import { StorageHelper } from '../../backend/StorageHelper';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 10;

export default function PlayerSetupScreen() {
    const router = useRouter();
    const { categoryName } = useLocalSearchParams<{ categoryName?: string }>();
    const displayCategory = categoryName || "Selected Category";

    // 1. Entrance Animation
    const fadeAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    // 2. State Management
    const [players, setPlayers] = useState([
        { id: '1', name: '' },
        { id: '2', name: '' },
        { id: '3', name: '' }
    ]);
    const [numInput, setNumInput] = useState(MIN_PLAYERS.toString());

    // --- Modal State Management ---
    const [isLoadModalVisible, setIsLoadModalVisible] = useState(false);
    const [isDiscardModalVisible, setIsDiscardModalVisible] = useState(false);
    const [savedNamesToLoad, setSavedNamesToLoad] = useState<string[]>([]);
    const [validationMessage, setValidationMessage] = useState<string | null>(null);

    // --- Check for saved players on load ---
    useEffect(() => {
        const loadPreviousNames = async () => {
            const savedNames = await StorageHelper.loadPlayerNames();

            if (savedNames && savedNames.length > 0) {
                // Store the names in state and trigger our custom modal
                setSavedNamesToLoad(savedNames);
                setIsLoadModalVisible(true);
            }
        };

        loadPreviousNames();
    }, []);

    const handleConfirmLoad = () => {
        const loadedPlayers = savedNamesToLoad.map((name, index) => ({
            id: Math.random().toString() + index,
            name: name
        }));

        setPlayers(loadedPlayers);
        setNumInput(loadedPlayers.length.toString());
        setIsLoadModalVisible(false);
    };

    // 3. Hardware Back Interception
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                setIsDiscardModalVisible(true); // Trigger custom discard modal
                return true;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [])
    );

    // 4. Player Count Logic
    const updatePlayerArray = (newCount: number) => {
        setPlayers(prev => {
            if (newCount > prev.length) {
                const added = Array.from({ length: newCount - prev.length }, () => ({ id: Math.random().toString(), name: '' }));
                return [...prev, ...added];
            } else if (newCount < prev.length) {
                return prev.slice(0, newCount);
            }
            return prev;
        });
    };

    const handleCountValidation = (targetCount: number) => {
        if (isNaN(targetCount)) {
            setNumInput(players.length.toString());
            return;
        }
        if (targetCount < MIN_PLAYERS) {
            setValidationMessage(`You need at least ${MIN_PLAYERS} players to play.`);
            setNumInput(MIN_PLAYERS.toString());
            updatePlayerArray(MIN_PLAYERS);
            return;
        }
        if (targetCount > MAX_PLAYERS) {
            setValidationMessage(`Maximum of ${MAX_PLAYERS} players allowed for now.`);
            setNumInput(MAX_PLAYERS.toString());
            updatePlayerArray(MAX_PLAYERS);
            return;
        }
        setNumInput(targetCount.toString());
        updatePlayerArray(targetCount);
    };

    const onSubmitNumInput = () => handleCountValidation(parseInt(numInput, 10));
    const decrementPlayers = () => handleCountValidation(players.length - 1);
    const incrementPlayers = () => handleCountValidation(players.length + 1);

    // List Handlers
    const removePlayer = (idToRemove: string) => {
        if (players.length <= MIN_PLAYERS) {
            setValidationMessage(`You need at least ${MIN_PLAYERS} players.`);
            return;
        }
        const newPlayers = players.filter(p => p.id !== idToRemove);
        setPlayers(newPlayers);
        setNumInput(newPlayers.length.toString());
    };

    const updatePlayerName = (id: string, newName: string) => {
        setPlayers(players.map(p => p.id === id ? { ...p, name: newName } : p));
    };

    // --- Save names to disk when starting game ---
    const handleStartGame = async () => {
        const emptyFields = players.some(p => p.name.trim() === '');
        if (emptyFields) {
            setValidationMessage('Please fill in the names of all the players.');
            return;
        }
        const rawNames = players.map(p => p.name.trim());

        await StorageHelper.savePlayerNames(rawNames);

        router.push({
            pathname: "/screens/PlayerTurnScreen",
            params: { categoryName: displayCategory, playerNamesParam: JSON.stringify(rawNames) }
        });
    };

    const themeColors = {
        background: '#F6FFDC',
        text: '#1E293B',
        subText: '#64748B',
        playerRowBg: '#CFECF3',
        primaryButton: '#F9B2D7', // Pink (Negative/Warning)
        positiveButton: '#BEE8C1', // Mint Green (Positive/Safe)
        addButton: '#DAF9DE',
        removeText: '#1E293B',
    };

    return (
        <Animated.View style={[styles.mainContainer, { backgroundColor: themeColors.background, opacity: fadeAnim }]}>
            <View style={[styles.categoryHeader, { borderBottomColor: themeColors.text }]}>
                <Text style={[styles.categoryLabel, { color: themeColors.subText }]}>PLAYING CATEGORY</Text>
                <Text style={[styles.categoryTitle, { color: themeColors.text }]}>{displayCategory}</Text>
            </View>

            <View style={styles.countControlRow}>
                <Text style={[styles.label, { color: themeColors.text }]}>Number of Players:</Text>

                <View style={[styles.numberSelector, { backgroundColor: themeColors.addButton }]}>
                    <TouchableOpacity onPress={decrementPlayers} style={styles.arrowButton}>
                        <Text style={[styles.arrowText, { color: themeColors.text }]}>{"<"}</Text>
                    </TouchableOpacity>

                    <TextInput
                        style={[styles.numberInput, { color: themeColors.text, backgroundColor: themeColors.addButton }]}
                        keyboardType="numeric"
                        value={numInput}
                        onChangeText={setNumInput}
                        onEndEditing={onSubmitNumInput}
                        maxLength={2}
                    />

                    <TouchableOpacity onPress={incrementPlayers} style={styles.arrowButton}>
                        <Text style={[styles.arrowText, { color: themeColors.text }]}>{">"}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
                {players.map((player) => (
                    <View key={player.id} style={styles.playerRowContainer}>
                        <Text style={[styles.dragHandleOut, { color: themeColors.text }]}>=</Text>
                        <View style={[
                            styles.inputBox,
                            { backgroundColor: themeColors.playerRowBg },
                            player.name.trim() === '' && {
                                borderWidth: 2,
                                borderColor: themeColors.primaryButton
                            }
                        ]}>
                            <TextInput
                                style={[styles.nameInput, { color: themeColors.text }]}
                                placeholder="Enter name"
                                placeholderTextColor={themeColors.subText}
                                value={player.name}
                                onChangeText={(text) => updatePlayerName(player.id, text)}
                                editable={true}
                            />
                        </View>
                        <TouchableOpacity onPress={() => removePlayer(player.id)} style={styles.removeButtonOut}>
                            <Text style={[styles.removeTextOut, { color: themeColors.removeText }]}>X</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                <TouchableOpacity style={[styles.addButton, { backgroundColor: themeColors.addButton }]} onPress={incrementPlayers}>
                    <Text style={[styles.addText, { color: themeColors.text }]}>+</Text>
                </TouchableOpacity>
            </ScrollView>

            <View style={styles.bottomButtonContainer}>
                <TouchableOpacity
                    style={[styles.startGameButton, { backgroundColor: themeColors.primaryButton }]}
                    onPress={handleStartGame}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.startGameText, { color: themeColors.text }]}>START GAME</Text>
                </TouchableOpacity>
            </View>

            {/* Modal 1: Load Previous Names */}
            <Modal transparent={true} animationType="fade" visible={isLoadModalVisible} onRequestClose={() => setIsLoadModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: themeColors.background }]}>
                        <Text style={[styles.modalTitle, { color: themeColors.text }]}>Load Previous Players?</Text>
                        <Text style={[styles.modalMessage, { color: themeColors.text }]}>
                            We found a saved list of players from your last game. Do you want to use it?
                        </Text>

                        <View style={styles.modalButtonRow}>
                            {/* Negative Action (Left - Pink) */}
                            <TouchableOpacity
                                style={[styles.modalActionBtn, { backgroundColor: themeColors.primaryButton }]}
                                onPress={() => setIsLoadModalVisible(false)}
                            >
                                <Text style={[styles.modalBtnText, { color: themeColors.text }]}>Start Fresh</Text>
                            </TouchableOpacity>

                            {/* Positive Action (Right - Green) */}
                            <TouchableOpacity
                                style={[styles.modalActionBtn, { backgroundColor: themeColors.positiveButton }]}
                                onPress={handleConfirmLoad}
                            >
                                <Text style={[styles.modalBtnText, { color: themeColors.text }]}>Load</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal 2: Discard Changes (Back Button) */}
            <Modal transparent={true} animationType="fade" visible={isDiscardModalVisible} onRequestClose={() => setIsDiscardModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: themeColors.background }]}>
                        <Text style={[styles.modalTitle, { color: themeColors.text }]}>Discard Changes?</Text>
                        <Text style={[styles.modalMessage, { color: themeColors.text }]}>
                            Are you sure you want to go back? Any changes to the player list will be lost.
                        </Text>

                        <View style={styles.modalButtonRow}>
                            {/* Negative Action (Left - Pink) */}
                            <TouchableOpacity
                                style={[styles.modalActionBtn, { backgroundColor: themeColors.primaryButton }]}
                                onPress={() => {
                                    setIsDiscardModalVisible(false);
                                    router.back();
                                }}
                            >
                                <Text style={[styles.modalBtnText, { color: themeColors.text }]}>Discard</Text>
                            </TouchableOpacity>

                            {/* Positive Action (Right - Green) */}
                            <TouchableOpacity
                                style={[styles.modalActionBtn, { backgroundColor: themeColors.positiveButton }]}
                                onPress={() => setIsDiscardModalVisible(false)}
                            >
                                <Text style={[styles.modalBtnText, { color: themeColors.text }]}>Stay</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal 3: Validation Alerts (Replacing standard alerts for a 100% themed app) */}
            <Modal transparent={true} animationType="fade" visible={validationMessage !== null} onRequestClose={() => setValidationMessage(null)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: themeColors.background }]}>
                        <Text style={[styles.modalTitle, { color: themeColors.text }]}>Hold Up!</Text>
                        <Text style={[styles.modalMessage, { color: themeColors.text }]}>
                            {validationMessage}
                        </Text>

                        <View style={styles.modalButtonRow}>
                            {/* Just one acknowledgement button for warnings */}
                            <TouchableOpacity
                                style={[styles.modalActionBtn, { backgroundColor: themeColors.positiveButton }]}
                                onPress={() => setValidationMessage(null)}
                            >
                                <Text style={[styles.modalBtnText, { color: themeColors.text }]}>Got it</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 24,
    },
    categoryHeader: {
        alignItems: 'center',
        paddingBottom: 20,
        borderBottomWidth: 3,
        marginBottom: 24,
    },
    categoryLabel: {
        fontSize: 14,
        letterSpacing: 1.5,
        marginBottom: 4,
        fontFamily: 'Iosevka-Charon-Medium',
    },
    categoryTitle: {
        fontSize: 28,
        textTransform: 'uppercase',
        fontFamily: 'Iosevka-Charon-Bold',
        textAlign: 'center',
    },
    countControlRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 24,
    },
    label: {
        fontSize: 18,
        fontFamily: 'Iosevka-Charon-Bold',
    },
    numberSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: undefined,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    arrowButton: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
    },
    arrowText: {
        fontSize: 18,
        fontFamily: 'Iosevka-Charon-Bold',
    },
    numberInput: {
        fontSize: 18,
        fontFamily: 'Iosevka-Charon-Bold',
        textAlign: 'center',
        minWidth: 32,
    },
    listContainer: {
        flex: 1,
    },
    playerRowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    dragHandleOut: {
        fontSize: 24,
        paddingRight: 12,
        fontFamily: 'Iosevka-Charon-Medium',
    },
    inputBox: {
        flex: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 0,
    },
    nameInput: {
        fontSize: 16,
        paddingVertical: 12,
        fontFamily: 'Iosevka-Charon-Medium',
        outlineWidth: 0,
    },
    removeButtonOut: {
        paddingLeft: 14,
        paddingRight: 4,
    },
    removeTextOut: {
        fontSize: 20,
        fontFamily: 'Iosevka-Charon-Bold',
    },
    addButton: {
        alignSelf: 'center',
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    addText: {
        fontSize: 28,
        color: 'white',
        lineHeight: 32,
    },
    bottomButtonContainer: {
        paddingVertical: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 30,
        backgroundColor: 'transparent',
    },
    startGameButton: {
        alignSelf: 'stretch',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
    },
    startGameText: {
        fontSize: 18,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontFamily: 'Iosevka-Charon-Bold',
    },
    // --- Modal Styles ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 24,
        fontFamily: 'Iosevka-Charon-Bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 16,
        fontFamily: 'Iosevka-Charon-Medium',
        textAlign: 'center',
        marginBottom: 24,
    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 12,
    },
    modalActionBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalBtnText: {
        fontSize: 16,
        fontFamily: 'Iosevka-Charon-Bold',
        textTransform: 'uppercase',
        textAlign: 'center',
    }
});
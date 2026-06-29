import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    useColorScheme,
    BackHandler,
    Alert
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 10;

export default function PlayerSetupScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { categoryName } = useLocalSearchParams<{ categoryName?: string }>();
    const displayCategory = categoryName || "Selected Category";

    const [players, setPlayers] = useState([
        { id: '1', name: '' },
        { id: '2', name: '' },
        { id: '3', name: '' }
    ]);

    const [inputValue, setInputValue] = useState(MIN_PLAYERS.toString());
    const [errorMessage, setErrorMessage] = useState('');
    const [isPhaseTwo, setIsPhaseTwo] = useState(false);

    // --- INTERCEPT BACK BUTTON ---
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                Alert.alert(
                    'Discard Changes?',
                    'Are you sure you want to discard any changes?',
                    [
                        { text: 'Cancel', style: 'cancel', onPress: () => {} },
                        { text: 'Yes', style: 'destructive', onPress: () => router.back() },
                    ]
                );
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [router])
    );

    // --- PHASE 1 LOGIC: Validate and Transition ---
    const handleConfirmNumber = () => {
        const newCount = parseInt(inputValue, 10);

        if (isNaN(newCount)) {
            setErrorMessage('Please enter a valid number.');
            return;
        }
        if (newCount < MIN_PLAYERS) {
            setErrorMessage(`You need at least ${MIN_PLAYERS} players to play.`);
            return;
        }
        if (newCount > MAX_PLAYERS) {
            setErrorMessage(`Maximum of ${MAX_PLAYERS} players allowed for now.`);
            return;
        }

        setErrorMessage('');
        const currentCount = players.length;

        if (newCount > currentCount) {
            const additionalPlayers = [];
            for (let i = 0; i < newCount - currentCount; i++) {
                additionalPlayers.push({ id: Math.random().toString(), name: '' });
            }
            setPlayers([...players, ...additionalPlayers]);
        } else if (newCount < currentCount) {
            setPlayers(players.slice(0, newCount));
        }

        setIsPhaseTwo(true);
    };

    // --- PHASE 2 LOGIC: Go back to edit ---
    const handleEditNumber = () => {
        setIsPhaseTwo(false);
    };

    // --- LIST LOGIC (Only active in Phase 2) ---
    const addPlayer = () => {
        if (players.length >= MAX_PLAYERS) return;
        const newPlayers = [...players, { id: Math.random().toString(), name: '' }];
        setPlayers(newPlayers);
        setInputValue(newPlayers.length.toString());
    };

    const removePlayer = (idToRemove: string) => {
        if (players.length <= MIN_PLAYERS) return;
        const newPlayers = players.filter(player => player.id !== idToRemove);
        setPlayers(newPlayers);
        setInputValue(newPlayers.length.toString());
    };

    const updatePlayerName = (id: string, newName: string) => {
        setPlayers(players.map(player =>
            player.id === id ? { ...player, name: newName } : player
        ));
    };

    // --- START GAME ROUTING & HANDOFF ---
    const handleStartGame = () => {
        // 1. Extract just the raw string names.
        // We add a fallback just in case a user left a box blank so the game doesn't crash.
        const rawNames = players.map(p => p.name.trim() !== '' ? p.name.trim() : 'Unnamed Player');

        // 2. Push to the Turn Screen, stringifying the array so the router accepts it safely
        router.push({
            pathname: "/screens/PlayerTurnScreen",
            params: {
                categoryName: displayCategory,
                playerNamesParam: JSON.stringify(rawNames)
            }
        });
    };

    // --- THEME COLORS ---
    const themeColors = {
        background: isDark ? '#121212' : '#F9FAFB',
        text: isDark ? '#FFFFFF' : '#111827',
        inputBackground: isDark ? '#1E1E1E' : '#E5E7EB',
        subText: isDark ? '#9CA3AF' : '#6B7280',
        primaryButton: isDark ? '#3B82F6' : '#2563EB',
    };

    return (
        <View style={[styles.mainContainer, { backgroundColor: themeColors.background }]}>

            {/* Top Category Header */}
            <View style={styles.categoryHeader}>
                <Text style={[styles.categoryLabel, { color: themeColors.subText }]}>PLAYING CATEGORY</Text>
                <Text style={[styles.categoryTitle, { color: themeColors.text }]}>{displayCategory}</Text>
            </View>

            {/* PHASE 1: Centered Number Selection */}
            {!isPhaseTwo && (
                <View style={styles.phaseOneContainer}>
                    <Text style={[styles.label, { color: themeColors.text, marginBottom: 15 }]}>
                        Number of Players ({MIN_PLAYERS}-{MAX_PLAYERS}):
                    </Text>

                    <View style={styles.inputRow}>
                        <TextInput
                            style={[styles.largeNumberInput, { backgroundColor: themeColors.inputBackground, color: themeColors.text }]}
                            keyboardType="numeric"
                            value={inputValue}
                            onChangeText={setInputValue}
                            maxLength={2}
                            autoFocus={true}
                        />
                        <TouchableOpacity style={styles.checkButton} onPress={handleConfirmNumber}>
                            <Text style={styles.checkText}>✓</Text>
                        </TouchableOpacity>
                    </View>

                    {errorMessage !== '' && (
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    )}
                </View>
            )}

            {/* PHASE 2: Top Header & Player List */}
            {isPhaseTwo && (
                <>
                    <View style={styles.topHeader}>
                        <Text style={[styles.label, { color: themeColors.text }]}>Number of Players:</Text>
                        <TouchableOpacity onPress={handleEditNumber}>
                            <View style={[styles.smallNumberDisplay, { backgroundColor: themeColors.inputBackground }]}>
                                <Text style={[styles.smallNumberText, { color: themeColors.text }]}>
                                    {players.length}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.listContainer} contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
                        {players.map((player) => (
                            <View key={player.id} style={styles.row}>
                                <Text style={[styles.dragHandle, { color: themeColors.text }]}>=</Text>

                                <TextInput
                                    style={[styles.nameInput, { backgroundColor: themeColors.inputBackground, color: themeColors.text }]}
                                    placeholder="Enter name"
                                    placeholderTextColor={themeColors.subText}
                                    value={player.name}
                                    onChangeText={(text) => updatePlayerName(player.id, text)}
                                />

                                <TouchableOpacity
                                    onPress={() => removePlayer(player.id)}
                                    disabled={players.length <= MIN_PLAYERS}
                                    style={[styles.removeButton, players.length <= MIN_PLAYERS && { opacity: 0.2 }]}
                                >
                                    <Text style={[styles.removeText, { color: themeColors.text }]}>X</Text>
                                </TouchableOpacity>
                            </View>
                        ))}

                        <TouchableOpacity
                            style={[styles.addButton, players.length >= MAX_PLAYERS && { opacity: 0.5 }]}
                            onPress={addPlayer}
                            disabled={players.length >= MAX_PLAYERS}
                        >
                            <Text style={styles.addText}>+</Text>
                        </TouchableOpacity>

                        {/* START GAME BUTTON */}
                        <TouchableOpacity
                            style={[styles.startGameButton, { backgroundColor: themeColors.primaryButton }]}
                            onPress={handleStartGame}
                        >
                            <Text style={styles.startGameText}>Start Game</Text>
                        </TouchableOpacity>

                    </ScrollView>
                </>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        paddingTop: 60,
    },
    categoryHeader: {
        alignItems: 'center',
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(150, 150, 150, 0.2)',
        marginBottom: 20,
    },
    categoryLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    categoryTitle: {
        fontSize: 28,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    phaseOneContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginTop: -80,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    largeNumberInput: {
        fontSize: 32,
        fontWeight: 'bold',
        paddingHorizontal: 25,
        paddingVertical: 15,
        borderRadius: 12,
        textAlign: 'center',
        minWidth: 90,
    },
    checkButton: {
        backgroundColor: '#4CAF50',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkText: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#ff4444',
        fontSize: 16,
        marginTop: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 20,
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
    },
    smallNumberDisplay: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: 50,
        alignItems: 'center',
    },
    smallNumberText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 15,
    },
    dragHandle: {
        fontSize: 24,
        fontWeight: 'bold',
        paddingHorizontal: 5,
    },
    nameInput: {
        flex: 1,
        fontSize: 16,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
    },
    removeButton: {
        padding: 10,
    },
    removeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'red',
    },
    addButton: {
        alignSelf: 'center',
        backgroundColor: '#4CAF50',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        marginBottom: 30,
    },
    addText: {
        fontSize: 30,
        color: 'white',
        fontWeight: 'bold',
    },
    startGameButton: {
        paddingVertical: 18,
        borderRadius: 999,
        alignItems: 'center',
        marginHorizontal: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    startGameText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});
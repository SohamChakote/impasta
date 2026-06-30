import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    BackHandler,
    Alert,
    Animated,
    Platform
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';

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

    // 3. Hardware Back Interception
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
            Alert.alert('Hold up!', `You need at least ${MIN_PLAYERS} players to play.`);
            setNumInput(MIN_PLAYERS.toString());
            updatePlayerArray(MIN_PLAYERS);
            return;
        }
        if (targetCount > MAX_PLAYERS) {
            Alert.alert('Hold up!', `Maximum of ${MAX_PLAYERS} players allowed for now.`);
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
            Alert.alert('Hold up!', `You need at least ${MIN_PLAYERS} players.`);
            return;
        }
        const newPlayers = players.filter(p => p.id !== idToRemove);
        setPlayers(newPlayers);
        setNumInput(newPlayers.length.toString());
    };

    const updatePlayerName = (id: string, newName: string) => {
        setPlayers(players.map(p => p.id === id ? { ...p, name: newName } : p));
    };

    const handleStartGame = () => {
        const emptyFields = players.some(p => p.name.trim() === '');
        if (emptyFields) {
            Alert.alert('Hold up!', 'Please fill in the names of all the players');
            return;
        }
        const rawNames = players.map(p => p.name.trim());
        router.push({
            pathname: "/screens/PlayerTurnScreen",
            params: { categoryName: displayCategory, playerNamesParam: JSON.stringify(rawNames) }
        });
    };

    // Hardcoded Figma Palette
    const themeColors = {
        background: '#F6FFDC', // Light Mint/Yellow
        text: '#1E293B',
        subText: '#64748B',
        playerRowBg: '#CFECF3', // The specific blue you requested for the forms
        primaryButton: '#F9B2D7',
        addButton: '#DAF9DE',
        removeText: '#1E293B', // Dark slate instead of red
    };

    return (
        <Animated.View style={[styles.mainContainer, { backgroundColor: themeColors.background, opacity: fadeAnim }]}>

            {/* Top Category Header */}
            <View style={[styles.categoryHeader, { borderBottomColor: themeColors.text }]}>
                <Text style={[styles.categoryLabel, { color: themeColors.subText }]}>PLAYING CATEGORY</Text>
                <Text style={[styles.categoryTitle, { color: themeColors.text }]}>{displayCategory}</Text>
            </View>

            {/* Interactive Player Count Row (Now Centered & Closer) */}
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

            {/* Scrollable Player List */}
            <ScrollView
                style={styles.listContainer}
                showsVerticalScrollIndicator={false}
            >
                {players.map((player) => (
                    <View key={player.id} style={styles.playerRowContainer}>
                        {/* Hamburger outside the box */}
                        <Text style={[styles.dragHandleOut, { color: themeColors.text }]}>=</Text>

                        {/* The actual name input box */}
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

                        {/* Cross outside the box */}
                        <TouchableOpacity
                            onPress={() => removePlayer(player.id)}
                            style={styles.removeButtonOut}
                        >
                            <Text style={[styles.removeTextOut, { color: themeColors.removeText }]}>X</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                {/* Big Green Plus Sign below the list */}
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: themeColors.addButton }]}
                    onPress={incrementPlayers}
                >
                    <Text style={[styles.addText, { color: themeColors.text }]}>+</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Anchored Start Game Button */}
            <View style={styles.bottomButtonContainer}>
                <TouchableOpacity
                    style={[styles.startGameButton, { backgroundColor: themeColors.primaryButton }]}
                    onPress={handleStartGame}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.startGameText, { color: themeColors.text }]}>START GAME</Text>
                </TouchableOpacity>
            </View>

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
        borderBottomWidth: 3, // Thicker line
        marginBottom: 24,
    },
    categoryLabel: {
        fontSize: 14, // Increased size
        letterSpacing: 1.5,
        marginBottom: 4,
        fontFamily: 'Iosevka-Charon-Medium',
    },
    categoryTitle: {
        fontSize: 28,
        textTransform: 'uppercase',
        fontFamily: 'Iosevka-Charon-Bold',
    },
    countControlRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Centers everything together
        gap: 16, // Snugs the text and the counter close
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
        minWidth: 32, // Reduced from 40 for a tighter fit
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
    }
});
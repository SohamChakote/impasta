import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    PanResponder,
    TouchableOpacity,
    useColorScheme,
    Animated,
    BackHandler,
    Alert
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { PlayerList } from "@/backend/PlayerList";

const CARD_SIZE = 260;
const GRID_ROWS = 8;
const GRID_COLS = 8;
const TILE_SIZE = CARD_SIZE / GRID_COLS;

export default function PlayerTurnScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // --- INTERCEPT BACK BUTTON ---
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                Alert.alert(
                    'Quit Game?',
                    'Are you sure you want to quit the game? Your current game progress will be lost.',
                    [
                        { text: 'Cancel', style: 'cancel', onPress: () => {} },
                        { text: 'Yes', style: 'destructive', onPress: () => router.back() },
                    ]
                );
                return true; // Prevents default back action
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [router])
    );

    // 1. Grab data passed from the Setup Screen
    const { categoryName, playerNamesParam } = useLocalSearchParams<{
        categoryName: string;
        playerNamesParam: string;
    }>();

    // 2. Initialize the Backend SYNCHRONOUSLY
    const gameBackend = useMemo(() => {
        const safeCategory = categoryName || "Random";
        const namesString = Array.isArray(playerNamesParam) ? playerNamesParam[0] : playerNamesParam;
        const safeNames = namesString ? JSON.parse(namesString) : ["Player 1", "Player 2", "Player 3"];

        const backend = new PlayerList(safeCategory);
        backend.addPlayers(safeNames);
        backend.assignImposter();
        return backend;
    }, [categoryName, playerNamesParam]);

    const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
    const activePlayer = gameBackend.players[currentPlayerIdx];

    // 3. Scratch Card State
    const [scratchedTiles, setScratchedTiles] = useState<Set<number>>(new Set());
    const isScratched = scratchedTiles.size > 0;

    // --- ANIMATION LOGIC ---
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isScratched) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.06,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.stopAnimation();
            pulseAnim.setValue(1);
        }
    }, [isScratched, pulseAnim]);

    // Touch Tracker
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => handleScratch(evt.nativeEvent),
            onPanResponderMove: (evt) => handleScratch(evt.nativeEvent),
        })
    ).current;

    const handleScratch = (nativeEvent: any) => {
        const { locationX, locationY } = nativeEvent;

        if (locationX >= 0 && locationX <= CARD_SIZE && locationY >= 0 && locationY <= CARD_SIZE) {
            const col = Math.floor(locationX / TILE_SIZE);
            const row = Math.floor(locationY / TILE_SIZE);
            const index = row * GRID_COLS + col;

            setScratchedTiles((prev) => {
                if (!prev.has(index)) {
                    const newSet = new Set(prev);
                    newSet.add(index);
                    return newSet;
                }
                return prev;
            });
        }
    };

    // 4. Moving to the Next Player
    const handleNextPlayer = () => {
        if (currentPlayerIdx < gameBackend.numPlayers - 1) {
            setCurrentPlayerIdx(currentPlayerIdx + 1);
            setScratchedTiles(new Set());
        } else {
            router.push('/screens/RevealScreen');
        }
    };

    // Theme Colors
    const theme = {
        background: isDark ? '#121212' : '#F9FAFB',
        text: isDark ? '#FFFFFF' : '#111827',
        subText: isDark ? '#9CA3AF' : '#6B7280',
        cardHidden: isDark ? '#374151' : '#D1D5DB',
        cardRevealed: isDark ? '#1F2937' : '#FFFFFF',
        primaryButton: isDark ? '#3B82F6' : '#2563EB',
    };

    if (!activePlayer) return null;

    // Dummy data for now
    const DUMMY_WORD = "Apple";
    const DUMMY_HINT = "It's a red fruit";

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>

            {/* Top Prompt Text */}
            <View style={styles.promptContainer}>
                <Text style={[styles.smallText, { color: theme.subText }]}>If you are</Text>
                <Text style={[styles.largeText, { color: theme.text }]}>{activePlayer.name}</Text>
                <Text style={[styles.smallText, { color: theme.subText }]}>then scratch the card:</Text>
            </View>

            {/* The Scratch Card */}
            <View style={[styles.cardContainer, { backgroundColor: theme.cardRevealed }]}>

                <View style={styles.secretDataContainer}>
                    {activePlayer.isImposter ? (
                        <>
                            <Text style={[styles.secretSmall, { color: theme.subText }]}>
                                You are the imposter. Your hint is:
                            </Text>
                            <Text style={[styles.secretLarge, { color: theme.text }]}>
                                {DUMMY_HINT}
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text style={[styles.secretSmall, { color: theme.subText }]}>
                                The word is
                            </Text>
                            <Text style={[styles.secretLarge, { color: theme.text }]}>
                                {DUMMY_WORD}
                            </Text>
                        </>
                    )}
                </View>

                <View style={styles.tileGrid}>
                    {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, i) => (
                        <View
                            key={i}
                            style={[
                                {
                                    backgroundColor: theme.cardHidden,
                                    width: TILE_SIZE,
                                    height: TILE_SIZE,
                                    opacity: scratchedTiles.has(i) ? 0 : 1,
                                },
                            ]}
                        />
                    ))}
                    <Text style={[styles.scratchText, { opacity: isScratched ? 0 : 1 }]}>
                        SCRATCH TO REVEAL
                    </Text>
                </View>

                <View style={styles.touchOverlay} {...panResponder.panHandlers} />
            </View>

            {/* Pulsating Next Player Button */}
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                    style={[styles.nextButton, { backgroundColor: theme.primaryButton }]}
                    onPress={handleNextPlayer}
                >
                    <Text style={styles.nextButtonText}>
                        {currentPlayerIdx < gameBackend.numPlayers - 1
                            ? "Pass the phone to next player"
                            : "Proceed to Game"}
                    </Text>
                </TouchableOpacity>
            </Animated.View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    promptContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    smallText: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 5,
        marginTop: 5,
    },
    largeText: {
        fontSize: 42,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    cardContainer: {
        width: CARD_SIZE,
        height: CARD_SIZE,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 8,
        marginBottom: 50,
    },
    secretDataContainer: {
        ...StyleSheet.absoluteFill,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    secretSmall: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 10,
    },
    secretLarge: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tileGrid: {
        ...StyleSheet.absoluteFill,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scratchText: {
        position: 'absolute',
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 2,
        textTransform: 'uppercase',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    touchOverlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'transparent',
    },
    nextButton: {
        paddingVertical: 18,
        paddingHorizontal: 30,
        borderRadius: 999,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    }
});
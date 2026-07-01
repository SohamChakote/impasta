import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    PanResponder,
    TouchableOpacity,
    Animated,
    BackHandler,
    Modal, // <-- Imported for themed pop-ups
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { PlayerList } from "@/backend/PlayerList";
import { CategoryHelper } from "@/backend/CategoryHelper";

const CARD_SIZE = 260;
const GRID_ROWS = 8;
const GRID_COLS = 8;
const TILE_SIZE = CARD_SIZE / GRID_COLS;

export default function PlayerTurnScreen() {
    const router = useRouter();

    // --- State for our custom Quit Modal ---
    const [isQuitModalVisible, setIsQuitModalVisible] = useState(false);

    // --- INTERCEPT BACK BUTTON ---
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                setIsQuitModalVisible(true);
                return true;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [])
    );

    const { categoryName, playerNamesParam } = useLocalSearchParams<{
        categoryName: string;
        playerNamesParam: string;
    }>();

    const { gameBackend, secretWord, secretHint } = useMemo(() => {
        const safeCategory = categoryName || "Random";
        const namesString = Array.isArray(playerNamesParam) ? playerNamesParam[0] : playerNamesParam;
        const safeNames = namesString ? JSON.parse(namesString) : ["Player 1", "Player 2", "Player 3"];

        const backend = new PlayerList(safeCategory);
        backend.addPlayers(safeNames);
        backend.assignImposter();

        const catHelper = new CategoryHelper(safeCategory.toLowerCase());
        const { word, hint } = catHelper.getRandomWordAndHint();

        return { gameBackend: backend, secretWord: word, secretHint: hint };
    }, [categoryName, playerNamesParam]);

    const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
    const activePlayer = gameBackend.players[currentPlayerIdx];

    const [scratchedTiles, setScratchedTiles] = useState<Set<number>>(new Set());
    const isScratched = scratchedTiles.size > 0;

    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isScratched) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.06, duration: 600, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
                ])
            ).start();
        } else {
            pulseAnim.stopAnimation();
            pulseAnim.setValue(1);
        }
    }, [isScratched, pulseAnim]);

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
            setScratchedTiles((prev) => new Set(prev).add(index));
        }
    };

    const handleNextPlayer = () => {
        if (currentPlayerIdx < gameBackend.numPlayers - 1) {
            setCurrentPlayerIdx(currentPlayerIdx + 1);
            setScratchedTiles(new Set());
        } else {
            const imposter = gameBackend.getImposter();
            router.push({
                pathname: '/screens/RevealScreen',
                params: { imposterName: imposter }
            });
        }
    };

    const theme = {
        background: '#F6FFDC',
        text: '#1E293B',
        subText: '#1E293B',
        cardHidden: '#CFECF3',
        cardRevealed: '#DAF9DE',
        primaryButton: '#F9B2D7', // Pink (Negative/Quit)
        positiveButton: '#BEE8C1', // Mint (Stay)
    };

    if (!activePlayer) return null;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.promptContainer}>
                <Text style={[styles.smallText, { color: theme.subText, opacity: 0.8 }]}>If you are</Text>
                <Text style={[styles.largeText, { color: theme.text }]}>{activePlayer.name}</Text>
                <Text style={[styles.smallText, { color: theme.subText, opacity: 0.8 }]}>then scratch the card:</Text>
            </View>

            <View style={[styles.cardContainer, { backgroundColor: theme.cardRevealed }]}>
                <View style={styles.secretDataContainer}>
                    {activePlayer.isImposter ? (
                        <>
                            <Text style={[styles.secretSmall, { color: theme.subText, opacity: 0.7 }]}>You are the imposter. Your hint is:</Text>
                            <Text style={[styles.secretLarge, { color: theme.text }]}>{secretHint}</Text>
                        </>
                    ) : (
                        <>
                            <Text style={[styles.secretSmall, { color: theme.subText, opacity: 0.7 }]}>The word is</Text>
                            <Text style={[styles.secretLarge, { color: theme.text }]}>{secretWord}</Text>
                        </>
                    )}
                </View>

                <View style={styles.tileGrid}>
                    {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, i) => (
                        <View key={i} style={[{ backgroundColor: theme.cardHidden, width: TILE_SIZE, height: TILE_SIZE, opacity: scratchedTiles.has(i) ? 0 : 1 }]} />
                    ))}
                    <Text style={[styles.scratchText, { color: theme.text, opacity: isScratched ? 0 : 0.6 }]}>SCRATCH TO REVEAL</Text>
                </View>
                <View style={styles.touchOverlay} {...panResponder.panHandlers} />
            </View>

            <Animated.View style={currentPlayerIdx < gameBackend.numPlayers - 1 ? { transform: [{ scale: pulseAnim }] } : {}}>
                <TouchableOpacity style={[styles.nextButton, { backgroundColor: theme.primaryButton }]} onPress={handleNextPlayer}>
                    <Text style={[styles.nextButtonText, { color: theme.text }]}>
                        {currentPlayerIdx < gameBackend.numPlayers - 1 ? `Click & Pass the phone to ${gameBackend.players[currentPlayerIdx + 1].name}` : "Proceed"}
                    </Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Themed Quit Modal */}
            <Modal transparent={true} animationType="fade" visible={isQuitModalVisible} onRequestClose={() => setIsQuitModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Quit Game?</Text>
                        <Text style={[styles.modalMessage, { color: theme.text }]}>Progress will be lost. Are you sure?</Text>
                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity style={[styles.modalActionBtn, { backgroundColor: theme.primaryButton }]} onPress={() => router.back()}>
                                <Text style={[styles.modalBtnText, { color: theme.text }]}>Quit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalActionBtn, { backgroundColor: theme.positiveButton }]} onPress={() => setIsQuitModalVisible(false)}>
                                <Text style={[styles.modalBtnText, { color: theme.text }]}>Stay</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
    promptContainer: { alignItems: 'center', marginBottom: 40 },
    smallText: { fontSize: 18, fontWeight: '600', marginBottom: 5, marginTop: 5 },
    largeText: { fontSize: 42, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
    cardContainer: { width: CARD_SIZE, height: CARD_SIZE, borderRadius: 20, overflow: 'hidden', position: 'relative', marginBottom: 50 },
    secretDataContainer: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', padding: 20 },
    secretSmall: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 10 },
    secretLarge: { fontSize: 32, fontWeight: 'bold', textAlign: 'center' },
    tileGrid: { ...StyleSheet.absoluteFill, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' },
    scratchText: { position: 'absolute', fontSize: 18, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
    touchOverlay: { ...StyleSheet.absoluteFill },
    nextButton: { paddingVertical: 18, paddingHorizontal: 30, borderRadius: 999 },
    nextButtonText: { fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    modalContent: { width: '100%', padding: 24, borderRadius: 20, alignItems: 'center' },
    modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
    modalMessage: { fontSize: 16, textAlign: 'center', marginBottom: 24 },
    modalButtonRow: { flexDirection: 'row', gap: 12, width: '100%' },
    modalActionBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    modalBtnText: { fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase' }
});
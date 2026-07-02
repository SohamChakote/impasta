import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    PanResponder,
    TouchableOpacity,
    Animated,
    BackHandler,
    Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import Svg, { Rect, Path, Mask } from 'react-native-svg'; // <-- New imports for smooth scratching
import { PlayerList } from "@/backend/PlayerList";
import { CategoryHelper } from "@/backend/CategoryHelper";

const CARD_SIZE = 260;

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

    // --- NEW: Smooth Scratch State ---
    const [path, setPath] = useState('');
    const [isScratched, setIsScratched] = useState(false);

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

    // --- NEW: Smooth Drawing Logic ---
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                const { locationX, locationY } = evt.nativeEvent;
                setPath((prev) => `${prev} M ${locationX} ${locationY}`);
            },
            onPanResponderMove: (evt) => {
                const { locationX, locationY } = evt.nativeEvent;
                setPath((prev) => `${prev} L ${locationX} ${locationY}`);
                if (!isScratched) setIsScratched(true);
            },
        })
    ).current;

    const handleNextPlayer = () => {
        if (currentPlayerIdx < gameBackend.numPlayers - 1) {
            setCurrentPlayerIdx(currentPlayerIdx + 1);
            setPath(''); // Reset the scratch path for the next player
            setIsScratched(false);
        } else {
            const imposter = gameBackend.getImposter();
            // Select a random player just before navigating and include their name in the params
            const randomPlayer = gameBackend.getRandomPlayer();
            router.push({
                pathname: '/screens/RevealScreen',
                params: { imposterName: imposter, randomPlayerName: randomPlayer.name }
            });
        }
    };

    const theme = {
        background: '#F6FFDC',
        text: '#1E293B',
        subText: '#1E293B',
        cardHidden: '#CFECF3',
        cardRevealed: '#DAF9DE',
        primaryButton: '#F9B2D7',
        positiveButton: '#BEE8C1',
    };

    if (!activePlayer) return null;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.promptContainer}>
                <Text style={[styles.smallText, { color: theme.subText, opacity: 0.8 }]}>If you are</Text>
                <Text style={[styles.largeText, { color: theme.text }]}>{activePlayer.name}</Text>
                <Text style={[styles.smallText, { color: theme.subText, opacity: 0.8 }]}>then scratch the card:</Text>
            </View>

            {/* --- NEW: SVG Masking Layout --- */}
            <View style={[styles.cardContainer, { backgroundColor: theme.cardRevealed }]}>
                {/* 1. The Bottom Layer (The Secret) */}
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

                {/* 2. The Top Layer (The Scratchable Cover) */}
                <View style={styles.touchOverlay} {...panResponder.panHandlers}>
                    <Svg width={CARD_SIZE} height={CARD_SIZE}>
                        <Mask id="scratch-mask">
                            {/* White keeps the cover visible */}
                            <Rect width="100%" height="100%" fill="white" />
                            {/* Black acts as the eraser where your finger touches */}
                            <Path
                                d={path}
                                fill="none"
                                stroke="black"
                                strokeWidth={45} // <--- Change this to make the eraser thicker/thinner
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </Mask>
                        {/* The actual colored cover that gets masked out */}
                        <Rect width="100%" height="100%" fill={theme.cardHidden} mask="url(#scratch-mask)" />
                    </Svg>

                    {/* The Instruction Text (Only shows before they start scratching) */}
                    {!isScratched && (
                        <View style={styles.instructionOverlay} pointerEvents="none">
                            <Text style={[styles.scratchText, { color: theme.text }]}>SCRATCH TO REVEAL</Text>
                        </View>
                    )}
                </View>
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
    touchOverlay: { ...StyleSheet.absoluteFill },
    instructionOverlay: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
    scratchText: { fontSize: 18, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
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
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Animated } from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';

export default function RevealScreen() {
    const router = useRouter();
    const navigation = useNavigation();

    // 1. State to control the suspense
    const [isRevealed, setIsRevealed] = useState(false);

    // 2. A silent flag to let the green button bypass the back-button alert
    const isManualExit = useRef(false);

    // 3. Animation Values
    const nameOpacity = useRef(new Animated.Value(0)).current;
    const buttonOpacity = useRef(new Animated.Value(0)).current;

    // Catch the name passed from the Turn Screen
    const { imposterName } = useLocalSearchParams();

    // Theme setup - Strictly Light Mode for now per your request
    /* const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    */
    const theme = {
        background: '#F6FFDC',      // Soft Pale Yellow
        text: '#1E293B',            // Dark Slate
        primaryButton: '#F9B2D7',   // Bubblegum Pink
    };

    // --- INTERCEPT BACK BUTTON ---
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // If the user pressed the return button, let them pass without the alert
            if (isManualExit.current) {
                return;
            }

            // Otherwise, stop the default back action (swipes or hardware button)
            e.preventDefault();

            Alert.alert(
                'Quit Game?',
                'Are you sure you want to quit the game and return to the main menu?',
                [
                    {
                        text: 'No',
                        style: 'cancel',
                        onPress: () => {}
                    },
                    {
                        text: 'Yes',
                        style: 'destructive',
                        onPress: () => {
                            // Flip the flag so we don't trigger this alert again in a loop
                            isManualExit.current = true;
                            // Route them to Category Screen
                            router.replace('/screens/CategoryScreen');
                        },
                    },
                ]
            );
        });

        return unsubscribe;
    }, [navigation, router]);

    // --- FADE IN ANIMATION TRIGGERS ---
    useEffect(() => {
        if (isRevealed) {
            // Run the animations in sequence: Name fades in slowly, then button appears
            Animated.sequence([
                Animated.timing(nameOpacity, {
                    toValue: 1,
                    duration: 2000, // 2 seconds slow fade
                    useNativeDriver: true,
                }),
                Animated.timing(buttonOpacity, {
                    toValue: 1,
                    duration: 500, // Quick fade for the button afterwards
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [isRevealed, nameOpacity, buttonOpacity]);

    // Return to Category Screen action
    const handleFinishGame = () => {
        isManualExit.current = true;
        router.replace('/screens/CategoryScreen');
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>

            <View style={styles.content}>
                {!isRevealed ? (
                    // PHASE 1: The Suspense
                    <>
                        <Text style={[styles.drumrollText, { color: theme.text }]}>
                            MOMENT OF TRUTH...
                        </Text>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.primaryButton }]}
                            onPress={() => setIsRevealed(true)}
                        >
                            <Text style={[styles.buttonText, { color: theme.text }]}>REVEAL IMPOSTER</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    // PHASE 2: The Reveal with Fade Animations
                    <>
                        <Text style={[styles.subText, { color: theme.text }]}>
                            The Imposter is :
                        </Text>

                        <Animated.Text style={[styles.imposterName, { color: theme.text, opacity: nameOpacity }]}>
                            {imposterName || 'UNKNOWN'}
                        </Animated.Text>
                    </>
                )}
            </View>

            {/* The Main Menu button only fades in AFTER the name is revealed */}
            {isRevealed && (
                <Animated.View style={{ opacity: buttonOpacity }}>
                    <TouchableOpacity
                        style={[styles.mainMenuButton, { backgroundColor: theme.primaryButton }]}
                        onPress={handleFinishGame}
                    >
                        <Text style={[styles.buttonText, { color: theme.text }]}>RETURN TO MAIN MENU</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    drumrollText: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 40,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    subText: {
        fontSize: 22,
        fontWeight: '500',
        marginBottom: 10,
    },
    imposterName: {
        fontSize: 56, // Massive text for the final reveal
        fontWeight: '900',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    actionButton: {
        paddingVertical: 20,
        paddingHorizontal: 40,
        borderRadius: 999,
        alignItems: 'center',
        shadowColor: "#1E293B",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
    },
    mainMenuButton: {
        paddingVertical: 18,
        borderRadius: 999,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: "#1E293B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    }
});
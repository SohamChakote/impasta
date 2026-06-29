import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, useColorScheme, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';

export default function RevealScreen() {
    const router = useRouter();
    const navigation = useNavigation();

    // 1. State to control the suspense
    const [isRevealed, setIsRevealed] = useState(false);

    // 2. A silent flag to let the green button bypass the back-button alert
    const isManualExit = useRef(false);

    // Catch the name passed from the Turn Screen
    const { imposterName } = useLocalSearchParams();

    // Theme setup
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const textColor = isDark ? '#fff' : '#000';
    const bgColor = isDark ? '#121212' : '#f5f5f5';

    // --- INTERCEPT BACK BUTTON ---
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // If the user pressed the green button, let them pass without the alert
            if (isManualExit.current) {
                return;
            }

            // Otherwise, stop the default back action (swipes or hardware button)
            e.preventDefault();

            Alert.alert(
                'End Game?',
                'Are you sure you want to end this game and choose a new category?',
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
                            // Route them to Category Selection
                            router.replace('/screens/CategoryScreen');
                        },
                    },
                ]
            );
        });

        return unsubscribe;
    }, [navigation, router]);

    // Green Button action
    const handleFinishGame = () => {
        isManualExit.current = true;
        router.replace('/screens/CategoryScreen');
    };

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>

            <View style={styles.content}>
                {!isRevealed ? (
                    // PHASE 1: The Suspense
                    <>
                        <Text style={[styles.drumrollText, { color: textColor, marginBottom: 40 }]}>
                            Moment of Truth...
                        </Text>
                        <TouchableOpacity
                            style={styles.revealImposterButton}
                            onPress={() => setIsRevealed(true)}
                        >
                            <Text style={styles.buttonText}>Reveal Imposter</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    // PHASE 2: The Reveal (Your awesome UI)
                    <>
                        <Text style={[styles.drumrollText, { color: textColor }]}>
                            The Impasta was...
                        </Text>

                        <Text style={[styles.imposterName, { color: textColor }]}>
                            {imposterName || 'Unknown'}
                        </Text>
                    </>
                )}
            </View>

            {/* The green button only appears AFTER the reveal to prevent accidental early exits */}
            {isRevealed && (
                <TouchableOpacity
                    style={styles.mainMenuButton}
                    onPress={handleFinishGame}
                >
                    <Text style={styles.buttonText}>Choose New Category</Text>
                </TouchableOpacity>
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
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    imposterName: {
        fontSize: 48,
        fontWeight: '900',
        textAlign: 'center',
        color: '#ff4444',
    },
    revealImposterButton: {
        backgroundColor: '#ff4444', // Danger red for the big reveal
        paddingVertical: 24,
        paddingHorizontal: 40,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: "#ff4444",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    mainMenuButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 18,
        borderRadius: 999,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});
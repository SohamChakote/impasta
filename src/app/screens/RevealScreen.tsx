import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert, useColorScheme, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';

export default function RevealScreen() {
    const router = useRouter();
    const navigation = useNavigation();

    // Catch the name passed from the previous screen
    const { imposterName } = useLocalSearchParams();

    // Theme setup
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const textColor = isDark ? '#fff' : '#000';
    const bgColor = isDark ? '#121212' : '#f5f5f5';

    // The Back Button Intercept
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // Stop the default back action
            e.preventDefault();

            // Fire the security popup
            Alert.alert(
                'Return to Main Menu?',
                'Are you sure you want to leave this game and return to the main menu?',
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
                            // If they say yes, remove the listener so we don't get trapped,
                            // then send them straight to the Title Screen.
                            navigation.removeListener('beforeRemove', unsubscribe);
                            router.replace('/');
                        },
                    },
                ]
            );
        });

        return unsubscribe;
    }, [navigation, router]);

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={styles.content}>
                <Text style={[styles.drumrollText, { color: textColor }]}>
                    The Impasta was...
                </Text>

                {/* Fallback to 'Unknown' just in case the data doesn't pass correctly while testing */}
                <Text style={[styles.imposterName, { color: textColor }]}>
                    {imposterName || 'Unknown'}
                </Text>
            </View>

            {/* A button to trigger the back action manually */}
            <TouchableOpacity
                style={styles.mainMenuButton}
                onPress={() => router.back()}
            >
                <Text style={styles.buttonText}>Finish Game</Text>
            </TouchableOpacity>
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
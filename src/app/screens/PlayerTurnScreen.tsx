import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

export default function PlayerTurnScreen() {
    const router = useRouter();
    const isDarkMode = useColorScheme() === 'dark';

    const themeColors = {
        background: isDarkMode ? '#121212' : '#F9FAFB',
        text: isDarkMode ? '#FFFFFF' : '#111827',
        buttonBackground: isDarkMode ? '#3B82F6' : '#2563EB',
        buttonText: '#FFFFFF',
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.title, { color: themeColors.text }]}>Player Turn</Text>
            <Text style={[styles.subtitle, { color: themeColors.text }]}>Pass the phone / Secret word screen.</Text>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: themeColors.buttonBackground }]}
                onPress={() => router.back()}
            >
                <Text style={[styles.buttonText, { color: themeColors.buttonText }]}>Go Back</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
    subtitle: { fontSize: 16, marginBottom: 32, opacity: 0.8 },
    button: { paddingVertical: 12, paddingHorizontal: 32, borderRadius: 999 },
    buttonText: { fontSize: 16, fontWeight: '700', textTransform: 'uppercase' },
});
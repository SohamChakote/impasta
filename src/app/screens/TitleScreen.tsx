import React, { useEffect, useRef } from "react";
import {
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    useColorScheme,
    Animated // 1. Import the animation library
} from "react-native";
import { useRouter } from "expo-router";

export default function TitleScreen() {
    const router = useRouter();
    const isDarkMode = useColorScheme() === 'dark';

    // 2. Create the animation starting value (1 = 100% visible)
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // 3. Start a 2-second countdown as soon as the screen loads
        const timer = setTimeout(() => {

            // 4. Trigger the fade-out animation
            Animated.timing(fadeAnim, {
                toValue: 0, // Fade to 0% visible (invisible)
                duration: 800, // Take 800 milliseconds to fade out
                useNativeDriver: true, // Uses native phone hardware for a buttery smooth fade
            }).start(() => {
                // 5. Once the fade finishes, instantly replace the screen!
                // We use .replace() instead of .push() so the user can't hit "back" to return to the loading screen.
                router.replace("/screens/CategoryScreen");
            });

        }, 2000); // 2000 milliseconds = 2 seconds

        // Cleanup the timer if the component unmounts early
        return () => clearTimeout(timer);
    }, [fadeAnim, router]);

    const themeColors = {
        background: isDarkMode ? '#121212' : '#F9FAFB',
        text: isDarkMode ? '#FFFFFF' : '#111827',
        buttonBackground: isDarkMode ? '#3B82F6' : '#2563EB',
        buttonText: '#FFFFFF',
    };

    return (
        // 6. Wrap the whole screen in an Animated.View instead of a regular View
        <Animated.View style={[styles.container, { backgroundColor: themeColors.background, opacity: fadeAnim }]}>

            <Image
                source={{ uri: 'https://via.placeholder.com/150/808080/FFFFFF?text=Impasta+Logo' }}
                style={styles.logo}
            />

            <Text style={[styles.title, { color: themeColors.text }]}>
                Impasta App
            </Text>

            {/* This button now acts as a "Skip Intro" button! */}
            <TouchableOpacity
                style={[styles.button, { backgroundColor: themeColors.buttonBackground }]}
                activeOpacity={0.8}
                onPress={() => router.replace("/screens/CategoryScreen")}
            >
                <Text style={[styles.buttonText, { color: themeColors.buttonText }]}>
                    Play Game
                </Text>
            </TouchableOpacity>

        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    logo: {
        width: 150,
        height: 150,
        borderRadius: 24,
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: "900",
        letterSpacing: 1,
        marginBottom: 48,
    },
    button: {
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: 999,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
});
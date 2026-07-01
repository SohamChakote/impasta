import React, { useEffect, useRef } from "react";
import {
    Text,
    StyleSheet,
    Image,
    Animated,
    View
} from "react-native";
import { useRouter } from "expo-router";

export default function TitleScreen() {
    const router = useRouter();

    // Start at 0 opacity
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Use Animated.sequence to chain multiple animations one after the other
        Animated.sequence([
            // 1. Fade in smoothly
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1200, // 1.2 seconds to fade in
                useNativeDriver: true,
            }),
            // 2. Hold it on screen so the user can read it
            Animated.delay(600), // 0.6 second pause
            // 3. Fade it back out gracefully
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 800, // 0.8 seconds to fade out
                useNativeDriver: true,
            })
        ]).start(() => {
            // 4. NOW we switch screens while the title elements are invisible
            router.replace("/screens/CategoryScreen");
        });
    }, [fadeAnim, router]);

    // Keeping your requested light mode colors hardcoded
    const themeColors = {
        background: '#F6FFDC',
        text: '#1E293B',
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim }]}>
                <Image
                    source={require('../../resources/logos/insideAppLogo.png')}
                    style={styles.logo}
                />

                <Text style={[styles.title, { color: themeColors.text }]}>
                    Impasta
                </Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    contentWrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
    },
    logo: {
        width: 60,
        height: 60,
        borderRadius: 12,
    },
    title: {
        fontSize: 48,
        letterSpacing: 1.5,
        fontFamily: "Iosevka-Charon-Bold",
    },
});
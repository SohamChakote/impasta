import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    Image,
    ScrollView,
    BackHandler,
    Alert
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';

const CATEGORY_LIST = [
    { id: 'random', name: 'Random', image: 'https://via.placeholder.com/60/808080/FFFFFF?text=?' },
    { id: 'mixed', name: 'All / Mixed', image: 'https://via.placeholder.com/60/808080/FFFFFF?text=All' },
    { id: 'foods', name: 'Foods', image: 'https://via.placeholder.com/60/808080/FFFFFF?text=Food' },
    { id: 'movies', name: 'Movies', image: 'https://via.placeholder.com/60/808080/FFFFFF?text=Film' },
];

export default function CategoryScreen() {
    const router = useRouter();
    const isDarkMode = useColorScheme() === 'dark';

    // 1. State to track the currently selected category
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

    // 2. Intercept the hardware back button
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                Alert.alert(
                    'Quit App',
                    'Are you sure you want to quit the app?',
                    [
                        { text: 'Cancel', style: 'cancel', onPress: () => {} },
                        // If they press Yes, it force-closes the app natively
                        { text: 'Yes', style: 'destructive', onPress: () => BackHandler.exitApp() },
                    ]
                );
                return true; // This tells React Native we have handled the back button
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [])
    );

    // Dynamic Theming with new "Selected" colors added
    const themeColors = {
        background: isDarkMode ? '#121212' : '#F9FAFB',
        text: isDarkMode ? '#FFFFFF' : '#111827',
        cardBackground: isDarkMode ? '#1E1E1E' : '#FFFFFF',
        cardBorder: isDarkMode ? '#333333' : '#E5E7EB',

        // New Highlight Colors
        selectedBackground: isDarkMode ? '#1A365D' : '#EFF6FF',
        selectedBorder: isDarkMode ? '#3B82F6' : '#2563EB',

        buttonBackground: isDarkMode ? '#3B82F6' : '#2563EB',
        buttonText: '#FFFFFF',
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>

            <Text style={[styles.title, { color: themeColors.text }]}>
                Select Category
            </Text>

            <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
                {CATEGORY_LIST.map((category) => {
                    // Check if this specific card is the one the user tapped
                    const isSelected = selectedCategoryId === category.id;

                    return (
                        <TouchableOpacity
                            key={category.id}
                            onPress={() => setSelectedCategoryId(category.id)}
                            style={[
                                styles.categoryCard,
                                {
                                    backgroundColor: isSelected ? themeColors.selectedBackground : themeColors.cardBackground,
                                    borderColor: isSelected ? themeColors.selectedBorder : themeColors.cardBorder,
                                    // Make the selected card physically pop out
                                    transform: [{ scale: isSelected ? 1.03 : 1 }],
                                    borderWidth: isSelected ? 2 : 1,
                                }
                            ]}
                            activeOpacity={0.7}
                        >
                            <Image source={{ uri: category.image }} style={styles.categoryImage} />
                            <Text style={[styles.categoryName, { color: themeColors.text }]}>
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Bottom Button */}
            <TouchableOpacity
                style={[
                    styles.chooseButton,
                    { backgroundColor: themeColors.buttonBackground },
                    // If no category is selected, apply the disabled style
                    !selectedCategoryId && styles.disabledButton
                ]}
                disabled={!selectedCategoryId}
                onPress={() => router.push("/screens/PlayerSetupScreen")}
            >
                <Text style={[
                    styles.chooseButtonText,
                    { color: themeColors.buttonText },
                    !selectedCategoryId && styles.disabledButtonText
                ]}>
                    Choose Category
                </Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 64,
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 24,
        textAlign: 'center',
    },
    listContainer: {
        flex: 1,
        marginBottom: 24,
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 16,
    },
    categoryName: {
        fontSize: 20,
        fontWeight: '600',
    },
    chooseButton: {
        paddingVertical: 16,
        borderRadius: 999,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    chooseButtonText: {
        fontSize: 18,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    // New Disabled Styles
    disabledButton: {
        backgroundColor: '#A1A1AA', // A neutral gray
        shadowOpacity: 0, // Flatten it so it doesn't look clickable
        elevation: 0,
    },
    disabledButtonText: {
        color: '#E4E4E7', // Dimmed text color
    }
});
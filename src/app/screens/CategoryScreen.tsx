import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    Image,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';

// 1. The Placeholder List
// This mimics what your future logic will output.
// Adding a new category here automatically draws it on the screen.
const CATEGORY_LIST = [
    { id: 'random', name: 'Random', image: 'https://via.placeholder.com/60/808080/FFFFFF?text=?' },
    { id: 'mixed', name: 'All / Mixed', image: 'https://via.placeholder.com/60/808080/FFFFFF?text=All' },
    // These match the resources you showed in your screenshot:
    { id: 'foods', name: 'Foods', image: 'https://via.placeholder.com/60/808080/FFFFFF?text=Food' },
    { id: 'movies', name: 'Movies', image: 'https://via.placeholder.com/60/808080/FFFFFF?text=Film' },
];

export default function CategoryScreen() {
    const router = useRouter();
    const isDarkMode = useColorScheme() === 'dark';

    // 2. Dynamic Theming
    const themeColors = {
        background: isDarkMode ? '#121212' : '#F9FAFB',
        text: isDarkMode ? '#FFFFFF' : '#111827',
        cardBackground: isDarkMode ? '#1E1E1E' : '#FFFFFF',
        cardBorder: isDarkMode ? '#333333' : '#E5E7EB',
        buttonBackground: isDarkMode ? '#3B82F6' : '#2563EB',
        buttonText: '#FFFFFF',
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>

            <Text style={[styles.title, { color: themeColors.text }]}>
                Select Category
            </Text>

            {/* 3. The Scrollable List */}
            {/* ScrollView ensures that if you add 20 categories, the user can scroll through them */}
            <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>

                {/* This loops over the CATEGORY_LIST and stamps out a visual card for each item */}
                {CATEGORY_LIST.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.categoryCard,
                            {
                                backgroundColor: themeColors.cardBackground,
                                borderColor: themeColors.cardBorder,
                            }
                        ]}
                        activeOpacity={0.7}
                    >
                        <Image source={{ uri: category.image }} style={styles.categoryImage} />
                        <Text style={[styles.categoryName, { color: themeColors.text }]}>
                            {category.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* 4. The Bottom Button */}
            <TouchableOpacity
                style={[styles.chooseButton, { backgroundColor: themeColors.buttonBackground }]}
                // Hard-coded navigation routing to the setup screen for now
                onPress={() => router.push("/screens/PlayerSetupScreen")}
            >
                <Text style={[styles.chooseButtonText, { color: themeColors.buttonText }]}>
                    Choose Category
                </Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 64, // Pushes content down so it doesn't hit the phone notch
        paddingHorizontal: 24,
        paddingBottom: 32, // Padding for the bottom button
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 24,
        textAlign: 'center',
    },
    listContainer: {
        flex: 1, // Tells the list to take up all available space in the middle
        marginBottom: 24,
    },
    categoryCard: {
        flexDirection: 'row', // CRITICAL: This is what makes the box a "horizontal rectangle"
        alignItems: 'center', // Centers the text vertically with the image
        padding: 12,
        marginBottom: 16,
        borderRadius: 16,
        borderWidth: 1,
        // Optional subtle drop shadow for a professional feel
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
        marginRight: 16, // Puts space between the image and the text
    },
    categoryName: {
        fontSize: 20,
        fontWeight: '600',
    },
    chooseButton: {
        paddingVertical: 16,
        borderRadius: 999, // Pill shape
        alignItems: 'center', // Centers text horizontally in the button
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
});
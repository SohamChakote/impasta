import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    BackHandler,
    Alert,
    Animated,
    Platform
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
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                Alert.alert(
                    'Quit App?',
                    'Are you sure you want to quit the app?',
                    [
                        { text: 'Cancel', style: 'cancel', onPress: () => {} },
                        { text: 'Yes', style: 'destructive', onPress: () => BackHandler.exitApp() },
                    ]
                );
                return true;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [])
    );

    const themeColors = {
        background: '#F6FFDC',
        text: '#1E293B',
        cardBackground: '#DAF9DE',
        selectedBackground: '#BEE8C1',
        selectedBorder: '#88D49E',
        buttonBackground: '#F9B2D7',
        buttonText: '#1E293B',
    };

    return (
        <Animated.View style={[styles.container, { backgroundColor: themeColors.background, opacity: fadeAnim }]}>
            <View style={styles.headerRow}>
                <Image
                    source={{ uri: 'https://via.placeholder.com/40/808080/FFFFFF?text=Logo' }}
                    style={styles.headerLogo}
                />
                <Text style={[styles.title, { color: themeColors.text }]}>
                    Impasta
                </Text>
            </View>

            <ScrollView
                style={styles.listContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContentPadding}
            >
                {CATEGORY_LIST.map((category) => {
                    const isSelected = selectedCategoryId === category.id;
                    return (
                        <TouchableOpacity
                            key={category.id}
                            onPress={() => setSelectedCategoryId(category.id)}
                            style={[
                                styles.categoryCard,
                                {
                                    backgroundColor: isSelected ? themeColors.selectedBackground : themeColors.cardBackground,
                                    borderColor: isSelected ? themeColors.selectedBorder : 'transparent',
                                    borderWidth: 2,
                                    transform: [{ scale: isSelected ? 1.02 : 1 }],
                                    elevation: isSelected ? 4 : 2,
                                    shadowOpacity: isSelected ? 0.15 : 0.05,
                                }
                            ]}
                            activeOpacity={0.8}
                        >
                            <Image source={{ uri: category.image }} style={styles.categoryImage} />
                            <View style={styles.categoryNameWrapper}>
                                <Text style={[styles.categoryName, { color: themeColors.text }]}>
                                    {category.name}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Anchored bottom container to prevent cutoff */}
            <View style={styles.bottomButtonContainer}>
                <TouchableOpacity
                    style={[
                        styles.chooseButton,
                        { backgroundColor: themeColors.buttonBackground },
                        !selectedCategoryId && styles.disabledButton
                    ]}
                    disabled={!selectedCategoryId}
                    onPress={() => router.push({
                        pathname: "/screens/PlayerSetupScreen",
                        params: { categoryName: CATEGORY_LIST.find(c => c.id === selectedCategoryId)?.name }
                    })}
                    activeOpacity={0.8}
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
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 24,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    headerLogo: {
        width: 40,
        height: 40,
        borderRadius: 8,
        marginRight: 12,
    },
    title: {
        fontSize: 36,
        letterSpacing: 1,
        fontFamily: 'Iosevka-Charon-Bold',
    },
    listContainer: {
        flex: 1,
    },
    listContentPadding: {
        paddingBottom: 20,
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch',
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
    },
    categoryImage: {
        width: 40,
        height: 40,
        borderRadius: 8,
    },
    categoryNameWrapper: {
        flex: 1,
        alignItems: 'center',
        paddingRight: 40,
    },
    categoryName: {
        fontSize: 16,
        letterSpacing: 0.5,
        fontFamily: 'Iosevka-Charon-Medium',
    },
    // Fixes the button cutoff issue
    bottomButtonContainer: {
        paddingVertical: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 30, // Extra padding for safe area
        backgroundColor: 'transparent',
    },
    chooseButton: {
        alignSelf: 'stretch',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
    },
    chooseButtonText: {
        fontSize: 18,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontFamily: 'Iosevka-Charon-Bold',
    },
    disabledButton: {
        backgroundColor: '#E2E8F0',
        shadowOpacity: 0,
        elevation: 0,
        transform: [{ scale: 0.98 }],
    },
    disabledButtonText: {
        color: '#94A3B8',
    }
});
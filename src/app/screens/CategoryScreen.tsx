import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    BackHandler,
    Animated,
    Platform,
    Modal // <-- Imported Modal
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
// Make sure this import path matches your alias setup
import { CATEGORY_MAP } from '@/backend/CategoryHelper';

export default function CategoryScreen() {
    const router = useRouter();
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [isQuitModalVisible, setIsQuitModalVisible] = useState(false); // <-- State for our custom modal
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
                // Trigger our custom modal instead of native Alert
                setIsQuitModalVisible(true);
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

    const categoryKeys = Object.keys(CATEGORY_MAP);

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
                {categoryKeys.map((key) => {
                    const categoryData = CATEGORY_MAP[key];
                    const isSelected = selectedCategoryId === key;
                    const displayName = key.charAt(0).toUpperCase() + key.slice(1);

                    return (
                        <TouchableOpacity
                            key={key}
                            onPress={() => setSelectedCategoryId(key)}
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
                            <Text style={styles.categoryEmoji}>
                                {categoryData.emoji || "❓"}
                            </Text>

                            <View style={styles.categoryNameWrapper}>
                                <Text style={[styles.categoryName, { color: themeColors.text }]}>
                                    {displayName}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

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
                        params: { categoryName: selectedCategoryId }
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

            {/* Custom Themed Quit Modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={isQuitModalVisible}
                onRequestClose={() => setIsQuitModalVisible(false)} // Handles back swipe on the modal itself
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: themeColors.background }]}>
                        <Text style={[styles.modalTitle, { color: themeColors.text }]}>Quit App?</Text>
                        <Text style={[styles.modalMessage, { color: themeColors.text }]}>
                            Are you sure you want to leave the party?
                        </Text>

                        <View style={styles.modalButtonRow}>
                            {/* Negative Action (Quit) - Pink */}
                            <TouchableOpacity
                                style={[styles.modalActionBtn, { backgroundColor: themeColors.buttonBackground }]}
                                onPress={() => BackHandler.exitApp()}
                            >
                                <Text style={[styles.modalBtnText, { color: themeColors.text }]}>Quit</Text>
                            </TouchableOpacity>

                            {/* Positive Action (Cancel/Stay) - Mint Green */}
                            <TouchableOpacity
                                style={[styles.modalActionBtn, { backgroundColor: themeColors.selectedBackground }]}
                                onPress={() => setIsQuitModalVisible(false)}
                            >
                                <Text style={[styles.modalBtnText, { color: themeColors.text }]}>Stay</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        alignSelf: 'center',
        width: '95%',
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
    },
    categoryEmoji: {
        fontSize: 28,
        width: 40,
        textAlign: 'center',
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
    bottomButtonContainer: {
        paddingVertical: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 30,
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
    },
    // --- New Modal Styles ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Creates the dark see-through background
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 24,
        fontFamily: 'Iosevka-Charon-Bold',
        marginBottom: 12,
    },
    modalMessage: {
        fontSize: 16,
        fontFamily: 'Iosevka-Charon-Medium',
        textAlign: 'center',
        marginBottom: 24,
    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 12, // Space between buttons
    },
    modalActionBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalBtnText: {
        fontSize: 16,
        fontFamily: 'Iosevka-Charon-Bold',
        textTransform: 'uppercase',
    }
});
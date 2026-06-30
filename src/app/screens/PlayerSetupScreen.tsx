import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    BackHandler,
    Alert,
    Animated,
    Platform
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 10;

type Player = {
    id: string;
    name: string;
};

export default function PlayerSetupScreen() {
    const router = useRouter();
    const { categoryName } = useLocalSearchParams<{ categoryName?: string }>();
    const displayCategory = categoryName || "Selected Category";

    // Entrance Animation
    const fadeAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    // State Management
    const [players, setPlayers] = useState<Player[]>([
        { id: '1', name: '' },
        { id: '2', name: '' },
        { id: '3', name: '' }
    ]);
    const [numInput, setNumInput] = useState(MIN_PLAYERS.toString());

    // Intercept Back Button
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                Alert.alert(
                    'Discard Changes?',
                    'Are you sure you want to discard any changes?',
                    [
                        { text: 'Cancel', style: 'cancel', onPress: () => {} },
                        { text: 'Yes', style: 'destructive', onPress: () => router.back() },
                    ]
                );
                return true;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [router])
    );

    // Player Count Logic
    const updatePlayerArray = (newCount: number) => {
        setPlayers(prev => {
            if (newCount > prev.length) {
                const added = Array.from({ length: newCount - prev.length }, () => ({ id: Math.random().toString(), name: '' }));
                return [...prev, ...added];
            } else if (newCount < prev.length) {
                return prev.slice(0, newCount);
            }
            return prev;
        });
    };

    const handleCountValidation = (targetCount: number) => {
        if (isNaN(targetCount)) {
            setNumInput(players.length.toString());
            return;
        }
        if (targetCount < MIN_PLAYERS) {
            Alert.alert('Hold up!', `You need at least ${MIN_PLAYERS} players to play.`);
            setNumInput(MIN_PLAYERS.toString());
            updatePlayerArray(MIN_PLAYERS);
            return;
        }
        if (targetCount > MAX_PLAYERS) {
            Alert.alert('Hold up!', `Maximum of ${MAX_PLAYERS} players allowed for now.`);
            setNumInput(MAX_PLAYERS.toString());
            updatePlayerArray(MAX_PLAYERS);
            return;
        }
        setNumInput(targetCount.toString());
        updatePlayerArray(targetCount);
    };

    const onSubmitNumInput = () => handleCountValidation(parseInt(numInput, 10));
    const decrementPlayers = () => handleCountValidation(players.length - 1);
    const incrementPlayers = () => handleCountValidation(players.length + 1);

    // List Logic
    const removePlayer = (idToRemove: string) => {
        if (players.length <= MIN_PLAYERS) {
            Alert.alert('Hold up!', `You need at least ${MIN_PLAYERS} players.`);
            return;
        }
        const newPlayers = players.filter(p => p.id !== idToRemove);
        setPlayers(newPlayers);
        setNumInput(newPlayers.length.toString());
    };

    const updatePlayerName = (id: string, newName: string) => {
        setPlayers(players.map(p => p.id === id ? { ...p, name: newName } : p));
    };

    const handleStartGame = () => {
        const rawNames = players.map(p => p.name.trim() !== '' ? p.name.trim() : 'Unnamed Player');
        router.push({
            pathname: "/screens/PlayerTurnScreen",
            params: { categoryName: displayCategory, playerNamesParam: JSON.stringify(rawNames) }
        });
    };

    // Figma Palette
    const themeColors = {
        background: '#F6FFDC',
        text: '#1E293B',
        subText: '#64748B',
        inputBackground: '#CFECF3',
        primaryButton: '#F9B2D7',
        addButton: '#DAF9DE',
    };

    // Render Draggable Row
    const renderItem = ({ item, drag, isActive }: RenderItemParams<Player>) => {
        return (
            <ScaleDecorator>
                <View style={[styles.row, isActive && { opacity: 0.7, transform: [{ scale: 1.02 }] }]}>

                    {/* Drag Handle (Hamburger Icon) */}
                    <TouchableOpacity
                        onPressIn={drag}
                        style={styles.dragHandleContainer}
                        activeOpacity={0.5}
                    >
                        <Text style={[styles.dragHandleText, { color: themeColors.text }]}>≡</Text>
                    </TouchableOpacity>

                    {/* Blue Name Form */}
                    <TextInput
                        style={[styles.nameInput, { backgroundColor: themeColors.inputBackground, color: themeColors.text }]}
                        placeholder="Enter Name"
                        placeholderTextColor={themeColors.subText}
                        value={item.name}
                        onChangeText={(text) => updatePlayerName(item.id, text)}
                    />

                    {/* Slate 'X' Outside the Box */}
                    <TouchableOpacity onPress={() => removePlayer(item.id)} style={styles.removeButton}>
                        <Text style={[styles.removeText, { color: themeColors.text }]}>X</Text>
                    </TouchableOpacity>
                </View>
            </ScaleDecorator>
        );
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Animated.View style={[styles.mainContainer, { backgroundColor: themeColors.background, opacity: fadeAnim }]}>

                {/* Top Category Header */}
                <View style={[styles.categoryHeader, { borderBottomColor: themeColors.text }]}>
                    <Text style={[styles.categoryLabel, { color: themeColors.subText }]}>PLAYING CATEGORY</Text>
                    <Text style={[styles.categoryTitle, { color: themeColors.text }]}>{displayCategory}</Text>
                </View>

                {/* Interactive Player Count Row */}
                <View style={styles.countControlRow}>
                    <Text style={[styles.label, { color: themeColors.text }]}>Number of Players:</Text>

                    <View style={styles.htmlSpinnerContainer}>
                        <TextInput
                            style={[styles.numberInput, { backgroundColor: themeColors.inputBackground, color: themeColors.text }]}
                            keyboardType="numeric"
                            value={numInput}
                            onChangeText={setNumInput}
                            onEndEditing={onSubmitNumInput}
                            maxLength={2}
                        />
                        <View style={styles.spinnerArrows}>
                            <TouchableOpacity onPress={incrementPlayers} style={styles.spinnerBtn}>
                                <Text style={[styles.spinnerBtnText, { color: themeColors.text }]}>^</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={decrementPlayers} style={styles.spinnerBtn}>
                                <Text style={[styles.spinnerBtnText, { color: themeColors.text, transform: [{ rotate: '180deg' }] }]}>^</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Draggable Player List */}
                <View style={styles.listContainer}>
                    <DraggableFlatList
                        data={players}
                        onDragEnd={({ data }) => setPlayers(data)}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListFooterComponent={
                            <TouchableOpacity
                                style={[styles.addButton, { backgroundColor: themeColors.addButton }]}
                                onPress={incrementPlayers}
                            >
                                <Text style={[styles.addText, { color: themeColors.text }]}>+</Text>
                            </TouchableOpacity>
                        }
                    />
                </View>

                {/* Pink Start Game Button */}
                <View style={styles.bottomButtonContainer}>
                    <TouchableOpacity
                        style={[styles.startGameButton, { backgroundColor: themeColors.primaryButton }]}
                        onPress={handleStartGame}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.startGameText, { color: themeColors.text }]}>Start</Text>
                    </TouchableOpacity>
                </View>

            </Animated.View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 24,
    },
    categoryHeader: {
        alignItems: 'center',
        paddingBottom: 16,
        borderBottomWidth: 2,
        marginBottom: 32,
    },
    categoryLabel: {
        fontSize: 12,
        letterSpacing: 1.5,
        marginBottom: 4,
        fontFamily: 'Iosevka-Charon-Medium',
    },
    categoryTitle: {
        fontSize: 32,
        fontFamily: 'Iosevka-Charon-Bold',
        letterSpacing: 1,
    },
    countControlRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        gap: 16,
    },
    label: {
        fontSize: 20,
        fontFamily: 'Iosevka-Charon-Bold',
    },
    htmlSpinnerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    numberInput: {
        fontSize: 20,
        fontFamily: 'Iosevka-Charon-Medium',
        textAlign: 'center',
        width: 48,
        height: 48,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    spinnerArrows: {
        height: 48,
        justifyContent: 'center',
        paddingLeft: 4,
    },
    spinnerBtn: {
        paddingVertical: 2,
        paddingHorizontal: 6,
    },
    spinnerBtnText: {
        fontSize: 16,
        fontFamily: 'Iosevka-Charon-Bold',
    },
    listContainer: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    dragHandleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 50,
        marginRight: 4,
    },
    dragHandleText: {
        fontSize: 32, // Large enough to look like the Figma hamburger
        fontFamily: 'Iosevka-Charon-Medium',
        lineHeight: 32,
        marginTop: -4, // Optical vertical centering for the unicode symbol
    },
    nameInput: {
        flex: 1,
        height: 50,
        fontSize: 18,
        fontFamily: 'Iosevka-Charon-Medium',
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    removeButton: {
        paddingLeft: 16,
        paddingRight: 8,
    },
    removeText: {
        fontSize: 22,
        fontFamily: 'Iosevka-Charon-Bold',
    },
    addButton: {
        alignSelf: 'center',
        width: 56,
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        marginBottom: 20,
    },
    addText: {
        fontSize: 32,
        fontFamily: 'Iosevka-Charon-Bold',
        lineHeight: 36,
    },
    bottomButtonContainer: {
        paddingVertical: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 30,
        backgroundColor: 'transparent',
        alignItems: 'center',
    },
    startGameButton: {
        width: 160,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    startGameText: {
        fontSize: 20,
        fontFamily: 'Iosevka-Charon-Medium',
    }
});
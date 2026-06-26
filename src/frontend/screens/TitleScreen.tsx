import React from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Import the RootStackParamList you exported from index.tsx
// Adjust this path if your files are organized differently!
import { RootStackParamList } from "../../app/index";

// Define the navigation type for this specific screen
type TitleScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "Title"
>;

export default function TitleScreen() {
    // Hook up the navigation with the proper type
    const navigation = useNavigation<TitleScreenNavigationProp>();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Impasta App</Text>

            {/* Structural syntax to move to the next screen */}
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("CategorySelection")}
            >
                <Text style={styles.buttonText}>Play Game</Text>
            </TouchableOpacity>
        </View>
    );
}

// Basic structural styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    button: {
        padding: 12,
        backgroundColor: "#e0e0e0",
        borderRadius: 8,
    },
    buttonText: {
        fontSize: 16,
    },
});
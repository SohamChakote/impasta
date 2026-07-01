// 1. Import the JSON files directly at the top of the file
import foodData from '../resources/categories/foods.json';
import moviesData from '../resources/categories/movies.json';

export type WordItem = {
    word: string;
    hints: string[];
};

// New Type: Specifically for passing a single word and single hint to the UI
export type WordHintPair = {
    word: string;
    hint: string;
};

export type CategoryDetails = {
    data: WordItem[];
    emoji?: string;
    imagePath?: any;
};

// 2. Map the imported variables into your registry
export const CATEGORY_MAP: Record<string, CategoryDetails> = {
    "food": {
        data: foodData, // <-- No more require()!
        emoji: "🍔",
    },
    "movies": {
        data: moviesData,
        emoji: "🎬",
    },
};

export class CategoryHelper {
    categoryName: string;
    wordList: WordItem[];

    constructor(categoryName: string) {
        this.categoryName = categoryName;
        this.wordList = CATEGORY_MAP[categoryName]?.data || [];
    }

    // Helper 1: Gets the raw word object (with all hints)
    getRandomWordData(): WordItem | null {
        if (this.wordList.length === 0) {
            return null;
        }
        const randomIdx = Math.floor(Math.random() * this.wordList.length);
        return this.wordList[randomIdx];
    }

    // Helper 2: Gets exactly one random word and ONE random hint
    getRandomWordAndHint(): WordHintPair {
        const wordData = this.getRandomWordData();

        // Safety fallback just in case the category is empty or broken
        if (!wordData) {
            return { word: "ERROR", hint: "No data found" };
        }

        const chosenWord = wordData.word;
        let chosenHint = "No hint available";

        // Pick a random hint from the array
        if (wordData.hints && wordData.hints.length > 0) {
            const randomHintIdx = Math.floor(Math.random() * wordData.hints.length);
            chosenHint = wordData.hints[randomHintIdx];
        }

        return { word: chosenWord, hint: chosenHint };
    }
}
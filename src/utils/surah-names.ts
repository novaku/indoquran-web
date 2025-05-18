// Utility to provide surah names by ID
import surahMapping from './surah.json';

// Create a reversed mapping from surah number to name
const surahNames: Record<number, string> = {};

// Initialize the mapping
for (const [name, number] of Object.entries(surahMapping)) {
  surahNames[number as number] = name;
}

export default surahNames;

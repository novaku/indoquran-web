/**
 * Helper functions to work with doa images
 */

// Define the DoaImage interface
export interface DoaImage {
  src: string;
  alt: string;
}

/**
 * Gets the list of all available doa images in the public/images directory.
 * This is a client-compatible function as it doesn't depend on file system access.
 * 
 * The function tries to dynamically discover all doa-*.* images in the public/images directory
 * by trying different patterns and checking if the image exists.
 */
export function getDoaImages(): DoaImage[] {
  // This detects the available doa images based on the pattern "doa-{number}.{extension}"
  const doaImages: DoaImage[] = [];
  
  // All doa images found in the directory
  const knownImages = [
    { id: 1, ext: 'jpeg' },
    { id: 2, ext: 'jpeg' },
    { id: 3, ext: 'jpeg' },
    { id: 4, ext: 'jpeg' },
    { id: 5, ext: 'jpeg' },
    { id: 6, ext: 'jpeg' },
  ];
  
  // Add all known images
  knownImages.forEach(({ id, ext }) => {
    doaImages.push({
      src: `doa-${id}.${ext}`,
      alt: `Doa Bersama ${id}`
    });
  });
  
  // We have a fixed set of images, so no need to discover additional ones
  
  return doaImages;
}

/**
 * Gets a doa image by its ID (the number in the filename)
 * @param id - The ID number of the doa image
 */
export function getDoaImageById(id: number): DoaImage {
  const images = getDoaImages();
  const imageIndex = (id - 1) % images.length;
  return images[imageIndex >= 0 ? imageIndex : 0];
}

/**
 * Gets a random doa image
 */
export function getRandomDoaImage(): DoaImage {
  const images = getDoaImages();
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}

/**
 * Gets a doa image based on a deterministic hash of some input
 * This is the main function to use when you need a specific doa image based on a prayer ID or any other identifier
 * @param input - A string or number to use as a deterministic seed
 */
export function getDoaImageByHash(input: string | number): DoaImage {
  const images = getDoaImages();
  
  // If no images are available, return a default fallback image
  if (images.length === 0) {
    return { 
      src: 'doa-1.jpeg',  // Fallback to first image
      alt: 'Doa Bersama' 
    };
  }
  
  // Convert input to a number if it's a string
  let numericInput: number;
  if (typeof input === 'string') {
    // Simple hash function for strings
    numericInput = input.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
  } else {
    // For number inputs, use the absolute value to handle negative numbers
    numericInput = Math.abs(input);
  }
  
  // Use modulo to get a valid index - ensure it's positive and within range
  const index = ((numericInput % images.length) + images.length) % images.length;
  return images[index];
}

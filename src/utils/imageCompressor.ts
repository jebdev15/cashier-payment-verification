import imageCompression from "browser-image-compression";

/**
 * Configuration for image compression
 */
export const IMAGE_COMPRESSION_CONFIG = {
  maxSizeMB: 2, // Maximum size in MB before compression is needed
  targetSizeMB: 2, // Target size after compression
  maxWidthOrHeight: 1920, // Maximum dimension
  useWebWorker: true, // Use web worker for better performance
};

/**
 * Compresses an image file only if it exceeds the size limit
 * @param file - The image file to potentially compress
 * @param maxSizeMB - Maximum file size in MB before compression (default: 2MB)
 * @returns Object containing the processed file and compression info
 */
export async function compressImageIfNeeded(
  file: File,
  maxSizeMB: number = IMAGE_COMPRESSION_CONFIG.maxSizeMB
): Promise<{
  file: File;
  wasCompressed: boolean;
  originalSize: number;
  finalSize: number;
  message: string;
}> {
  const originalSizeBytes = file.size;
  const originalSizeMB = originalSizeBytes / (1024 * 1024);
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // Check if compression is needed
  if (originalSizeBytes <= maxSizeBytes) {
    return {
      file,
      wasCompressed: false,
      originalSize: originalSizeBytes,
      finalSize: originalSizeBytes,
      message: `File size (${originalSizeMB.toFixed(2)} MB) is within the limit. No compression needed.`,
    };
  }

  try {
    // Compress the image
    const compressedFile = await imageCompression(file, {
      maxSizeMB: IMAGE_COMPRESSION_CONFIG.targetSizeMB,
      maxWidthOrHeight: IMAGE_COMPRESSION_CONFIG.maxWidthOrHeight,
      useWebWorker: IMAGE_COMPRESSION_CONFIG.useWebWorker,
    });

    const finalSizeBytes = compressedFile.size;
    const finalSizeMB = finalSizeBytes / (1024 * 1024);
    const compressionRatio = ((1 - finalSizeBytes / originalSizeBytes) * 100).toFixed(1);

    return {
      file: compressedFile,
      wasCompressed: true,
      originalSize: originalSizeBytes,
      finalSize: finalSizeBytes,
      message: `Image compressed from ${originalSizeMB.toFixed(2)} MB to ${finalSizeMB.toFixed(2)} MB (${compressionRatio}% reduction).`,
    };
  } catch (error) {
    console.error("Image compression failed:", error);
    throw new Error("Failed to compress the image. Please try again.");
  }
}

/**
 * Converts a File to a base64 data URL
 * @param file - The file to convert
 * @returns Promise that resolves to the base64 data URL
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Formats file size in bytes to a human-readable string
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB", "500 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

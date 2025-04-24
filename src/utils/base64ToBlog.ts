// Helper function to convert base64 to Blob
export const base64ToBlob = (
  base64: string,
  mimeType: string = "image/jpeg"
): Blob => {
  // Ensure the base64 string is properly split into metadata and actual base64 string
  const [, base64Data] = base64.split(",");

  // Check if base64 data is valid
  if (!base64Data) {
    throw new Error("Invalid base64 string");
  }

  // Decode the base64 string to binary data
  const binaryString = atob(base64Data);

  // Create a byte array
  const byteArray = new Uint8Array(binaryString.length);

  // Convert binary string to byte array
  for (let i = 0; i < binaryString.length; i++) {
    byteArray[i] = binaryString.charCodeAt(i);
  }

  // Return the Blob object with the correct MIME type
  return new Blob([byteArray], { type: mimeType });
};

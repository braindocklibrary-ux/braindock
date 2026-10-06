/**
 * Client-Side Smart Image Compressor
 * Resizes large camera/phone photos to standard profile dimensions and compresses to lightweight JPEG.
 * Zero external libraries needed - uses native HTML5 Canvas.
 */
export const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.78) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image.'));
    }

    const originalSizeKB = Math.round(file.size / 1024);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while bounding within maxWidth/maxHeight
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Clean white background for transparency fallback
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

        // Calculate compressed size in KB from base64 string
        const base64Length = compressedDataUrl.length - (compressedDataUrl.indexOf(',') + 1);
        const compressedSizeKB = Math.round((base64Length * 3) / 4 / 1024);

        resolve({
          dataUrl: compressedDataUrl,
          originalSizeKB,
          compressedSizeKB,
          width,
          height,
          savingsPercent: originalSizeKB > 0 ? Math.max(0, Math.round(((originalSizeKB - compressedSizeKB) / originalSizeKB) * 100)) : 0
        });
      };

      img.onerror = (err) => reject(new Error('Failed to load image file.'));
      img.src = event.target.result;
    };

    reader.onerror = (err) => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
};

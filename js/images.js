// Procesado local de fotos: se reducen en el propio teléfono antes de guardarlas.
// Nada se sube a ningún servidor.

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen'));
    };
    img.src = url;
  });
}

/**
 * Redimensiona manteniendo proporción. square=true recorta al centro (fotos de perfil).
 * Devuelve un Blob JPEG.
 */
export async function resizeImage(file, { max = 640, square = false, quality = 0.85 } = {}) {
  if (!file || !file.type || !file.type.startsWith('image/')) throw new Error('El archivo no es una imagen');
  let source;
  try {
    source = 'createImageBitmap' in self ? await createImageBitmap(file, { imageOrientation: 'from-image' }) : await loadImageElement(file);
  } catch {
    source = await loadImageElement(file);
  }
  const sw = source.width;
  const sh = source.height;
  let sx = 0, sy = 0, cw = sw, ch = sh;
  if (square) {
    const side = Math.min(sw, sh);
    sx = (sw - side) / 2;
    sy = (sh - side) / 2;
    cw = ch = side;
  }
  const scale = Math.min(1, max / Math.max(cw, ch));
  const w = Math.round(cw * scale);
  const h = Math.round(ch * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(source, sx, sy, cw, ch, 0, 0, w, h);
  if (source.close) source.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo procesar la imagen'))), 'image/jpeg', quality);
  });
}

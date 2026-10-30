import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';

/**
 * Without this, className is ignored and the image renders at 0x0.
 * Import Image from here rather than directly from 'expo-image'.
 */
cssInterop(Image, { className: 'style' });

export { Image };

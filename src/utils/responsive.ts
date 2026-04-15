/**
 * ─── Ammarli Responsive Scaling Utility ───────────────────────────────────────
 *
 * Usage:
 *   import { s, vs, ms, mf, wp, hp } from '../../src/utils/responsive';
 *
 *   fontSize: mf(16)       → font size scales moderately (most common for text)
 *   padding: s(20)         → scales horizontally with screen width
 *   height: vs(60)         → scales vertically with screen height
 *   width: wp(90)          → 90% of screen width
 *   height: hp(30)         → 30% of screen height
 */

import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── 1. Base design dimensions (designed for iPhone 14 / ~390pt width) ──────────
const BASE_WIDTH  = 390;
const BASE_HEIGHT = 844;

// ── 2. Scale ratios ─────────────────────────────────────────────────────────────
const widthRatio  = SCREEN_W / BASE_WIDTH;
const heightRatio = SCREEN_H / BASE_HEIGHT;

/**
 * Horizontal scale — use for padding, margin, width, borderRadius
 * Grows proportionally with screen width.
 */
export const s = (size: number): number =>
    Math.round(PixelRatio.roundToNearestPixel(size * widthRatio));

/**
 * Vertical scale — use for height, vertical padding/margin
 * Grows proportionally with screen height.
 */
export const vs = (size: number): number =>
    Math.round(PixelRatio.roundToNearestPixel(size * heightRatio));

/**
 * Moderate scale — use for fontSize and icon sizes.
 * factor: 0 = no scaling, 0.5 = moderate (default), 1 = full scaling
 * This prevents fonts from becoming too large on tablets.
 */
export const ms = (size: number, factor = 0.5): number =>
    Math.round(PixelRatio.roundToNearestPixel(size + (s(size) - size) * factor));

/**
 * Font scale (alias for ms with factor 0.4 — slightly conservative for text)
 */
export const mf = (size: number): number => ms(size, 0.4);

/**
 * Width percentage — use for container/card widths
 * e.g., wp(90) = 90% of screen width
 */
export const wp = (percent: number): number =>
    Math.round(PixelRatio.roundToNearestPixel((SCREEN_W * percent) / 100));

/**
 * Height percentage — use for full-screen sections
 * e.g., hp(50) = 50% of screen height
 */
export const hp = (percent: number): number =>
    Math.round(PixelRatio.roundToNearestPixel((SCREEN_H * percent) / 100));

/**
 * Screen dimensions (for quick access)
 */
export const SCREEN = {
    width:  SCREEN_W,
    height: SCREEN_H,
    isSmall:  SCREEN_W < 375,   // iPhone SE
    isMedium: SCREEN_W >= 375 && SCREEN_W < 414,  // iPhone 14, Pixel 7
    isLarge:  SCREEN_W >= 414 && SCREEN_W < 768,  // Plus/Max models
    isTablet: SCREEN_W >= 768,  // iPad, Galaxy Tab
};

/**
 * Returns the recommended number of grid columns based on screen width
 */
export const getGridColumns = (): number => {
    if (SCREEN.isTablet) return 3;
    if (SCREEN.isLarge) return 2;
    return 2;
};

export default { s, vs, ms, mf, wp, hp, SCREEN, getGridColumns };

/**
 * responsive.ts
 * Shared breakpoint & layout utilities for adaptive UI
 */
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/** Raw screen dimensions */
export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

/** Width percentage — e.g. wp(50) = 50% of screen width */
export const wp = (percent: number) => (SCREEN_WIDTH * percent) / 100;

/** Height percentage — e.g. hp(10) = 10% of screen height */
export const hp = (percent: number) => (SCREEN_HEIGHT * percent) / 100;


/** True if running on a tablet / large screen (>= 600dp) */
export const isTablet = SCREEN_WIDTH >= 600;

/**
 * Maximum content width for large screens.
 * Content is capped at 680dp and centred; on phones it defaults to 100%.
 */
export const MAX_CONTENT_WIDTH = 680;

/**
 * Returns the number of grid columns appropriate for the screen width.
 * Phones → 2 cols, Tablets → 4 cols
 */
export function getGridColumns(): number {
    if (SCREEN_WIDTH >= 900) return 4;
    if (SCREEN_WIDTH >= 600) return 3;
    return 2;
}

/**
 * Inline style helper that centres content and constrains its width on tablets.
 */
export const centredContainer = {
    width: '100%' as const,
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center' as const,
};

# Styling & Theme Architecture

**Project:** Smushy
**Last Updated:** 2026-01-05

## Overview

Smushy uses **NativeWind** (Tailwind CSS for React Native) with **Reanimated** for animations. This doc covers Smushy-specific patterns only—standard Tailwind/Reanimated usage is assumed knowledge.

---

## Custom Text Component (Critical)

React Native does NOT support CSS font inheritance. Each Text element needs explicit font configuration.

**Always import Text from shared components:**
```typescript
import { Text } from '@/shared/components';
// NOT from 'react-native'
```

**How it works:**
- Provides default Nunito_400Regular font when no font class is specified
- Use NativeWind `font-sans-*` classes for different weights

**Font family classes:**

| Class | Weight | Font Family |
|-------|--------|-------------|
| (none) | 400 | Nunito_400Regular (default) |
| `font-sans` | 400 | Nunito_400Regular |
| `font-sans-medium` | 500 | Nunito_500Medium |
| `font-sans-semibold` | 600 | Nunito_600SemiBold |
| `font-sans-bold` | 700 | Nunito_700Bold |

**Location:** `src/shared/components/ui/Text.tsx`

---

## Base Layout & Press Feedback

- **`Screen`** (`src/shared/components/layout/Screen.tsx`) owns the soft background wash. Don't add a `LinearGradient` per screen; pass `plain` to opt out.
- **`ScreenHeader`**: `largeTitle` for tab roots (left-aligned, no background), compact otherwise (centered title, hairline divider). No looping or decorative animation.
- **`PressableScale`** (`src/shared/components/ui/PressableScale.tsx`) is the default for anything tappable: scale to ~0.97 + slight fade on press, spring back on release, optional `haptic="light" | "selection"`. Respects reduced motion. Keep `scaleTo` close to 1; feedback should be felt, not seen.
- NativeWind interop is registered on `PressableScale`'s plain inner component, not on the Reanimated component. Registering the animated component directly drops both `className` and `style`.

## Images (expo-image + className)

NativeWind only applies `className` to components registered with `cssInterop`. `expo-image` isn't registered by default, so `<Image className="w-20 h-20" />` imported from `'expo-image'` silently renders at **0x0**.

Always import the shared wrapper, which registers it:

```typescript
import { Image } from '@/shared/components/ui/Image';

<Image source={{ uri }} className="w-20 h-20 rounded-lg" contentFit="cover" />
```

**Location:** `src/shared/components/ui/Image.tsx`

---

## Animated.Text Limitation

`Animated.Text` from Reanimated does NOT use our custom Text component. You must manually set fontFamily:

```typescript
import Animated from 'react-native-reanimated';
import { StyleSheet } from 'react-native';

<Animated.Text style={styles.animatedText}>
  Animated content
</Animated.Text>

const styles = StyleSheet.create({
  animatedText: {
    fontFamily: 'Nunito_500Medium', // Must be explicit
    // textShadow properties also require StyleSheet
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
```

---

## Safe Area Handling (Edge-to-Edge)

Smushy uses edge-to-edge design where backgrounds extend behind system bars.

**Two-component approach:**
1. **Screen component** - Edge-to-edge container with theme background (no safe area padding)
2. **SafeAreaView** - Applied selectively to content

```typescript
import { Screen } from '@/shared/components/layout/Screen';
import { SafeAreaView } from 'react-native-safe-area-context';

function MyScreen() {
  return (
    <Screen>
      {/* Background extends edge-to-edge */}
      <SafeAreaView>
        {/* Content respects safe areas */}
      </SafeAreaView>
    </Screen>
  );
}
```

**Location:** `src/shared/components/layout/Screen.tsx`

---

## Theme System

**Source of Truth:** `src/shared/theme/presets.ts`

Three themes, picked in Profile → Appearance:
- **Coral** (`default`): dusty coral and soft peach on warm cream
- **Serene** (`serene`): a relaxing cornflower blue with soft sky tones
- **Forest** (`forest`): warm moss and honey-bark on soft sage cream

Each theme tints its background, surfaces, borders and text greys, not just the accents.

**Accents** (`getAccent(colors, 'primary' | 'secondary' | 'sage' | 'mist')` in `src/shared/theme/accents.ts`) bring the theme's other colours in lightly. Use them only on small elements: icon tiles, dots, type tags. Current assignments: moment types (date/anniversary → primary, trip → mist, milestone → secondary, ritual → sage), ritual frequency icons, Profile setting tiles, Add sheet tiles, Story check-in dots, tab bar active dot.

**No emoji as UI labels.** Categories are plain text with an accent dot or tint; emoji are reserved for check-in moods. Keep contrast soft but readable: body text ≥ 4.5:1, white button text ≥ 3:1. Small text links use `primaryDark`, since `primary` on the background is only ~3:1.

### Using Theme Colors

```typescript
const { currentTheme } = useTheme();

<View style={{ backgroundColor: currentTheme.colors.primary }}>
  <Text style={{ color: currentTheme.colors.text.primary }}>
    Theme-aware text
  </Text>
</View>
```

**Available tokens:**
- `colors.primary` / `primaryDark` / `primaryLight`
- `colors.secondary` / `secondaryDark` / `secondaryLight`
- `colors.background` / `surface` / `surfaceVariant`
- `colors.border` / `borderLight`
- `colors.text.primary` / `secondary` / `disabled` / `inverse`
- `colors.error` / `success` / `warning` / `info`

### When to Use What

| Use | For |
|-----|-----|
| **NativeWind className** | Layout, spacing, sizing, font weights, text sizing, border radius, opacity |
| **Inline style** | Dynamic theme colors, computed values |
| **StyleSheet.create** | `textShadow*`, complex RGBA borders, `Animated.Text` fontFamily |

### Hybrid Pattern (className + inline style)

Use className for layout, inline style for dynamic theme colors:

```typescript
const { currentTheme } = useTheme();

// Layout via NativeWind, colors via inline style
<Pressable
  className="items-center justify-center rounded-lg px-6 py-3"
  style={{ backgroundColor: currentTheme.colors.primary }}
>
  <Text
    className="font-sans-semibold text-base"
    style={{ color: currentTheme.colors.text.inverse }}
  >
    Button Text
  </Text>
</Pressable>
```

---

## NativeWind v4 Setup

### Required Configuration

**`metro.config.js`** - Critical for NativeWind v4:
```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./global.css",
  inlineRem: 16, // 16px base - ensures correct font sizes
});
```

**`nativewind-env.d.ts`:**
```typescript
/// <reference types="nativewind/types" />
```

**`global.css`:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Font Loading

Fonts are loaded in `src/app/_layout.tsx`:

```typescript
import { useFonts } from 'expo-font';
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  if (!fontsLoaded) return null;
  // ...
}
```

### Troubleshooting

- **Styles not applying:** Ensure `metro.config.js` has `withNativeWind()`
- **Fonts look small:** Check `inlineRem: 16` is set
- **After setup changes:** Clear cache with `npx expo start --clear`
- **Version requirement:** NativeWind v4.2.0+ for Expo SDK 54 + Reanimated v4

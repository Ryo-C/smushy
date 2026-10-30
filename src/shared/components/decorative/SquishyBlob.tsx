import React, { useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface BlobPoint {
  x: number;
  y: number;
}

interface BlobCurve {
  c1: BlobPoint;
  c2: BlobPoint;
  end: BlobPoint;
}

interface WaveConfig {
  amplitude: number;
  frequency: number;
  phase: number;
  nx: number;
  ny: number;
}

const BASE_BLOB: {
  start: BlobPoint;
  curves: BlobCurve[];
} = {
  start: { x: 45, y: 8 },
  curves: [
    { c1: { x: 65, y: 5 }, c2: { x: 85, y: 18 }, end: { x: 90, y: 40 } },
    { c1: { x: 95, y: 62 }, c2: { x: 82, y: 85 }, end: { x: 58, y: 92 } },
    { c1: { x: 34, y: 99 }, c2: { x: 12, y: 82 }, end: { x: 8, y: 58 } },
    { c1: { x: 4, y: 34 }, c2: { x: 18, y: 12 }, end: { x: 45, y: 8 } },
  ],
};

const CENTER = { x: 50, y: 50 };

function computeRadialDirection(point: BlobPoint): { nx: number; ny: number } {
  const dx = point.x - CENTER.x;
  const dy = point.y - CENTER.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return { nx: 0, ny: 0 };
  return { nx: dx / dist, ny: dy / dist };
}

const ALL_POINTS: BlobPoint[] = [
  BASE_BLOB.start,
  BASE_BLOB.curves[0].c1, BASE_BLOB.curves[0].c2, BASE_BLOB.curves[0].end,
  BASE_BLOB.curves[1].c1, BASE_BLOB.curves[1].c2, BASE_BLOB.curves[1].end,
  BASE_BLOB.curves[2].c1, BASE_BLOB.curves[2].c2, BASE_BLOB.curves[2].end,
  BASE_BLOB.curves[3].c1, BASE_BLOB.curves[3].c2,
  // Note: curves[3].end reuses start point config
];

const RADIAL_DIRECTIONS = ALL_POINTS.map(computeRadialDirection);

type SquishyBlobVariant = 'float' | 'drift';
type WobbleStyle = 'regular' | 'organic';

interface SquishyBlobProps {
  position: { x: number; y: number };
  size: number;
  color: string;
  opacity: number;
  delay?: number;
  variant?: SquishyBlobVariant;
  driftDuration?: number;
  sizeRange?: [number, number];
  opacityRange?: [number, number];
  wobbleStyle?: WobbleStyle;
}

export function SquishyBlob({
  position,
  size,
  color,
  opacity,
  delay = 0,
  variant = 'float',
  driftDuration = 30000,
  sizeRange,
  opacityRange,
  wobbleStyle = 'regular',
}: SquishyBlobProps) {
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();

  const initialX = position.x * width - size / 2;
  const initialY = position.y * height - size / 2;

  const [scaleMin, scaleMax] = sizeRange ?? [0.9, 1.1];
  const [opacityMin, opacityMax] = opacityRange ?? [opacity * 0.7, opacity * 1.3];

  const config = useMemo(() => {
    const seed = (delay % 5000) / 5000;
    return {
      seed,
      floatY: 8000 + seed * 4000,
      floatYRadius: 25 + seed * 15,
      driftDown: driftDuration,
      wobbleX: 12000 + seed * 6000,
      wobbleRadius: 15 + seed * 10,
      opacityDuration: 18000 + seed * 6000,
      scaleDuration: 10000 + seed * 5000,
      waveDuration: 4000 + seed * 2000,
      wobbleDuration1: 7000 + seed * 2000,
      wobbleDuration2: 11000 + seed * 3000,
      wobbleDuration3: 17000 + seed * 4000,
    };
  }, [delay, driftDuration]);

  const waveConfigs = useMemo((): WaveConfig[] => {
    const seed = (delay % 5000) / 5000;
    const amplitudes = [
      5 + seed * 3, 7 + seed * 3, 8 + seed * 4, 6 + seed * 3,
      9 + seed * 3, 6 + seed * 4, 7 + seed * 3, 8 + seed * 4,
      6 + seed * 3, 9 + seed * 3, 7 + seed * 4, 8 + seed * 3,
    ];
    const frequencies = [1.0, 1.7, 0.6, 1.3, 0.5, 1.9, 0.8, 1.4, 0.7, 1.1, 0.55, 1.6];
    const phases = [0, 0.15, 0.7, 1.1, 0.4, 1.6, 0.9, 1.3, 0.2, 1.8, 0.5, 1.4].map(p => Math.PI * p);

    return amplitudes.map((amplitude, i) => ({
      amplitude,
      frequency: frequencies[i],
      phase: phases[i],
      nx: RADIAL_DIRECTIONS[i].nx,
      ny: RADIAL_DIRECTIONS[i].ny,
    }));
  }, [delay]);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacityValue = useSharedValue(opacity);
  const waveTime = useSharedValue(0);
  const wobbleTime = useSharedValue(0);

  // Start animations after delay (only runs once per mount)
  React.useEffect(() => {
    if (reduceMotion) {
      translateX.value = 0;
      translateY.value = 0;
      scale.value = 1;
      opacityValue.value = opacity;
      waveTime.value = 0;
      wobbleTime.value = 0;
      return;
    }

    const timeout = setTimeout(() => {
      if (variant === 'drift') {
        translateY.value = withRepeat(
          withTiming(height + size, { duration: config.driftDown, easing: Easing.linear }),
          -1, false
        );
      } else {
        translateY.value = withRepeat(
          withSequence(
            withTiming(config.floatYRadius, { duration: config.floatY / 2, easing: Easing.inOut(Easing.sin) }),
            withTiming(-config.floatYRadius, { duration: config.floatY / 2, easing: Easing.inOut(Easing.sin) })
          ),
          -1, true
        );
      }

      if (wobbleStyle === 'organic') {
        wobbleTime.value = withRepeat(
          withTiming(Math.PI * 2, { duration: config.wobbleDuration1, easing: Easing.linear }),
          -1, false
        );
      } else {
        translateX.value = withRepeat(
          withSequence(
            withTiming(config.wobbleRadius, { duration: config.wobbleX / 2, easing: Easing.inOut(Easing.sin) }),
            withTiming(-config.wobbleRadius, { duration: config.wobbleX / 2, easing: Easing.inOut(Easing.sin) })
          ),
          -1, true
        );
      }

      opacityValue.value = withRepeat(
        withSequence(
          withTiming(opacityMax, { duration: config.opacityDuration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(opacityMin, { duration: config.opacityDuration / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1, true
      );

      scale.value = withRepeat(
        withSequence(
          withTiming(scaleMax, { duration: config.scaleDuration / 2, easing: Easing.inOut(Easing.sin) }),
          withTiming(scaleMin, { duration: config.scaleDuration / 2, easing: Easing.inOut(Easing.sin) })
        ),
        -1, true
      );

      waveTime.value = withRepeat(
        withTiming(Math.PI * 2, { duration: config.waveDuration, easing: Easing.inOut(Easing.ease) }),
        -1, true
      );
    }, delay);

    return () => clearTimeout(timeout);
  }, [reduceMotion, delay, config, opacity, variant, height, size, scaleMin, scaleMax, opacityMin, opacityMax, wobbleStyle]);

  const animatedPathProps = useAnimatedProps(() => {
    'worklet';
    const t = waveTime.value;

    const waveX = (baseX: number, cfg: WaveConfig): number => {
      const displacement = cfg.amplitude * Math.sin(t * cfg.frequency + cfg.phase);
      return baseX + cfg.nx * displacement;
    };
    const waveY = (baseY: number, cfg: WaveConfig): number => {
      const displacement = cfg.amplitude * Math.sin(t * cfg.frequency + cfg.phase);
      return baseY + cfg.ny * displacement;
    };

    const cfg = waveConfigs;
    const startX = waveX(45, cfg[0]).toFixed(1);
    const startY = waveY(8, cfg[0]).toFixed(1);

    const d = `M${startX},${startY} ` +
      `C${waveX(65, cfg[1]).toFixed(1)},${waveY(5, cfg[1]).toFixed(1)} ` +
      `${waveX(85, cfg[2]).toFixed(1)},${waveY(18, cfg[2]).toFixed(1)} ` +
      `${waveX(90, cfg[3]).toFixed(1)},${waveY(40, cfg[3]).toFixed(1)} ` +
      `C${waveX(95, cfg[4]).toFixed(1)},${waveY(62, cfg[4]).toFixed(1)} ` +
      `${waveX(82, cfg[5]).toFixed(1)},${waveY(85, cfg[5]).toFixed(1)} ` +
      `${waveX(58, cfg[6]).toFixed(1)},${waveY(92, cfg[6]).toFixed(1)} ` +
      `C${waveX(34, cfg[7]).toFixed(1)},${waveY(99, cfg[7]).toFixed(1)} ` +
      `${waveX(12, cfg[8]).toFixed(1)},${waveY(82, cfg[8]).toFixed(1)} ` +
      `${waveX(8, cfg[9]).toFixed(1)},${waveY(58, cfg[9]).toFixed(1)} ` +
      `C${waveX(4, cfg[10]).toFixed(1)},${waveY(34, cfg[10]).toFixed(1)} ` +
      `${waveX(18, cfg[11]).toFixed(1)},${waveY(12, cfg[11]).toFixed(1)} ` +
      `${waveX(45, cfg[0]).toFixed(1)},${waveY(8, cfg[0]).toFixed(1)} Z`;

    return { d };
  }, [waveConfigs]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    'worklet';
    const computedTranslateX = wobbleStyle === 'organic'
      ? (Math.sin(wobbleTime.value) * config.wobbleRadius * 0.5 +
         Math.sin(wobbleTime.value * 1.57) * config.wobbleRadius * 0.35 + // ~π/2 phase
         Math.sin(wobbleTime.value * 2.43) * config.wobbleRadius * 0.25)  // ~π*0.77 phase
      : translateX.value;

    return {
      transform: [
        { translateX: computedTranslateX },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacityValue.value,
    };
  }, [wobbleStyle, config.wobbleRadius]);

  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(800)}
      style={[styles.container, { left: initialX, top: initialY, width: size, height: size }]}
      pointerEvents="none"
    >
      <Animated.View style={[styles.inner, animatedContainerStyle]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <AnimatedPath animatedProps={animatedPathProps} fill={color} />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  inner: {
    flex: 1,
  },
});

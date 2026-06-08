import React, { useEffect, useRef, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Circle } from 'react-native-svg';
import { useTheme } from '../../theme/useTheme';
import { fadeIn, slideInLeft } from '../../utils/animations';

interface SalesAreaChartProps {
  data: number[];
  target?: number[];
  labels: string[];
  width: number;
  height?: number;
}

function formatPkr(n: number) {
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

function buildSmoothPath(
  values: number[],
  width: number,
  height: number,
  padX: number,
  padY: number,
  min: number,
  max: number
) {
  const coords = values.map((v, i) => {
    const x = padX + (i / Math.max(values.length - 1, 1)) * (width - padX * 2);
    const y = height - padY - ((v - min) / (max - min || 1)) * (height - padY * 2);
    return { x, y };
  });
  let d = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const cpx = (coords[i - 1].x + coords[i].x) / 2;
    d += ` Q ${cpx} ${coords[i - 1].y} ${coords[i].x} ${coords[i].y}`;
  }
  return { d, coords, area: `${d} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z` };
}

export const SalesAreaChart = ({
  data,
  target,
  labels,
  width,
  height = 168,
}: SalesAreaChartProps) => {
  const T = useTheme();
  const padLeft = 44;
  const padRight = 12;
  const padTop = 12;
  const padBottom = 28;
  const chartW = width - padLeft - padRight;

  const allVals = target ? [...data, ...target] : data;
  const minV = Math.min(...allVals) * 0.92;
  const maxV = Math.max(...allVals) * 1.05;

  const revenue = useMemo(
    () => buildSmoothPath(data, width, height, padLeft, padTop, minV, maxV),
    [data, width, height, minV, maxV]
  );
  const targetPath = useMemo(() => {
    if (!target) return null;
    return buildSmoothPath(target, width, height, padLeft, padTop, minV, maxV);
  }, [target, width, height, minV, maxV]);

  const pathLen = chartW * 2.2;
  const lineDraw = useRef(new Animated.Value(pathLen)).current;
  const gridOpacity = useRef(new Animated.Value(0)).current;
  const yLabelSlide = useRef(new Animated.Value(-12)).current;
  const [dashOffset, setDashOffset] = useState(pathLen);

  const yTicks = useMemo(() => {
    const steps = 4;
    return Array.from({ length: steps + 1 }, (_, i) => minV + ((maxV - minV) * i) / steps);
  }, [minV, maxV]);

  useEffect(() => {
    lineDraw.setValue(pathLen);
    const id = lineDraw.addListener(({ value }) => setDashOffset(value));
    Animated.timing(lineDraw, {
      toValue: 0,
      duration: 1000,
      delay: 600,
      useNativeDriver: false,
    }).start();
    fadeIn(gridOpacity, 700, 400).start();
    yLabelSlide.setValue(-12);
    slideInLeft(yLabelSlide, 800, 400).start();
    return () => lineDraw.removeListener(id);
  }, [pathLen]);

  const yLabelX = yLabelSlide;

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: T.text }]}>Weekly Revenue</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: T.accent }]} />
          <Text style={[styles.legendText, { color: T.textSecondary }]}>Actual</Text>
          {target ? (
            <>
              <View style={[styles.legendDot, { backgroundColor: T.textMuted, marginLeft: 10 }]} />
              <Text style={[styles.legendText, { color: T.textSecondary }]}>Target</Text>
            </>
          ) : null}
        </View>
      </View>
      <Animated.View style={{ opacity: gridOpacity }}>
        <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={T.accent} stopOpacity={0.35} />
            <Stop offset="100%" stopColor={T.accent} stopOpacity={0.02} />
          </LinearGradient>
        </Defs>
        {yTicks.map((_, i) => {
          const y = padTop + ((height - padTop - padBottom) * i) / (yTicks.length - 1);
          return (
            <Line
              key={`grid-${i}`}
              x1={padLeft}
              y1={y}
              x2={width - padRight}
              y2={y}
              stroke={T.divider}
              strokeWidth={1}
            />
          );
        })}
        <Path d={revenue.area} fill="url(#revGrad)" />
        {targetPath ? (
          <Path
            d={targetPath.d}
            fill="none"
            stroke={T.textMuted}
            strokeWidth={1.5}
            strokeDasharray="6 4"
            opacity={0.7}
          />
        ) : null}
        <Path
          d={revenue.d}
          fill="none"
          stroke={T.accent}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={`${pathLen}`}
          strokeDashoffset={dashOffset}
        />
        {revenue.coords.map((c, i) => (
          <Circle
            key={`pt-${i}`}
            cx={c.x}
            cy={c.y}
            r={i === revenue.coords.length - 1 ? 5 : 3.5}
            fill={T.card}
            stroke={T.accent}
            strokeWidth={2}
          />
        ))}
        </Svg>
      </Animated.View>
      <View style={[styles.yLabels, { height }]}>
        {yTicks.slice().reverse().map((tick, i) => (
          <Animated.Text
            key={i}
            style={[
              styles.yLabel,
              {
                color: T.textMuted,
                transform: [{ translateX: yLabelX }],
              },
            ]}
          >
            {formatPkr(tick)}
          </Animated.Text>
        ))}
      </View>
      <View style={[styles.xLabels, { paddingLeft: padLeft, paddingRight: padRight }]}>
        {labels.map((l) => (
          <Text key={l} style={[styles.xLabel, { color: T.textMuted }]}>
            {l}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 16, fontWeight: '600' },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  legendText: { fontSize: 11 },
  yLabels: {
    position: 'absolute',
    left: 0,
    top: 36,
    width: 40,
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  yLabel: { fontSize: 9, fontWeight: '500' },
  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  xLabel: { fontSize: 10, fontWeight: '500' },
});

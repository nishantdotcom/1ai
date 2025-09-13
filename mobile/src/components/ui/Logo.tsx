import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { G, Path, Defs, Filter, ClipPath, Rect, FeFlood, FeBlend, FeColorMatrix, FeOffset, FeGaussianBlur, FeComposite } from 'react-native-svg';

interface LogoProps {
  size?: number;
  style?: any;
}

export const Logo: React.FC<LogoProps> = ({ size = 40, style }) => {
  return (
    <View style={[styles.container, { width: size, height: size * 0.6 }, style]}>
      <Svg
        width={size}
        height={size * 0.6}
        viewBox="0 0 161 99"
        fill="none"
      >
        <G clipPath="url(#clip0_23_49)">
          <G filter="url(#filter0_iii_23_49)">
            <Path
              d="M1.08594 49.944C1.08594 23.4342 22.5763 1.94391 49.0859 1.94391H112.086C138.596 1.94391 160.086 23.4342 160.086 49.944V97.944H49.0859C22.5763 97.944 1.08594 76.4537 1.08594 49.944Z"
              fill="#FFDD00"
            />
          </G>
          <Path
            d="M112.086 19.944H49.0858C32.5174 19.944 19.0859 33.3754 19.0859 49.944C19.0859 66.5124 32.5174 79.944 49.0858 79.944H112.086C128.654 79.944 142.086 66.5124 142.086 49.944C142.086 33.3754 128.654 19.944 112.086 19.944Z"
            fill="white"
          />
          <Path
            d="M49.0859 64.944C57.3703 64.944 64.0859 58.228 64.0859 49.944C64.0859 41.6596 57.3703 34.944 49.0859 34.944C40.8019 34.944 34.0859 41.6596 34.0859 49.944C34.0859 58.228 40.8019 64.944 49.0859 64.944Z"
            fill="black"
          />
          <Path
            d="M43.0859 46.944C44.7429 46.944 46.0859 45.6007 46.0859 43.944C46.0859 42.287 44.7429 40.944 43.0859 40.944C41.4292 40.944 40.0859 42.287 40.0859 43.944C40.0859 45.6007 41.4292 46.944 43.0859 46.944Z"
            fill="white"
          />
          <Path
            d="M115.086 64.944C123.37 64.944 130.086 58.228 130.086 49.944C130.086 41.6596 123.37 34.944 115.086 34.944C106.802 34.944 100.086 41.6596 100.086 49.944C100.086 58.228 106.802 64.944 115.086 64.944Z"
            fill="black"
          />
          <Path
            d="M109.086 46.944C110.743 46.944 112.086 45.6007 112.086 43.944C112.086 42.287 110.743 40.944 109.086 40.944C107.429 40.944 106.086 42.287 106.086 43.944C106.086 45.6007 107.429 46.944 109.086 46.944Z"
            fill="#FAFCFF"
          />
        </G>
        <Defs>
          <ClipPath id="clip0_23_49">
            <Rect
              width="160.8"
              height="98.4"
              fill="white"
              transform="matrix(-1 0 0 1 160.8 0)"
            />
          </ClipPath>
        </Defs>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
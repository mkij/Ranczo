import { Text, TextProps, StyleSheet } from 'react-native';
import { FONT_SCALES } from '../constants/theme';
import { useSettingsStore } from '../stores/settingsStore';

export function ScaledText({ style, ...props }: TextProps) {
  const fontScale = useSettingsStore((s) => s.fontScale);
  const multiplier = FONT_SCALES[fontScale];

  const flatStyle = StyleSheet.flatten(style);
  const baseFontSize = flatStyle?.fontSize ?? 14;
  const scaledFontSize = Math.round(baseFontSize * multiplier);

  const lineHeight = flatStyle?.lineHeight
    ? Math.round(flatStyle.lineHeight * multiplier)
    : undefined;

  return (
    <Text
      {...props}
      style={[style, { fontSize: scaledFontSize, lineHeight }]}
    />
  );
}
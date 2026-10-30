import type { Theme } from './types';

export const defaultTheme: Theme = {
  id: 'default',
  name: 'Coral',
  description: 'Dusty coral and soft peach on warm cream. Low contrast, easy on the eyes',
  colors: {
    primary: '#D77B62',
    primaryDark: '#BF6A53',
    primaryLight: '#F2C2B0',

    secondary: '#EDB98C',
    secondaryDark: '#D9A274',
    secondaryLight: '#FAE5D3',

    background: '#FCF8F4',
    surface: '#FFFDFB',
    surfaceVariant: '#FAF0E8',

    border: '#EFE3DA',
    borderLight: '#F7ECE4',

    text: {
      primary: '#3A2F2B',
      secondary: '#7A6A64',
      disabled: '#C9BCB5',
      inverse: '#FFFFFF',
    },

    error: '#C9625F',
    errorLight: '#F6DCDA',
    success: '#86AE97',
    successLight: '#E0EDE5',
    warning: '#E2AE68',
    warningLight: '#F9EAD3',
    info: '#7E98B8',
    infoLight: '#E2E9F3',
  },
};

export const sereneTheme: Theme = {
  id: 'serene',
  name: 'Serene',
  description: 'A relaxing cornflower blue with soft sky tones',
  colors: {
    primary: '#6384BD',
    primaryDark: '#4D6CA3',
    primaryLight: '#B9CBE8',

    secondary: '#9DBCE0',
    secondaryDark: '#6F95C4',
    secondaryLight: '#DCE8F6',

    background: '#EEF3FA',
    surface: '#F8FAFD',
    surfaceVariant: '#E6EDF7',

    border: '#D7E1EE',
    borderLight: '#E3EAF4',

    text: {
      primary: '#263142',
      secondary: '#5A6880',
      disabled: '#A8B4C6',
      inverse: '#FFFFFF',
    },

    error: '#C26A6E',
    errorLight: '#F3DFE0',
    success: '#7EA393',
    successLight: '#DCE9E3',
    warning: '#CFA866',
    warningLight: '#F3EAD8',
    info: '#8C8FC4',
    infoLight: '#E5E5F4',
  },
};

export const forestTheme: Theme = {
  id: 'forest',
  name: 'Forest',
  description: 'Warm moss and fern with honey-bark light, on soft sage cream',
  colors: {
    primary: '#5A7F48',
    primaryDark: '#456A3A',
    primaryLight: '#B5CBA4',

    secondary: '#CBA15E',
    secondaryDark: '#AC844A',
    secondaryLight: '#F1E3C8',

    background: '#F6F5EE',
    surface: '#FFFEFA',
    surfaceVariant: '#EFF0E4',

    border: '#E0E1D2',
    borderLight: '#EAEBDF',

    text: {
      primary: '#24261F',
      secondary: '#636A5B',
      disabled: '#B6BAAC',
      inverse: '#FFFFFF',
    },

    error: '#C0574A',
    errorLight: '#F5DAD5',
    success: '#7C9E68',
    successLight: '#E0EBD8',
    warning: '#D29E44',
    warningLight: '#F5E8CB',
    info: '#6F8E8C',
    infoLight: '#DDE8E6',
  },
};

export const themes: Theme[] = [defaultTheme, sereneTheme, forestTheme];

export function getThemeById(id: string): Theme {
  const theme = themes.find((t) => t.id === id);
  return theme || defaultTheme;
}

export function getDefaultTheme(): Theme {
  return defaultTheme;
}

export function getAvailableThemeIds(): string[] {
  return themes.map((t) => t.id);
}

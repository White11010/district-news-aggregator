import type { GlobalThemeOverrides } from 'naive-ui'

export const themeOverrides: GlobalThemeOverrides = {
  common: {
    fontFamily: "'Manrope', system-ui, sans-serif",
    primaryColor: '#1f4b7a',
    primaryColorHover: '#2a5f96',
    primaryColorPressed: '#16365a',
    primaryColorSuppl: '#2a5f96',
    borderRadius: '10px',
    successColor: '#2f6f4e',
  },
  Tag: {
    borderRadius: '999px',
    heightLarge: '44px',
    paddingLarge: '0 16px',
    fontSizeLarge: '15px',
  },
  Button: {
    borderRadiusMedium: '10px',
    borderRadiusLarge: '10px',
    heightLarge: '44px',
    paddingLarge: '0 18px',
    fontSizeLarge: '15px',
  },
  Pagination: {
    itemSizeLarge: '44px',
  },
  Select: {
    heightLarge: '44px',
  },
}

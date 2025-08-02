import type { ThemeConfig } from 'antd';

export const customTheme: ThemeConfig = {
  token: {
    // Primary colors - Solar Winds theme
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    
    // Layout
    borderRadius: 6,
    wireframe: false,
    
    // Typography
    fontSize: 14,
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    
    // Spacing
    sizeUnit: 4,
    sizeStep: 4,
    
    // Colors for Solar Winds theme
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f5f5f5',
    colorBorderSecondary: '#f0f0f0',
  },
  components: {
    Button: {
      borderRadius: 6,
      controlHeight: 32,
    },
    Card: {
      borderRadius: 8,
      paddingLG: 24,
    },
    Table: {
      borderRadius: 6,
      headerBg: '#fafafa',
    },
    Input: {
      borderRadius: 6,
      controlHeight: 32,
    },
    Select: {
      borderRadius: 6,
      controlHeight: 32,
    },
    Modal: {
      borderRadius: 8,
    },
    Drawer: {
      borderRadius: 0,
    },
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#001529',
    },
  },
  algorithm: [], // Use default algorithm, can be switched to theme.darkAlgorithm for dark mode
};

// Dark theme configuration
export const darkTheme: ThemeConfig = {
  ...customTheme,
  token: {
    ...customTheme.token,
    colorBgContainer: '#141414',
    colorBgElevated: '#1f1f1f',
    colorBgLayout: '#000000',
    colorBorderSecondary: '#303030',
  },
  algorithm: [], // Would use theme.darkAlgorithm in actual implementation
};
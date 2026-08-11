import { createTheme, MantineColorsTuple } from '@mantine/core'

// Minimalist fintech palette: a calm indigo primary, restrained neutrals.
// Small radius (no heavy rounding), system font stack for speed + familiarity.
const indigo: MantineColorsTuple = [
  '#eef2ff',
  '#dde4ff',
  '#b8c4ff',
  '#8fa2ff',
  '#6e84fd',
  '#5a70fc',
  '#4f66fc',
  '#3f59e0',
  '#354ecb',
  '#2842b5',
]

export const theme = createTheme({
  primaryColor: 'indigo',
  primaryShade: { light: 6, dark: 4 },
  colors: { indigo },
  defaultRadius: 'sm',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  headings: { fontWeight: '600', sizes: { h1: { fontSize: '1.5rem' } } },
  components: {
    Button: {
      defaultProps: { radius: 'sm', size: 'md' },
    },
    TextInput: {
      defaultProps: { radius: 'sm', size: 'md' },
    },
    PasswordInput: {
      defaultProps: { radius: 'sm', size: 'md' },
    },
    Select: {
      defaultProps: { radius: 'sm', size: 'md' },
    },
    Card: {
      defaultProps: { radius: 'sm', padding: 'lg', withBorder: true },
    },
  },
})

import { createTheme, MantineColorsTuple } from '@mantine/core'

// Open-source technical identity: white surfaces, bright-orange primary.
// Shade 6 (#ea580c) is the lighter working primary (human preference
// 2026-08-16); text-on-white accents use orange.7 explicitly for AA.
// Small radius (no heavy rounding), system font stack for speed + familiarity.
const orange: MantineColorsTuple = [
  '#fff7ed',
  '#ffedd5',
  '#fed7aa',
  '#fdba74',
  '#fb923c',
  '#f97316',
  '#ea580c',
  '#c2410c',
  '#9a3412',
  '#7c2d12',
]

export const theme = createTheme({
  primaryColor: 'orange',
  primaryShade: { light: 6, dark: 6 },
  colors: { orange },
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

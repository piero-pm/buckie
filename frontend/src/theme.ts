import { createTheme, MantineColorsTuple } from '@mantine/core'

// Open-source technical identity: white surfaces, deep-orange primary.
// Shade 7 (#c2410c) keeps white-on-primary text at WCAG 2.2 AA (~5.2:1).
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
  primaryShade: { light: 7, dark: 7 },
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

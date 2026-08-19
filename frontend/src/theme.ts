import { createTheme, MantineColorsTuple } from '@mantine/core'
import { tokens } from './theme/tokens'

// myBuckie visual identity (BA-DS-013, WORK-008): warm paper surfaces,
// rust primary, warm-gray ink text. Shade 6 of rust (#BB4E1F) is the
// working primary; gray.6 ≈ ink-soft keeps small text AA on paper.
// Fonts self-hosted via @fontsource (main.tsx) — no third-party requests.
const rust: MantineColorsTuple = [
  '#FAEBDD',
  '#F5D8BE',
  '#EDBE95',
  '#E4A26C',
  '#DA8A4B',
  '#D06F30',
  tokens.rust,
  tokens.rustDeep,
  '#6B2C10',
  '#4A1E0B',
]

const gray: MantineColorsTuple = [
  '#FAF6EE',
  '#F2EADA',
  '#E5DCC8',
  '#D5C8AE',
  '#BFAE95',
  '#9C8B74',
  tokens.inkSoft,
  '#574C41',
  '#403830',
  tokens.ink,
]

const paper: MantineColorsTuple = [
  tokens.paper,
  '#F6EDDD',
  tokens.paperDeep,
  '#E9DBC2',
  tokens.line,
  '#D5C4A5',
  '#C9B58F',
  '#A99472',
  '#877454',
  tokens.inkSoft,
]

// Semantic green (BR-VI-7): shade 6 is vault-green — saved/positive amounts.
const moss: MantineColorsTuple = [
  '#EDF2ED',
  '#D8E4D9',
  '#B7CEBA',
  '#96B79B',
  '#78A37F',
  tokens.vaultGreenSoft,
  tokens.vaultGreen,
  '#324A38',
  '#26392C',
  '#1B2920',
]

// Semantic amber (BR-VI-7): shade 6 is vault-amber — recurring/flagged pills.
const amber: MantineColorsTuple = [
  '#FDF4EA',
  '#F7E2CB',
  '#EFCBA4',
  '#E9B57F',
  '#E4A469',
  '#E29A5B',
  tokens.vaultAmber,
  '#B96F35',
  '#8F5327',
  '#653A1B',
]

export const theme = createTheme({
  primaryColor: 'rust',
  primaryShade: { light: 6, dark: 6 },
  colors: { rust, gray, paper, moss, amber },
  defaultRadius: 'sm',
  fontFamily: 'var(--font-body)',
  fontFamilyMonospace: 'IBM Plex Mono, ui-monospace, SFMono-Regular, monospace',
  headings: {
    fontFamily: 'var(--font-display)',
    fontWeight: '600',
    sizes: { h1: { fontSize: '1.5rem' } },
  },
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
      styles: {
        root: {
          background: 'var(--paper-deep)',
          borderColor: 'var(--line)',
        },
      },
    },
  },
})

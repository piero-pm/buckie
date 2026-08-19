/**
 * myBuckie visual identity tokens (BA-DS-013, WORK-008). Single source of
 * truth: index.css mirrors these as CSS custom properties for styling;
 * TS imports land where CSS variables can't go (chart props, Mantine
 * tuples, SVG fills). Semantic rule everywhere: rust = money out / over,
 * vault-green = saved / positive, amber = recurring / flagged.
 */
export const tokens = {
  paper: '#FAF3E7',
  paperDeep: '#F1E6D3',
  ink: '#2A231C',
  inkSoft: '#6B6055',
  rust: '#BB4E1F',
  rustDeep: '#8F3B15',
  vaultGreen: '#3F5A44',
  vaultGreenSoft: '#6B9C74',
  vaultAmber: '#E08E4F',
  line: '#E2D3B8',
  vaultBg: '#211C16',
  vaultLine: '#3A322A',
  vaultText: '#E8DDC8',
} as const

export type Token = keyof typeof tokens

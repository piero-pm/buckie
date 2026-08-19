import { Box } from '@mantine/core'
import Hero from './Hero'
import FeatureLedger from './FeatureLedger'
import DashboardPreview from './DashboardPreview'
import LandingFooter from './LandingFooter'

/** Public landing page (no auth) — myBuckie visual identity (BA-DS-013,
 * WORK-008): hero with a live encryption demo, ledger-style features, an
 * example dashboard preview, footer. CTA hierarchy (BR-VI-1): one filled
 * rust action in the hero; sign-in lives in the header as a text link. */
export default function LandingPage() {
  return (
    <Box>
      <Hero />
      <FeatureLedger />
      <DashboardPreview />
      <LandingFooter />
    </Box>
  )
}

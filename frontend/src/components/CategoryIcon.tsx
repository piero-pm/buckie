import {
  IconHome,
  IconReceipt,
  IconShield,
  IconShoppingCart,
  IconBus,
  IconStethoscope,
  IconSparkles,
  IconPaw,
  IconToolsKitchen2,
  IconTicket,
  IconGift,
  IconBabyCarriage,
  IconShirt,
  IconRepeat,
  IconBook,
  IconDots,
} from '@tabler/icons-react'
import { categoryColor } from '../theme/palette'

// Outline icon per category (BR-VI-12): matches the landing ledger's
// outline style and tints each icon with its stable palette color. Legacy
// values map to their successor's icon, as in palette.ts.
const ICONS: Record<string, typeof IconHome> = {
  Rent: IconHome,
  Bills: IconReceipt,
  Insurance: IconShield,
  Groceries: IconShoppingCart,
  'Transport & Travel': IconBus,
  Health: IconStethoscope,
  'Personal care': IconSparkles,
  Pets: IconPaw,
  'Restaurants & drinks': IconToolsKitchen2,
  'Entertainment & culture': IconTicket,
  Gifts: IconGift,
  'Family & kids': IconBabyCarriage,
  'Shopping & clothes': IconShirt,
  Subscriptions: IconRepeat,
  'Education & books': IconBook,
  Miscellaneous: IconDots,
  Food: IconShoppingCart,
  'Entertainment & Subscriptions': IconTicket,
  Gift: IconGift,
  'Family & Kids': IconBabyCarriage,
  Shopping: IconShirt,
  'Education & Books': IconBook,
}

export function CategoryIcon({
  category,
  size = 16,
}: {
  category: string
  size?: number
}) {
  const Icon = ICONS[category] ?? IconDots
  return (
    <Icon
      size={size}
      stroke={1.7}
      color={categoryColor(category)}
      aria-hidden
    />
  )
}

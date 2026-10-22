import React from 'react';
import {
  Baby,
  BadgeCheck,
  Bell,
  CalendarDays,
  CalendarPlus,
  Circle,
  Droplet,
  FileText,
  Flame,
  FlaskConical,
  HeartPulse,
  House,
  type LucideIcon,
  Pill,
  Sparkles,
  Stethoscope,
  Syringe,
  User,
  Users,
} from 'lucide-react-native';

import { useTheme, type ThemeColors } from '../../commonutils/theme';

/**
 * Icon names that remote config may use (tabs, chips, quick actions, offers). Unknown names fall back to a circle,
 * so a new icon in config never crashes an older app.
 */
const ICONS: Record<string, LucideIcon> = {
  home: House,
  calendar: CalendarDays,
  'calendar-plus': CalendarPlus,
  pill: Pill,
  user: User,
  users: Users,
  'file-text': FileText,
  bell: Bell,
  stethoscope: Stethoscope,
  baby: Baby,
  'flask-conical': FlaskConical,
  syringe: Syringe,
  'heart-pulse': HeartPulse,
  droplet: Droplet,
  flame: Flame,
  sparkles: Sparkles,
  'badge-check': BadgeCheck,
};

export const getIcon = (name: string): LucideIcon => ICONS[name] ?? Circle;

export interface IconProps {
  /** Config icon name, e.g. "calendar-plus". */
  name: string;
  size?: number;
  color?: keyof ThemeColors;
}

/** Icon by config name. Decorative: the parent provides the accessibility label. */
function Icon({ name, size, color = 'textPrimary' }: IconProps) {
  const { colors, sizes } = useTheme();
  const Component = getIcon(name);
  return <Component size={size ?? sizes.iconMd} color={colors[color]} />;
}

export default Icon;

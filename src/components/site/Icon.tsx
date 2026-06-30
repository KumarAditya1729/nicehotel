import {
  Bed, UtensilsCrossed, Building2, Star, Award, Handshake, MapPin, Wallet,
  Target, Briefcase, Sparkles, Car, Wifi, Bell, Shield, Accessibility,
  Coffee, Clock, Home, Leaf, KeyRound, Users,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  bed: Bed, utensils: UtensilsCrossed, building: Building2, star: Star,
  award: Award, handshake: Handshake, "map-pin": MapPin, wallet: Wallet,
  target: Target, briefcase: Briefcase, sparkles: Sparkles, car: Car,
  wifi: Wifi, bell: Bell, shield: Shield, accessibility: Accessibility,
  coffee: Coffee, clock: Clock, home: Home, leaf: Leaf, key: KeyRound, users: Users,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const C = map[name] ?? Sparkles;
  return <C className={className} strokeWidth={1.5} aria-hidden />;
}

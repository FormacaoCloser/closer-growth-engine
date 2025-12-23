import { 
  Home, Clock, DollarSign, TrendingUp, GraduationCap, Rocket,
  Target, User, Phone, Users, Wallet, Mic, RefreshCw, Globe,
  Shield, FileText, Calendar, Video, Sprout, BookOpen, Theater, 
  Briefcase, Award, Play, MessageCircleQuestion, MapPin, ChevronRight,
  Zap, LucideIcon
} from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
  Home,
  Clock,
  DollarSign,
  TrendingUp,
  GraduationCap,
  Rocket,
  Target,
  User,
  Phone,
  Users,
  Wallet,
  Mic,
  RefreshCw,
  Globe,
  Shield,
  FileText,
  Calendar,
  Video,
  Sprout,
  BookOpen,
  Theater,
  Briefcase,
  Award,
  Play,
  MessageCircleQuestion,
  MapPin,
  ChevronRight,
  Zap,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] || Target;
}

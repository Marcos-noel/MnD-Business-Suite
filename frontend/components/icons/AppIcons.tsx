"use client";

import { cn } from "@/lib/cn";

type Props = { className?: string };

// Import icons from Lucide React
import {
  LayoutDashboard,
  LineChart,
  BarChart3,
  ShoppingCart,
  Users,
  Package2,
  UserCircle,
  Wallet,
  Truck,
  FileText,
  Bot,
  Settings,
  Store,
  Globe,
  Bell,
  User,
  TrendingUp,
  TrendingDown,
  Package,
  Search,
  Filter,
  Plus,
  Pencil,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  LogOut,
  Home,
  Menu,
  MoreVertical,
  CloudUpload,
  Download,
  Link,
  Share,
  Printer,
  Calendar,
  Clock,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export function IconDashboard({ className }: Props) {
  return <LayoutDashboard className={cn("h-5 w-5", className)} />;
}

export function IconAnalytics({ className }: Props) {
  return <LineChart className={cn("h-5 w-5", className)} />;
}

export function IconInsights({ className }: Props) {
  return <BarChart3 className={cn("h-5 w-5", className)} />;
}

export function IconOrders({ className }: Props) {
  return <ShoppingCart className={cn("h-5 w-5", className)} />;
}

export function IconHR({ className }: Props) {
  return <Users className={cn("h-5 w-5", className)} />;
}

export function IconInventory({ className }: Props) {
  return <Package2 className={cn("h-5 w-5", className)} />;
}

export function IconCRM({ className }: Props) {
  return <UserCircle className={cn("h-5 w-5", className)} />;
}

export function IconFinance({ className }: Props) {
  return <Wallet className={cn("h-5 w-5", className)} />;
}

export function IconExports({ className }: Props) {
  return <Truck className={cn("h-5 w-5", className)} />;
}

export function IconReadiness({ className }: Props) {
  return <FileText className={cn("h-5 w-5", className)} />;
}

export function IconAssistant({ className }: Props) {
  return <Bot className={cn("h-5 w-5", className)} />;
}

export function IconAdmin({ className }: Props) {
  return <Settings className={cn("h-5 w-5", className)} />;
}

export function IconStorefront({ className }: Props) {
  return <Store className={cn("h-5 w-5", className)} />;
}

export function IconSystem({ className }: Props) {
  return <Globe className={cn("h-5 w-5", className)} />;
}

export function IconBell({ className }: Props) {
  return <Bell className={cn("h-5 w-5", className)} />;
}

export function IconProfile({ className }: Props) {
  return <User className={cn("h-5 w-5", className)} />;
}

export function IconTrendingUp({ className }: Props) {
  return <TrendingUp className={cn("h-5 w-5", className)} />;
}

export function IconTrendingDown({ className }: Props) {
  return <TrendingDown className={cn("h-5 w-5", className)} />;
}

export function IconBox({ className }: Props) {
  return <Package className={cn("h-5 w-5", className)} />;
}

// Additional utility icons
export function IconSearch({ className }: Props) {
  return <Search className={cn("h-5 w-5", className)} />;
}

export function IconFilter({ className }: Props) {
  return <Filter className={cn("h-5 w-5", className)} />;
}

export function IconPlus({ className }: Props) {
  return <Plus className={cn("h-5 w-5", className)} />;
}

export function IconEdit({ className }: Props) {
  return <Pencil className={cn("h-5 w-5", className)} />;
}

export function IconDelete({ className }: Props) {
  return <Trash2 className={cn("h-5 w-5", className)} />;
}

export function IconView({ className }: Props) {
  return <Eye className={cn("h-5 w-5", className)} />;
}

export function IconCheck({ className }: Props) {
  return <CheckCircle className={cn("h-5 w-5", className)} />;
}

export function IconClose({ className }: Props) {
  return <XCircle className={cn("h-5 w-5", className)} />;
}

export function IconArrowRight({ className }: Props) {
  return <ArrowRight className={cn("h-5 w-5", className)} />;
}

export function IconArrowLeft({ className }: Props) {
  return <ArrowLeft className={cn("h-5 w-5", className)} />;
}

export function IconArrowUpRight({ className }: Props) {
  return <ArrowUpRight className={cn("h-5 w-5", className)} />;
}

export function IconLogout({ className }: Props) {
  return <LogOut className={cn("h-5 w-5", className)} />;
}

export function IconHome({ className }: Props) {
  return <Home className={cn("h-5 w-5", className)} />;
}

export function IconMenu({ className }: Props) {
  return <Menu className={cn("h-5 w-5", className)} />;
}

export function IconMore({ className }: Props) {
  return <MoreVertical className={cn("h-5 w-5", className)} />;
}

export function IconUpload({ className }: Props) {
  return <CloudUpload className={cn("h-5 w-5", className)} />;
}

export function IconDownload({ className }: Props) {
  return <Download className={cn("h-5 w-5", className)} />;
}

export function IconLink({ className }: Props) {
  return <Link className={cn("h-5 w-5", className)} />;
}

export function IconShare({ className }: Props) {
  return <Share className={cn("h-5 w-5", className)} />;
}

export function IconPrint({ className }: Props) {
  return <Printer className={cn("h-5 w-5", className)} />;
}

export function IconCalendar({ className }: Props) {
  return <Calendar className={cn("h-5 w-5", className)} />;
}

export function IconTime({ className }: Props) {
  return <Clock className={cn("h-5 w-5", className)} />;
}

export function IconMail({ className }: Props) {
  return <Mail className={cn("h-5 w-5", className)} />;
}

export function IconPhone({ className }: Props) {
  return <Phone className={cn("h-5 w-5", className)} />;
}

export function IconLocation({ className }: Props) {
  return <MapPin className={cn("h-5 w-5", className)} />;
}

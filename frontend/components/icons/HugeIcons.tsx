"use client";

import { cn } from "@/lib/cn";

type Props = { className?: string };

// Import icons from Hugeicons
import { 
  DashboardClassicduotone as DashboardIcon,
  ChartLineIcon as AnalyticsIcon,
  ChartPieIcon as InsightsIcon,
  ShoppingCartIcon as OrdersIcon,
  UserIcon as HRIcon,
  BoxIcon as InventoryIcon,
  UserCircleIcon as CRMIcon,
  WalletIcon as FinanceIcon,
  TruckIcon as ExportsIcon,
  DocumentIcon as ReadinessIcon,
  RobotIcon as AssistantIcon,
  SettingsIcon as AdminIcon,
  StoreIcon as StorefrontIcon,
  GlobalIcon as SystemIcon,
  NotificationIcon as BellIcon,
  ProfileIcon as ProfileIcon,
  TrendUpIcon as TrendingUpIcon,
  TrendDownIcon as TrendingDownIcon,
  BoxIcon as BoxIcon,
  ArrowUp01Icon as ArrowUpIcon,
  ArrowDown01Icon as ArrowDownIcon,
  Search01Icon as SearchIcon,
  FilterIcon as FilterIcon,
  PlusIcon as PlusIcon,
  Edit01Icon as EditIcon,
  Delete02Icon as DeleteIcon,
  EyeIcon as ViewIcon,
  CheckmarkCircle02Icon as CheckIcon,
  CloseCircleIcon as CloseIcon,
  ArrowRight01Icon as ArrowRightIcon,
  ArrowLeft01Icon as ArrowLeftIcon,
  ArrowUpRight01Icon as ArrowUpRightIcon,
  LogoutIcon as LogoutIcon,
  HomeIcon as HomeIcon,
  Menu01Icon as MenuIcon,
  MoreVerticalIcon as MoreIcon,
  UploadCloudIcon as UploadIcon,
  Download01Icon as DownloadIcon,
  Link21Icon as LinkIcon,
  Share01Icon as ShareIcon,
  PrinterIcon as PrintIcon,
  CalendarIcon as CalendarIcon,
  ClockIcon as TimeIcon,
  MailIcon as MailIcon,
  PhoneIcon as PhoneIcon,
  LocationIcon as LocationIcon,
} from "@hugeicons/react";

export function IconDashboard({ className }: Props) {
  return <DashboardIcon className={cn("h-5 w-5", className)} />;
}

export function IconAnalytics({ className }: Props) {
  return <AnalyticsIcon className={cn("h-5 w-5", className)} />;
}

export function IconInsights({ className }: Props) {
  return <InsightsIcon className={cn("h-5 w-5", className)} />;
}

export function IconOrders({ className }: Props) {
  return <OrdersIcon className={cn("h-5 w-5", className)} />;
}

export function IconHR({ className }: Props) {
  return <HRIcon className={cn("h-5 w-5", className)} />;
}

export function IconInventory({ className }: Props) {
  return <InventoryIcon className={cn("h-5 w-5", className)} />;
}

export function IconCRM({ className }: Props) {
  return <CRMIcon className={cn("h-5 w-5", className)} />;
}

export function IconFinance({ className }: Props) {
  return <FinanceIcon className={cn("h-5 w-5", className)} />;
}

export function IconExports({ className }: Props) {
  return <ExportsIcon className={cn("h-5 w-5", className)} />;
}

export function IconReadiness({ className }: Props) {
  return <ReadinessIcon className={cn("h-5 w-5", className)} />;
}

export function IconAssistant({ className }: Props) {
  return <AssistantIcon className={cn("h-5 w-5", className)} />;
}

export function IconAdmin({ className }: Props) {
  return <AdminIcon className={cn("h-5 w-5", className)} />;
}

export function IconStorefront({ className }: Props) {
  return <StorefrontIcon className={cn("h-5 w-5", className)} />;
}

export function IconSystem({ className }: Props) {
  return <SystemIcon className={cn("h-5 w-5", className)} />;
}

export function IconBell({ className }: Props) {
  return <BellIcon className={cn("h-5 w-5", className)} />;
}

export function IconProfile({ className }: Props) {
  return <ProfileIcon className={cn("h-5 w-5", className)} />;
}

export function IconTrendingUp({ className }: Props) {
  return <TrendingUpIcon className={cn("h-5 w-5", className)} />;
}

export function IconTrendingDown({ className }: Props) {
  return <TrendingDownIcon className={cn("h-5 w-5", className)} />;
}

export function IconBox({ className }: Props) {
  return <BoxIcon className={cn("h-5 w-5", className)} />;
}

// Additional utility icons
export function IconSearch({ className }: Props) {
  return <SearchIcon className={cn("h-5 w-5", className)} />;
}

export function IconFilter({ className }: Props) {
  return <FilterIcon className={cn("h-5 w-5", className)} />;
}

export function IconPlus({ className }: Props) {
  return <PlusIcon className={cn("h-5 w-5", className)} />;
}

export function IconEdit({ className }: Props) {
  return <EditIcon className={cn("h-5 w-5", className)} />;
}

export function IconDelete({ className }: Props) {
  return <DeleteIcon className={cn("h-5 w-5", className)} />;
}

export function IconView({ className }: Props) {
  return <ViewIcon className={cn("h-5 w-5", className)} />;
}

export function IconCheck({ className }: Props) {
  return <CheckIcon className={cn("h-5 w-5", className)} />;
}

export function IconClose({ className }: Props) {
  return <CloseIcon className={cn("h-5 w-5", className)} />;
}

export function IconArrowRight({ className }: Props) {
  return <ArrowRightIcon className={cn("h-5 w-5", className)} />;
}

export function IconArrowLeft({ className }: Props) {
  return <ArrowLeftIcon className={cn("h-5 w-5", className)} />;
}

export function IconArrowUpRight({ className }: Props) {
  return <ArrowUpRightIcon className={cn("h-5 w-5", className)} />;
}

export function IconLogout({ className }: Props) {
  return <LogoutIcon className={cn("h-5 w-5", className)} />;
}

export function IconHome({ className }: Props) {
  return <HomeIcon className={cn("h-5 w-5", className)} />;
}

export function IconMenu({ className }: Props) {
  return <MenuIcon className={cn("h-5 w-5", className)} />;
}

export function IconMore({ className }: Props) {
  return <MoreIcon className={cn("h-5 w-5", className)} />;
}

export function IconUpload({ className }: Props) {
  return <UploadIcon className={cn("h-5 w-5", className)} />;
}

export function IconDownload({ className }: Props) {
  return <DownloadIcon className={cn("h-5 w-5", className)} />;
}

export function IconLink({ className }: Props) {
  return <LinkIcon className={cn("h-5 w-5", className)} />;
}

export function IconShare({ className }: Props) {
  return <ShareIcon className={cn("h-5 w-5", className)} />;
}

export function IconPrint({ className }: Props) {
  return <PrintIcon className={cn("h-5 w-5", className)} />;
}

export function IconCalendar({ className }: Props) {
  return <CalendarIcon className={cn("h-5 w-5", className)} />;
}

export function IconTime({ className }: Props) {
  return <TimeIcon className={cn("h-5 w-5", className)} />;
}

export function IconMail({ className }: Props) {
  return <MailIcon className={cn("h-5 w-5", className)} />;
}

export function IconPhone({ className }: Props) {
  return <PhoneIcon className={cn("h-5 w-5", className)} />;
}

export function IconLocation({ className }: Props) {
  return <LocationIcon className={cn("h-5 w-5", className)} />;
}
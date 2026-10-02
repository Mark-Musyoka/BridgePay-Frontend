import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

export const Icons = {
  Wallet: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  Send: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  ArrowUpRight: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
    </svg>
  ),
  ArrowDownLeft: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7L7 17M7 17h10M7 17V7" />
    </svg>
  ),
  History: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Shield: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  CheckCircle: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  AlertCircle: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Plus: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Search: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Filter: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  Refresh: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Copy: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  ExternalLink: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  ),
  User: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Lock: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Mail: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  LogOut: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Flag: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  ),
  Dashboard: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  CreditCard: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  ChevronRight: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  ChevronLeft: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  Menu: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Close: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Download: ({ className = 'w-5 h-5', ...props }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  MPesa: ({ className = 'w-6 h-6', ...props }: IconProps) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="32" height="32" rx="6" fill="#00A859" />
      <path fillRule="evenodd" clipRule="evenodd" d="M7 23V9H10.5L14 16.5L17.5 9H21V23H18V13.5L14.7 19H13.3L10 13.5V23H7Z" fill="white" />
      <path d="M22 10.5H25.5C27 10.5 28 11.5 28 12.8C28 14.1 27 15.1 25.5 15.1H22V10.5Z" fill="#E11C24" />
      <path d="M22 15.1H26C27.5 15.1 28.5 16.1 28.5 17.5C28.5 18.9 27.5 19.9 26 19.9H22V15.1Z" fill="#E11C24" />
      <path d="M22 9V23" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Airtel: ({ className = 'w-6 h-6', ...props }: IconProps) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="32" height="32" rx="6" fill="#E40000" />
      <path d="M9 22.5C9 16.5 13.5 11 19.5 11C22 11 24 12 24.5 14C23.5 13 21.5 13 19.5 14.5C16.5 16.5 15.5 19.5 16.5 22.5" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <circle cx="21" cy="20.5" r="2.5" fill="white" />
    </svg>
  ),
  Visa: ({ className = 'w-6 h-6', ...props }: IconProps) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="32" height="32" rx="6" fill="#1A1F71" />
      <path d="M12.8 20L14.7 12H17.2L15.3 20H12.8Z" fill="white" />
      <path d="M22.5 12.2C22 12 21.2 11.8 20.2 11.8C17.7 11.8 16 13.1 16 15C16 16.4 17.3 17.1 18.2 17.6C19.2 18.1 19.5 18.4 19.5 18.9C19.5 19.6 18.7 19.9 17.9 19.9C16.8 19.9 16.2 19.7 15.4 19.3L15 19.1L14.6 21.1C15.2 21.4 16.4 21.6 17.7 21.6C20.4 21.6 22.1 20.3 22.1 18.2C22.1 16.3 20.4 15.5 19.3 14.9C18.5 14.5 18.1 14.2 18.1 13.7C18.1 13.2 18.7 12.8 19.7 12.8C20.5 12.8 21.2 13 21.7 13.2L22.1 13.4L22.5 12.2Z" fill="white" />
      <path d="M25.7 12H23.8C23.2 12 22.7 12.2 22.5 12.8L19.2 20H21.8L22.3 18.5H25.5L25.8 20H28.1L26.1 12H25.7ZM23 16.6L24.3 13.5L25 16.6H23Z" fill="white" />
      <path d="M11.6 12L9 20H11.5L13.1 12H11.6Z" fill="#F7B600" />
      <path d="M9.5 12H6.9L6.8 12.2C9.3 12.8 11.3 14.3 12.1 16.3L11.2 12H9.5Z" fill="white" />
    </svg>
  ),
  Mastercard: ({ className = 'w-6 h-6', ...props }: IconProps) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="32" height="32" rx="6" fill="#22252A" />
      <circle cx="12.5" cy="16" r="6.5" fill="#EB001B" />
      <circle cx="19.5" cy="16" r="6.5" fill="#F79E1B" />
      <path d="M16 11.2C17.3 12.4 18.1 14.1 18.1 16C18.1 17.9 17.3 19.6 16 20.8C14.7 19.6 13.9 17.9 13.9 16C13.9 14.1 14.7 12.4 16 11.2Z" fill="#FF5F00" />
    </svg>
  ),
  Bank: ({ className = 'w-6 h-6', ...props }: IconProps) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="32" height="32" rx="6" fill="#0F172A" />
      <path d="M16 8L7 13V15H25V13L16 8Z" fill="#38BDF8" />
      <rect x="9" y="16" width="2.5" height="6" fill="white" />
      <rect x="13.5" y="16" width="2.5" height="6" fill="white" />
      <rect x="18" y="16" width="2.5" height="6" fill="white" />
      <rect x="22.5" y="16" width="2.5" height="6" fill="white" />
      <rect x="7" y="23" width="18" height="2" rx="0.5" fill="#38BDF8" />
    </svg>
  ),
};

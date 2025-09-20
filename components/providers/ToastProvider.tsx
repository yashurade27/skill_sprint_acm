"use client"

import { Toaster } from 'react-hot-toast'

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#1f2937',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid #f3f4f6',
          fontSize: '14px',
          maxWidth: '400px',
        },
        success: {
          iconTheme: {
            primary: '#f97316',
            secondary: '#fff',
          },
          style: {
            border: '1px solid #f97316',
            background: '#fff7ed',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
          style: {
            border: '1px solid #ef4444',
            background: '#fef2f2',
          },
        },
        loading: {
          iconTheme: {
            primary: '#f97316',
            secondary: '#fff',
          },
          style: {
            border: '1px solid #f97316',
            background: '#fff7ed',
          },
        },
      }}
    />
  )
}
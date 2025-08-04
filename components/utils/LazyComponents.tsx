'use client'

import { lazy } from 'react'

// Lazy load heavy components
export const LazyHeroSection = lazy(() => import('@/components/sections/HeroSection'))
export const LazyMenuPreview = lazy(() => import('@/components/sections/MenuPreview'))
export const LazyBlogPreview = lazy(() => import('@/components/sections/BlogPreview'))
export const LazyAboutSection = lazy(() => import('@/components/sections/AboutSection'))
export const LazyContactSection = lazy(() => import('@/components/sections/ContactSection'))

// Admin components
export const LazyImageUpload = lazy(() => import('@/components/admin/ImageUpload'))
export const LazyProgressModal = lazy(() => import('@/components/ui/ProgressModal'))
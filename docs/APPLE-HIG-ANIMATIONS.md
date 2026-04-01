# Apple HIG Ultra-Modern UI Animation Library

**Version:** 1.0
**Created:** 2025-02-28
**Design System:** Apple Human Interface Guidelines + Framer Motion
**Target:** Every interaction feels buttery smooth (60 FPS)

## Executive Summary

**Vision:** Create the most polished browser automation UI in the market. Every dropdown, modal, button, and transition should feel native to Apple platforms - smooth, purposeful, and delightful.

**Inspiration:**
- macOS Sonoma animations (smooth, physics-based)
- iOS 17 interactions (spring animations, haptic feedback simulation)
- Apple.com website (subtle, meaningful motion)
- Framer (best-in-class web animations)

**Stack:**
- Framer Motion (React animation library, Apple-quality)
- Tailwind CSS (utility-first, Apple design tokens)
- Radix UI (accessible primitives, unstyled)
- CSS Custom Properties (smooth theme transitions)

---

## Design Principles (Apple HIG)

### 1. **Purposeful Motion**
- Animations should **communicate**, not decorate
- Guide user attention to important changes
- Provide feedback for user actions
- Respect `prefers-reduced-motion`

### 2. **Natural Physics**
- Spring animations (not linear easing)
- Anticipation and follow-through
- Momentum-based scrolling
- Realistic bounce/damping

### 3. **Polished Transitions**
- Shared element transitions (morphing)
- Stagger animations (sequential reveals)
- Layered depth (parallax, blur)
- Smooth enter/exit (no jarring cuts)

### 4. **Performance First**
- 60 FPS minimum (16.67ms per frame)
- Hardware-accelerated (transform, opacity)
- No layout thrashing
- Lazy loading for heavy components

---

## Component Library

### 1. Dropdown Menu (Apple-Style)

**Design:**
```
Button (Closed)
   ↓ Click
┌─────────────────────┐
│ Menu Item 1     ⌘N │ ← Stagger in (50ms delay each)
│ Menu Item 2     ⌘O │
├─────────────────────┤
│ Menu Item 3     ⌘P │
└─────────────────────┘
   ↓ Scale origin from button
   ↓ Fade in backdrop blur
```

**Implementation:**

```typescript
// apps/web/src/components/ui/Dropdown.tsx (~180 lines)
import { motion, AnimatePresence } from 'framer-motion'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export function Dropdown({ trigger, items }: DropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="dropdown-trigger"
        >
          {trigger}
        </motion.button>
      </DropdownMenu.Trigger>

      <AnimatePresence>
        <DropdownMenu.Portal>
          <DropdownMenu.Content asChild>
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: -10
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                transition: {
                  type: 'spring',
                  damping: 25,
                  stiffness: 300,
                  mass: 0.5
                }
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: -10,
                transition: { duration: 0.15 }
              }}
              className="dropdown-content"
              style={{
                transformOrigin: 'top center',
                backdropFilter: 'blur(20px) saturate(180%)',
                background: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >
              {items.map((item, index) => (
                <DropdownMenu.Item key={item.id} asChild>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      transition: {
                        delay: index * 0.05, // Stagger
                        type: 'spring',
                        damping: 20,
                        stiffness: 300
                      }
                    }}
                    whileHover={{
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      x: 4
                    }}
                    className="dropdown-item"
                  >
                    <item.icon className="dropdown-icon" />
                    <span>{item.label}</span>
                    {item.shortcut && (
                      <span className="dropdown-shortcut">{item.shortcut}</span>
                    )}
                  </motion.div>
                </DropdownMenu.Item>
              ))}
            </motion.div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </AnimatePresence>
    </DropdownMenu.Root>
  )
}
```

**Styling (Tailwind + Custom):**

```css
/* apps/web/src/styles/dropdown.css */
.dropdown-content {
  min-width: 220px;
  padding: 8px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.dropdown-icon {
  width: 18px;
  height: 18px;
  opacity: 0.6;
}

.dropdown-shortcut {
  margin-left: auto;
  font-size: 12px;
  opacity: 0.5;
  font-weight: 400;
}

@media (prefers-color-scheme: dark) {
  .dropdown-content {
    background: rgba(30, 30, 30, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .dropdown-item:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }
}
```

### 2. Modal Dialog (Full-Screen Takeover)

**Design:**
```
Page
  ↓ Click "Create Flow"
  ↓ Page fades out + blur
┌───────────────────────────────┐
│ ← Create New Flow             │ ← Slide in from right
│                               │
│ [Form fields...]              │
│                               │
│ [Cancel] [Create]             │
└───────────────────────────────┘
```

**Implementation:**

```typescript
// apps/web/src/components/ui/Modal.tsx (~190 lines)
import { motion, AnimatePresence } from 'framer-motion'
import * as Dialog from '@radix-ui/react-dialog'
import { useEffect } from 'react'

export function Modal({ isOpen, onClose, children, size = 'medium' }: ModalProps) {
  // Lock body scroll when modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            {/* Backdrop */}
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="modal-backdrop"
                style={{
                  backdropFilter: 'blur(8px) saturate(120%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)'
                }}
              />
            </Dialog.Overlay>

            {/* Content */}
            <Dialog.Content asChild>
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: 20
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: {
                    type: 'spring',
                    damping: 30,
                    stiffness: 300,
                    mass: 0.8
                  }
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: 20,
                  transition: { duration: 0.2 }
                }}
                className={`modal-content modal-${size}`}
              >
                {/* Close button */}
                <Dialog.Close asChild>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="modal-close"
                    aria-label="Close"
                  >
                    <XIcon />
                  </motion.button>
                </Dialog.Close>

                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
```

### 3. Toast Notifications (macOS Style)

**Design:**
```
                 ┌─────────────────────────┐
                 │ ✅ Flow created!        │ ← Slide in from top-right
                 │ "Login Flow" is ready   │
                 └─────────────────────────┘
                   ↓ Auto-dismiss after 5s
                   ↓ Slide out
```

**Implementation:**

```typescript
// apps/web/src/components/ui/Toast.tsx (~150 lines)
import { motion, AnimatePresence } from 'framer-motion'
import * as ToastPrimitive from '@radix-ui/react-toast'

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {children}
      <ToastPrimitive.Viewport className="toast-viewport" />
    </ToastPrimitive.Provider>
  )
}

export function Toast({ title, description, variant = 'success' }: ToastProps) {
  const icons = {
    success: <CheckCircleIcon className="text-green-500" />,
    error: <XCircleIcon className="text-red-500" />,
    warning: <AlertIcon className="text-orange-500" />,
    info: <InfoIcon className="text-blue-500" />
  }

  return (
    <ToastPrimitive.Root asChild>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: 'spring',
            damping: 25,
            stiffness: 400
          }
        }}
        exit={{
          opacity: 0,
          x: 100,
          transition: { duration: 0.2 }
        }}
        className="toast-root"
      >
        <div className="toast-icon">{icons[variant]}</div>
        <div className="toast-content">
          <ToastPrimitive.Title className="toast-title">
            {title}
          </ToastPrimitive.Title>
          {description && (
            <ToastPrimitive.Description className="toast-description">
              {description}
            </ToastPrimitive.Description>
          )}
        </div>
        <ToastPrimitive.Close asChild>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="toast-close"
          >
            <XIcon />
          </motion.button>
        </ToastPrimitive.Close>
      </motion.div>
    </ToastPrimitive.Root>
  )
}
```

### 4. Loading States (Skeleton Screens)

**Apple Principle:** No spinners for <1s waits, show skeleton content

**Implementation:**

```typescript
// apps/web/src/components/ui/Skeleton.tsx (~120 lines)
import { motion } from 'framer-motion'

export function Skeleton({ variant = 'text', className }: SkeletonProps) {
  const variants = {
    text: 'h-4 rounded',
    title: 'h-6 rounded',
    avatar: 'w-10 h-10 rounded-full',
    card: 'h-32 rounded-xl'
  }

  return (
    <motion.div
      className={`skeleton ${variants[variant]} ${className}`}
      animate={{
        opacity: [0.5, 0.8, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      style={{
        background: 'linear-gradient(90deg, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.05) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite'
      }}
    />
  )
}

// Usage: Flow list loading state
function FlowListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="card p-4">
          <Skeleton variant="title" className="w-1/3 mb-2" />
          <Skeleton variant="text" className="w-2/3 mb-4" />
          <div className="flex gap-2">
            <Skeleton variant="avatar" />
            <Skeleton variant="text" className="w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}
```

### 5. Button Interactions (Spring Animations)

**All button states should feel responsive:**

```typescript
// apps/web/src/components/ui/Button.tsx (~120 lines)
import { motion } from 'framer-motion'

export function Button({ children, variant = 'primary', ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{
        scale: 1.02,
        transition: {
          type: 'spring',
          damping: 20,
          stiffness: 300
        }
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.05 }
      }}
      className={`button button-${variant}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}

// Animated icon button (record button)
export function RecordButton({ isRecording, onClick }: RecordButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      animate={{
        scale: isRecording ? [1, 1.1, 1] : 1,
        backgroundColor: isRecording ? '#EF4444' : '#3B82F6'
      }}
      transition={{
        scale: {
          repeat: isRecording ? Infinity : 0,
          duration: 1.5,
          ease: 'easeInOut'
        },
        backgroundColor: { duration: 0.3 }
      }}
      className="record-button"
    >
      {isRecording ? <StopIcon /> : <PlayIcon />}
    </motion.button>
  )
}
```

### 6. Page Transitions (Shared Element Morphing)

**Example:** Flow list → Flow builder (card morphs into full editor)

```typescript
// apps/web/src/components/FlowCard.tsx
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export function FlowCard({ flow }: FlowCardProps) {
  return (
    <Link to={`/flows/${flow.id}/edit`}>
      <motion.div
        layoutId={`flow-${flow.id}`} // Shared element magic!
        className="flow-card"
        whileHover={{
          y: -4,
          boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)'
        }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300
        }}
      >
        <h3>{flow.name}</h3>
        <p>{flow.description}</p>
      </motion.div>
    </Link>
  )
}

// apps/web/src/pages/FlowBuilder.tsx
export function FlowBuilder({ flowId }: FlowBuilderProps) {
  return (
    <motion.div
      layoutId={`flow-${flowId}`} // Same layoutId = morphing transition!
      className="flow-builder"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Flow builder UI */}
    </motion.div>
  )
}
```

### 7. Drag & Drop (Flow Builder)

**Natural physics for dragging steps:**

```typescript
// apps/web/src/components/FlowBuilder.tsx
import { Reorder } from 'framer-motion'

export function FlowStepList({ steps, onReorder }: FlowStepListProps) {
  return (
    <Reorder.Group
      axis="y"
      values={steps}
      onReorder={onReorder}
      className="step-list"
    >
      {steps.map((step, index) => (
        <Reorder.Item
          key={step.id}
          value={step}
          whileDrag={{
            scale: 1.05,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            zIndex: 10
          }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 300
          }}
          className="step-item"
        >
          <DragHandleIcon className="drag-handle" />
          <span>Step {index + 1}: {step.type}</span>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  )
}
```

---

## Animation Tokens (Design System)

```typescript
// apps/web/src/styles/animation-tokens.ts
export const animationTokens = {
  // Easing (Apple standard)
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)'
  },

  // Duration (Apple HIG: 200-400ms for most interactions)
  duration: {
    instant: '100ms',
    fast: '200ms',
    normal: '300ms',
    slow: '400ms',
    slower: '600ms'
  },

  // Spring physics (realistic motion)
  spring: {
    gentle: { damping: 30, stiffness: 200 },
    standard: { damping: 25, stiffness: 300 },
    snappy: { damping: 20, stiffness: 400 },
    bouncy: { damping: 15, stiffness: 500 }
  },

  // Shadows (layered depth)
  shadow: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.08)',
    md: '0 4px 16px rgba(0, 0, 0, 0.12)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.16)',
    xl: '0 12px 48px rgba(0, 0, 0, 0.20)'
  },

  // Blur (macOS-style)
  blur: {
    sm: 'blur(8px)',
    md: 'blur(16px)',
    lg: 'blur(24px)',
    material: 'blur(20px) saturate(180%)'
  }
}
```

---

## Accessibility (Respecting User Preferences)

```typescript
// apps/web/src/hooks/useReducedMotion.ts
import { useEffect, useState } from 'react'

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  return prefersReducedMotion
}

// Usage: Conditionally disable animations
export function AnimatedComponent() {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      animate={{
        opacity: 1,
        y: reducedMotion ? 0 : -20 // Skip animation if reduced motion
      }}
      transition={{
        duration: reducedMotion ? 0 : 0.3 // Instant if reduced motion
      }}
    >
      Content
    </motion.div>
  )
}
```

---

## Performance Optimization

### 1. Hardware Acceleration

```css
/* Only animate transform and opacity (GPU-accelerated) */
.animated-element {
  will-change: transform, opacity; /* Hint to browser */
  transform: translateZ(0); /* Force GPU layer */
}

/* ❌ SLOW (layout thrashing) */
.bad {
  animation: move 0.3s;
}
@keyframes move {
  to { left: 100px; } /* Triggers layout recalc */
}

/* ✅ FAST (GPU-accelerated) */
.good {
  animation: move 0.3s;
}
@keyframes move {
  to { transform: translateX(100px); } /* GPU only */
}
```

### 2. Lazy Loading Heavy Animations

```typescript
import { lazy, Suspense } from 'react'

// Heavy animation component (Lottie, etc.)
const AnimatedIllustration = lazy(() => import('./AnimatedIllustration'))

export function Hero() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnimatedIllustration />
    </Suspense>
  )
}
```

### 3. Debounce Scroll Animations

```typescript
import { useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export function ParallaxSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])

  return (
    <motion.div ref={ref} style={{ y }}>
      Parallax content
    </motion.div>
  )
}
```

---

## Implementation Timeline

### Week 1: Core Components
- [ ] Dropdown (Apple-style)
- [ ] Modal (full-screen takeover)
- [ ] Toast notifications
- [ ] Button interactions

### Week 2: Advanced Animations
- [ ] Page transitions (shared elements)
- [ ] Drag & drop (flow builder)
- [ ] Loading states (skeleton screens)
- [ ] Parallax scrolling

### Week 3: Polish & Accessibility
- [ ] Reduced motion support
- [ ] Performance optimization
- [ ] A/B test animation styles
- [ ] User testing (feedback loop)

---

## Success Metrics

- [ ] **Performance:** 60 FPS on all animations (Chrome DevTools FPS meter)
- [ ] **Accessibility:** 100% keyboard navigable, reduced motion support
- [ ] **User Delight:** NPS increase from 40 → 60 (animations cited)
- [ ] **Conversion:** Free → Pro conversion +5% (polished UI = premium perception)

---

**Document Owner:** Design + Frontend Engineering
**Review Cadence:** After each sprint
**Next Review:** 2025-03-14 (after Sprint 1)

import { useEffect } from 'react'

interface Props {
  message: string
  onDismiss: () => void
}

const AUTO_DISMISS_MS = 5000

export function Toast({ message, onDismiss }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [message, onDismiss])

  return (
    <div
      role="alert"
      className="fixed inset-x-4 top-[max(1.5rem,env(safe-area-inset-top))] z-50 mx-auto flex w-auto max-w-sm animate-fadeIn items-start gap-3
        rounded-xl border border-red-500/30 bg-red-950/90 px-4
        py-3 text-white shadow-2xl backdrop-blur-md sm:inset-x-0"
    >
      <svg
        className="mt-0.5 size-5 flex-shrink-0 text-red-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        />
      </svg>
      <p className="flex-1 text-sm leading-snug">{message}</p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="flex-shrink-0 text-white/40 transition-colors hover:text-white"
      >
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  )
}

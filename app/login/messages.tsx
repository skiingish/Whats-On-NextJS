'use client'

import { useSearchParams } from 'next/navigation'

export default function Messages() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')
  return (
    <>
      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}
      {message && (
        <p className="text-sm text-muted-foreground text-center">{message}</p>
      )}
    </>
  )
}

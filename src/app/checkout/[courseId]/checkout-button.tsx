"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createCheckoutSession } from "@/app/checkout/actions"

interface CheckoutButtonProps {
  courseId: string
}

export function CheckoutButton({ courseId }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await createCheckoutSession(courseId)

      if ("error" in result) {
        setError(result.error || "Une erreur est survenue")
        setIsLoading(false)
        return
      }

      if (result.url) {
        window.location.href = result.url
      }
    } catch (err) {
      setError("Une erreur est survenue")
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded">
          {error}
        </div>
      )}
      <Button
        onClick={handleCheckout}
        disabled={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? "Redirection..." : "Procéder au paiement"}
      </Button>
    </div>
  )
}

'use client'

import PaymentForm from "@/components/elements/paymentForm"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export default function AddPayment({ ticketId }: { ticketId: number }) {
  return (
    <Sheet>
      <SheetTrigger className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">Add Payment</SheetTrigger>
      <SheetContent className="w-[400px]">
        <SheetHeader>
          <SheetTitle>Add Payment</SheetTitle>
        </SheetHeader>
        <PaymentForm ticketId={ticketId} />
      </SheetContent>
    </Sheet>
  )
}


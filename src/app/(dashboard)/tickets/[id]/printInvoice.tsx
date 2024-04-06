'use client';

import { Button } from "@/components/ui/button";

export default function PrintInvoice(){
  const print = () => {
    window.print()
  }

  return (
    <Button onClick={print} className="mt-6">Print Invoice</Button>
  )
}
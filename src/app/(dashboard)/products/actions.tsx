'use client';

import RestockForm from "@/components/elements/restockForm";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface ProductActionsProps {
  id: number;
  name: string;
}

export default function ProductActions({ id, name }: ProductActionsProps){
  
  return (
    <Sheet>
      <SheetTrigger>Restock</SheetTrigger>
      <SheetContent className="w-[400px]">
        <SheetHeader>
          <SheetTitle>Restock {name} </SheetTitle>
        </SheetHeader>
        <RestockForm id={id} />
      </SheetContent>
    </Sheet>
  )
}

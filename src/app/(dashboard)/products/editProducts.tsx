'use client';

import EditProductForm from "@/components/elements/editProductForm";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Inventory } from "@prisma/client";

interface EditProductProps {
  product: Inventory
}

export default function EditProduct({ product }: EditProductProps) {
  return (
    <Sheet >
      <SheetTrigger>Edit</SheetTrigger>
      <SheetContent className="w-[400px]">
        <SheetHeader>
          <SheetTitle>Edit {product.name} </SheetTitle>
        </SheetHeader>
        <EditProductForm product={product} />
      </SheetContent>
    </Sheet>
  )
}
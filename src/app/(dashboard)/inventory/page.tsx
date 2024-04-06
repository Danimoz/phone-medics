import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export default function Inventory(){
  return (
    <div className="p-4">
      <section className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Button variant='outline' asChild>
          <Link href='/inventory/new'>
            <PlusIcon />
            <span className="sr-only">Add Item</span>
          </Link>
        </Button>
      </section>
    </div>
  )
}
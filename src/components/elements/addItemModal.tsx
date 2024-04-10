'use client';

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Button } from "../ui/button";
import { Inventory } from "@prisma/client";
import { toast } from "sonner";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandList, CommandEmpty, CommandItem, CommandGroup, CommandInput } from "../ui/command";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Label } from "@radix-ui/react-label";
import SubmitButton from "./submitbutton";
import { addItemToTicket } from "@/actions/tickets";

interface AddItemModalProps {
  id: number;
  type: "SALE" | "REPAIR"
}

export default function AddItemModal({ id, type }: AddItemModalProps){
  const [products, setProducts] = useState<Inventory[]>([]);
  const [selectedProduct, setSelectedProduct] = useState({ productName: '', productId: 0, productPrice: 0, productQuantity: 0 });

  useEffect(() => {
    async function getItems() {
      const res = await fetch('/api/products');
      if (!res.ok) {
        toast.error('An error occurred');
        return
      }
      const { items } = await res.json();      
      setProducts(items);
    }

    getItems()
  }, [])

  useEffect(() => {
    async function getProductPrice() {
      const res = await fetch(`/api/get-price?productId=${selectedProduct.productId}`);

      if (!res.ok) {
        toast.error('An error occurred');
        return
      }
      const { price } = await res.json();
      setSelectedProduct({ ...selectedProduct, productPrice: price });
    }
    getProductPrice()
  }, [selectedProduct.productId])

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedProduct({ ...selectedProduct, productQuantity: parseInt(e.target.value) });
  }

  async function handleSubmit(){
    if (!selectedProduct.productName || selectedProduct.productQuantity === 0 ) {
      toast.error('Please select a product');
      return
    }

    const res = await addItemToTicket(
      id,
      selectedProduct.productId,
      selectedProduct.productQuantity,
      type
    );

    if (res.status !== 200) {
      toast.error(res.message);
      return
    }

    toast.success(res.message);
    setSelectedProduct({ productName: '', productId: 0, productPrice: 0, productQuantity: 0 });
  }

  return (
    <Sheet>
      <SheetTrigger className="bg-primary rounded-lg p-3 text-white">Add Item</SheetTrigger>
      <SheetContent className="w-[500px]">
        <SheetHeader>
          <SheetTitle>Add Item</SheetTitle>
        </SheetHeader>
        <form action={handleSubmit}>
          <div className="mt-6 mb-3">
            <h3 className="text-lg font-semibold">Product</h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant='outline' role="combobox" className='w-full my-1'>
                  {selectedProduct.productName 
                    ? products?.find((product) => product.id === selectedProduct.productId)?.name
                    : "Select Product..."
                  }
                  <ChevronsUpDown className="shrink-0 opacity-50 ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Command>
                  <CommandInput placeholder="Search Products..." />
                  <CommandList>
                    <CommandEmpty>No Product found.</CommandEmpty>
                    <CommandGroup>
                      {products?.map((product) => (
                        <CommandItem
                          key={product.id.toString()} 
                          value={product.name}
                          onSelect={(currentValue) => {
                            setSelectedProduct({ productName: currentValue, productId: product.id, productPrice: 0, productQuantity: 0 });
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", product.name === selectedProduct.productName ? "opacity-100": 'opacity-0')} />
                          {product.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2 mb-3">
            <Label>Quantity</Label>
            <Input type="number" placeholder="Enter Quantity" onChange={handlePriceChange} />
          </div>

          <p className="mb-6 text-lg">₦ {(selectedProduct.productPrice * selectedProduct.productQuantity).toLocaleString()}</p>

          <SubmitButton buttonText="Add Item" />
        </form>
      </SheetContent>
    </Sheet>
  )
}
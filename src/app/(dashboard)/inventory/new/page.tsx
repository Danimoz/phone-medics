'use client';

import { Label } from "@/components/ui/label";
import ExcelUploader from "./exceluploader";
import { Input } from "@/components/ui/input";
import SubmitButton from "@/components/elements/submitbutton";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { addItem } from "@/actions/inventory";
import { useRef } from "react";
import { toast } from "sonner";

export default function AddItem(){
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(data: FormData){
    const item = await addItem(data);

    if (item.status !== 201) {
      toast.error(item.message);
      return
    }

    toast.success(item.message);
    formRef.current?.reset();
  }

  return (
    <div className="p-4">
      <h2 className="font-semibold text-2xl my-4">Add New Item</h2>
      <ExcelUploader />

      <hr className="my-9"/>

      <section>
        <form action={handleSubmit} ref={formRef}>
          <div className="mb-3 space-y-1">
            <Label htmlFor="name" className="text-lg mb-1">Name</Label>
            <Input id='name' type="text" name='name' placeholder="Enter Name of Item" required />
          </div>

          <div className="mb-3 space-y-1">
            <Label htmlFor="costPrice" className="text-lg mb-1">Cost Price</Label>
            <Input id='costPrice' type="number" min='0' name='costPrice' placeholder="Enter Cost Price" required />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="mb-3 space-y-1 w-full">
              <Label htmlFor="price" className="text-lg mb-1">Price</Label>
              <Input id='price' type="number" name='price' min={0} step='0.01' placeholder="Enter Price" required />
            </div>
            <div className="mb-3 space-y-1 w-full">
              <Label htmlFor="quantity" className="text-lg mb-1">Quantity</Label>
              <Input id='quantity' type="number" name='quantity' min={0} placeholder="Enter Price" required />
            </div>
          </div>

          <div className="mb-3 space-y-1">
            <Label htmlFor="description" className="text-lg mb-1">Description</Label>
            <Textarea id='description' name='description' placeholder="Enter Description" />
          </div>

          <div className="flex items-center mb-3">
            <Checkbox name="isActive" />
            <Label htmlFor="isActive" className="text-lg ml-2 mb-1">Active</Label>
          </div>

          <SubmitButton buttonText="Add Item" />
        </form>
      </section>
    </div>
  )
}
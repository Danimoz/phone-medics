'use client';

import { restockItem } from "@/actions/inventory";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import SubmitButton from "./submitbutton";
import { toast } from "sonner";

interface RestockFormProps {
  id: number;
}

export default function RestockForm({ id }: RestockFormProps){

  async function handleRestock(formData: FormData){
    const quantity = parseInt(formData.get('quantity') as string)

    const response = await restockItem(id, quantity);
    if (response.status === 201) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  }

  return (
    <form className="gap-4 py-4" action={handleRestock}>
      <div className="mb-3 space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input id="quantity" type="number" name="quantity" />
      </div>
      <SubmitButton buttonText="Restock" />
    </form>
  )
}
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Inventory } from "@prisma/client"
import SubmitButton from "./submitbutton"
import { editProduct } from "@/actions/inventory"
import { toast } from "sonner"

interface EditProductFormProps {
  product: Inventory
}

export default function EditProductForm({ product }: EditProductFormProps) {

  async function handleEdit(formData: FormData){
    const response = await editProduct(product.id, formData);
    if (response.status !== 200) {
      toast.error(response.message);
      return
    }
    toast.success(response.message);
  }
  
  return (
    <form className="gap-4 py-4" action={handleEdit}>
      <div className="mb-3 space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={product.name} placeholder='Enter Name' />
      </div>

      <div className="mb-3 space-y-2">
        <Label htmlFor="costPrice">Cost Price</Label>
        <Input id="costPrice" name="costPrice" type="number" defaultValue={product.costPrice} placeholder='Enter Cost Price' min={0} />
      </div>

      <div className="mb-3 space-y-2">
        <Label htmlFor="price">Price</Label>
        <Input id="price" name="price" type="number" defaultValue={product.price} placeholder='Enter Price' min={0} />
      </div>

      <SubmitButton buttonText="Edit" />
    </form>
  )
}
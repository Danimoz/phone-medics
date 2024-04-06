import { addPayment } from "@/actions/tickets";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import SubmitButton from "./submitbutton";
import { toast } from "sonner";
import { useRef } from "react";

export default function PaymentForm({ ticketId }: { ticketId: number }) {
  const formRef = useRef<HTMLFormElement>(null);

  const paymentMethods = [
    { label: 'Cash', value: 'CASH' },
    { label: 'Card', value: 'CARD' },
    { label: 'Transfer', value: 'TRANSFER' },
    { label: 'Other', value: 'OTHER' },
  ]

  async function handleUpdate(data: FormData) {
    const formdata = {
      amount: Number(data.get('amount')),
      method: data.get('paymentMethod') as "CASH" | "CARD" | "TRANSFER" | "OTHER",
      note: data.get('paymentNote') as string,
    }

    const response = await addPayment(ticketId, formdata)
    if (response.status !== 200){
      toast.error(response.message)
      return
    }
    toast.success('Payment added successfully')
    formRef.current?.reset()
  }

  return (
    <form className="grid gap-4 mt-6" action={handleUpdate} ref={formRef}>
      <div className="mb-2 space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input type="number" name='amount' id="amount" min={0} required />
      </div>
      <div className="mb-2 space-y-2">
        <Label htmlFor="method">Payment Method</Label>
        <Select name='paymentMethod' required>
          <SelectTrigger className="mb-2">
            <SelectValue placeholder="Payment Method" />
          </SelectTrigger>
          <SelectContent>
            {paymentMethods.map((paymentMethod) => (
              <SelectItem key={paymentMethod.value} value={paymentMethod.value}>{paymentMethod.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="mb-2 space-y-2">
        <Label htmlFor="note">Note</Label>
        <Textarea id='note' name="paymentNote" placeholder="Payment Note" />
      </div>

      <SubmitButton buttonText="Add " />
    </form>
  )
}
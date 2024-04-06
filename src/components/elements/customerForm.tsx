'use client';

import { addCustomer } from "@/actions/tickets";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { ChangeEvent, Dispatch, MouseEvent, SetStateAction, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CustomerFormProps {
  setValue: Dispatch<SetStateAction<{ name: string; id: number; }>>
}

export default function CustomerForm({ setValue }: CustomerFormProps){
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const formRef = useRef<HTMLDivElement>(null);
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true)
    // Add Data to FormData
    const data = new FormData();
    data.append('firstName', formData.firstName);
    data.append('lastName', formData.lastName);
    data.append('email', formData.email);
    data.append('phone', formData.phone);

    const response = await addCustomer(data);
    if (response.status === 201) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      })
      toast.success(response.message)
      setIsLoading(false)
      setValue({ name: `${formData.firstName} ${formData.lastName}`, id: response.id as number })
      formRef.current?.remove()
    } else {
      setIsLoading(false)
      toast.error(response.message)
    }
  }

  return (
    <div className="p-3" ref={formRef}>
      <div className="mb-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input name="firstName" id="firstName" className="h-8" value={formData.firstName} onChange={handleChange} required/>
      </div>
      <div className="mb-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input name="lastName" id="lastName" className="h-8" value={formData.lastName} onChange={handleChange} />
      </div>
      <div className="mb-2">
        <Label htmlFor="email">Email</Label>
        <Input type='email' name="email" id="email" className="h-8" value={formData.email} onChange={handleChange} />
      </div>
      <div className="mb-2">
        <Label htmlFor="phone">Phone</Label>
        <Input name="phone" id="phone" className="h-8" value={formData.phone} onChange={handleChange} />
      </div>

      <Button onClick={handleSubmit}>
        {isLoading && <Loader2 className="animate-spin mr-4" />}
        Add Customer
      </Button>
    </div>
  )
}
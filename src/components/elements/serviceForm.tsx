'use client';

import { ChangeEvent, useRef, useState, MouseEvent } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addService } from "@/actions/inventory";

export default function ServiceForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    data.append('name', formData.name);
    data.append('description', formData.description);

    const response = await addService(data);
    if (response.status === 201) {
      setFormData({
        name: '',
        description: '',
      })
      toast.success(response.message)
      setIsLoading(false)
      formRef.current?.remove()
    } else {
      setIsLoading(false)
      toast.error(response.message)
    }
  }
  
  return (
    <div className="p-3" ref={formRef}>
      <div className="mb-2 space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input name="name" id="name" className="h-8" value={formData.name} onChange={handleChange} required />
      </div>
      <div className="mb-2 space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea name="description" id="description" value={formData.description} onChange={handleChange} />
      </div>

      <Button onClick={handleSubmit}>
        {isLoading && <Loader2 className="animate-spin mr-4" />}
        Add Service
      </Button>
    </div>
  )
}

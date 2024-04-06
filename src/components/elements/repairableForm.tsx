'use client';

import { ChangeEvent, MouseEvent, useRef, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { addRepairable } from "@/actions/inventory";
import { toast } from "sonner";

export default function RepairableForm() {
  const [formData, setFormData] = useState({
    name: '',
    problem: '',
  });
  const formRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    data.append('problem', formData.problem);

    const res = await addRepairable(data);
    if (res.status !== 201) {
      toast.error(res.message);
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    toast.success(res.message);
    setFormData({ name: '', problem: '' });
    formRef.current?.remove();
  }
  
  return (
    <div className="p-3" ref={formRef}>
      <div className="mb-2 space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input name="name" id="name" className="h-8" value={formData.name} onChange={handleChange} required />
      </div>
      <div className="mb-2 space-y-2">
        <Label htmlFor="problem">Problem</Label>
        <Textarea name="problem" id="problem" value={formData.problem} onChange={handleChange} />
      </div>

      <Button onClick={handleSubmit}>
        {isLoading && <Loader2 className="animate-spin mr-4" />}
        Add Repairable
      </Button>
    </div>
  );
}
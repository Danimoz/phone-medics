'use client';

import { newSaleTicket } from "@/actions/tickets";
import CustomerForm from "@/components/elements/customerForm";
import ServiceForm from "@/components/elements/serviceForm";
import SubmitButton from "@/components/elements/submitbutton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Customer, Inventory, Service } from "@prisma/client";
import { Check, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface SaleTicketFormProps {
  customers: Customer[] | undefined
  products: Inventory[] | undefined
  services: Service[] | undefined
}

type AddnRemoveItem = 'product' | 'service' 

export default function SaleTicketForm({ customers, products, services }: SaleTicketFormProps) {
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false)
  const [customerData, setCustomerData] = useState({ name: '', id: 0 })
  const { replace } = useRouter();
  
  const [selectedProducts, setSelectedProducts] = useState([
    { productName: '', quantity: 0, productId: 0 }
  ])

  const [selectedServices, setSelectedServices] = useState([
    { serviceName: '', id: 0, amount: 0 }
  ])

  const customersNames = customers?.map(({ firstName, lastName, id }) => {
    return { label: firstName + lastName, value: id.toString() }
  })

  const productNames = products?.map(({ name, id }) => {
    return { label: name, value: id.toString() }
  })

  const serviceNames = services?.map(({ name, id }) => {
    return { label: name, value: id.toString() }
  })

  const handleDeleteItem = (index: number, type: AddnRemoveItem) => {
    if (type === 'product') {
      setSelectedProducts((prev) => {
        const newSelectedProducts = [...prev]
        newSelectedProducts.splice(index, 1)
        return newSelectedProducts
      })
    } else {
      setSelectedServices((prev) => {
        const newSelectedServices = [...prev]
        newSelectedServices.splice(index, 1)
        return newSelectedServices
      })
    }
  }

  const handleQuantityChange = (index: number, value: string, type: AddnRemoveItem) => {
    if (type === 'service') {
      setSelectedServices((prev) => {
        const newSelectedServices = [...prev]
        newSelectedServices[index].amount = parseInt(value)
        return newSelectedServices
      })
    } else {
      setSelectedProducts((prev) => {
        const newSelectedProducts = [...prev]
        newSelectedProducts[index].quantity = parseInt(value)
        return newSelectedProducts
      })
    }
  }

  const addProduct = (type: AddnRemoveItem) => {
    if (type === 'service') {
      setSelectedServices((prev) => {
        return [...prev, { serviceName: '', id: 0, amount: 0 }]
      })
    } else {
      setSelectedProducts((prev) => {
        return [...prev, { productName: '', quantity: 0, productId: 0 }]
      })
    }
  }

  async function handleSubmit(formData: FormData){
    if (customerData.id === 0) {
      toast.error('Please select a customer')
      return
    }

    const data = Object.fromEntries(formData)
    const items = selectedProducts.map((product) => {
      return { id: product.productId, quantity: product.quantity }
    })
  
    const services = selectedServices.filter((service) => service.id !== 0).map((service) => {
      return { id: service.id, amount: service.amount }
    })

    const payment = {
      price: Number(data.paymentPrice as string),
      method: data.paymentMethod as "CASH" | "CARD" | "TRANSFER" | "OTHER",
      note: data.paymentNote as string
    }

    const sale = {
      customer: customerData.id,
      items,
      services,
      payment
    }
    
    const response = await newSaleTicket(sale)
    if (response.status !== 201){
      toast.error(response.message)
      return
    }
    toast.success(response.message)
    replace('/tickets')
  }

  const paymentMethods = [
    { label: 'Cash', value: 'CASH' },
    { label: 'Card', value: 'CARD' },
    { label: 'Transfer', value: 'TRANSFER' },
    { label: 'Other', value: 'OTHER' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sale Ticket</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <form action={handleSubmit}>
          <div className="mb-2">
            <Popover open={customerPopoverOpen} onOpenChange={setCustomerPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant='outline' role="combobox" className='w-full' aria-expanded={customerPopoverOpen}>
                  {customerData.name
                    ? customersNames?.find((customer) => customer.value === customerData.id.toString())?.label
                    : "Select Customer..."
                  }
                  <ChevronsUpDown className="shrink-0 opacity-50 ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Command>
                  <CommandInput placeholder="Search Customers..." />
                  <CommandList>
                    <CommandEmpty>No Customer found.</CommandEmpty>
                    <CommandGroup>
                      {customersNames?.map((customer) => (
                        <CommandItem
                          key={customer.value} 
                          value={customer.label}
                          onSelect={(currentValue) => {
                            setCustomerData(currentValue === customerData.name ? { name: '', id: 0 } : { name: currentValue, id: parseInt(customer.value)})
                            setCustomerPopoverOpen(false)
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", customer.value === customerData.id.toString() ? "opacity-100": 'opacity-0')} />
                          {customer.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="mb-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant='outline'> New Customer</Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <CustomerForm setValue={setCustomerData} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="mb-2 border border-gray-200 p-4">
            <h4 className="text-lg font-bold mb-2">Items</h4>
            {selectedProducts.map((selectedProduct, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant='outline' role="combobox" className='w-full my-1'>
                      {selectedProduct.productName 
                        ? productNames?.find((product) => product.value === selectedProduct.productId.toString())?.label
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
                          {productNames?.map((product) => (
                            <CommandItem
                              key={product.value} 
                              value={product.label}
                              onSelect={(currentValue) => {
                                setSelectedProducts((prev) => {
                                  const newSelectedProducts = [...prev]
                                  newSelectedProducts[index].productName = currentValue
                                  newSelectedProducts[index].productId = parseInt(product.value)
                                  return newSelectedProducts
                                })
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", product.value === selectedProduct.productName ? "opacity-100": 'opacity-0')} />
                              {product.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="w-full">
                  <Input type="number" placeholder="Quantity" onChange={(e) => handleQuantityChange(index, e.target.value, 'product')} min='0' required />
                </div>
                {index !== 0 && (
                  <Button variant='destructive' onClick={() => handleDeleteItem(index, 'product')}>Remove</Button>
                )}
              </div>
            ))}
            <Button variant='outline' onClick={() => addProduct('product')}>Add Item</Button>
          </div>
          
          <div className="mb-2 border border-gray-200 p-4">
            <h1 className="text-lg font-bold mb-2">Services</h1>

            {selectedServices.map((selectedService, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant='outline' role="combobox" className='w-full my-1'>
                      {selectedService.serviceName
                        ? serviceNames?.find((service) => service.label === selectedService.serviceName)?.label
                        : "Select Service ..."
                      }
                      <ChevronsUpDown className="shrink-0 opacity-50 ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Command>
                      <CommandInput placeholder="Search Products..." />
                      <CommandList>
                        <CommandEmpty>No Service found.</CommandEmpty>
                        <CommandGroup>
                          {serviceNames?.map((service) => (
                            <CommandItem
                              key={service.value} 
                              value={service.label}
                              onSelect={(currentValue) => {
                                setSelectedServices((prev) => {
                                  const newSelectedService = [...prev]
                                  newSelectedService[index].serviceName = currentValue
                                  newSelectedService[index].id = parseInt(service.value)
                                  return newSelectedService
                                })
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", service.value === selectedService.serviceName ? "opacity-100": 'opacity-0')} />
                              {service.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="w-full">
                  <Input type="number" placeholder="Amount" onChange={(e) => handleQuantityChange(index, e.target.value, 'service')} min='0' />
                </div>
                {index !== 0 && (
                  <Button variant='destructive' onClick={() => handleDeleteItem(index, 'service')}>Remove</Button>
                )}
              </div>
            ))}
            <Button variant='outline' onClick={() => addProduct('service')}>Add Item</Button>

            <div className="mt-6 mb-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='outline'> New Service</Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 border-gray-300 shadow-xl">
                  <ServiceForm />
                </PopoverContent>
              </Popover>
          </div>

          </div>

          <div className="mb-2 border border-gray-200 p-4">
            <h4 className="text-lg font-bold mb-2">Payment</h4>
            <div className="flex items-center space-x-2">
              <Input type="number" name='paymentPrice' placeholder="Amount Paid" min='0' required />
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
            <Textarea name="paymentNote" placeholder="Payment Note" />
          </div>
          <SubmitButton buttonText="Submit" />
        </form>
      </CardContent>
    </Card>
  )
}
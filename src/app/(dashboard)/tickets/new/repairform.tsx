'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Customer, Inventory, Repairable, Service } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import CustomerForm from "@/components/elements/customerForm";
import ServiceForm from "@/components/elements/serviceForm";
import SubmitButton from "@/components/elements/submitbutton";
import RepairableForm from "@/components/elements/repairableForm";
import { toast } from "sonner";
import { newRepairTicket } from "@/actions/tickets";
import { useRouter } from "next/navigation";

const paymentMethods = [
  { label: 'Cash', value: 'CASH' },
  { label: 'Card', value: 'CARD' },
  { label: 'Transfer', value: 'TRANSFER' },
  { label: 'Other', value: 'OTHER' },
]

interface RepairTicketFormProps {
  customers: Customer[] | undefined
  products: Inventory[] | undefined
  services: Service[] | undefined
  repairables: Repairable[] | undefined
}

type AddnRemoveItem = 'product' | 'service' | 'repairable'

export default function RepairTicketForm({ customers, products, services, repairables }: RepairTicketFormProps) {
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false)
  const [customerData, setCustomerData] = useState({ name: '', id: 0 })
  const { replace } = useRouter();

  const [selectedProducts, setSelectedProducts] = useState([
    { productName: '', quantity: 0, productId: 0, price: 0, productPrice: 0 }
  ])

  const [selectedServices, setSelectedServices] = useState([
    { serviceName: '', id: 0, amount: 0 }
  ])

  const [selectedRepairables, setSelectedRepairables] = useState([
    { repairableName: '', id: 0, problem: '' }
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

  const repairableNames = repairables?.map(({ name, id }) => {
    return { label: name, value: id.toString() }
  })

  const handleDeleteItem = (index: number, type: AddnRemoveItem) => {
    if (type === 'product') {
      setSelectedProducts((prev) => {
        const newSelectedProducts = [...prev]
        newSelectedProducts.splice(index, 1)
        return newSelectedProducts
      })
    } else if (type === 'service') {
      setSelectedServices((prev) => {
        const newSelectedServices = [...prev]
        newSelectedServices.splice(index, 1)
        return newSelectedServices
      })
    } else {
      setSelectedRepairables((prev) => {
        const newSelectedRepairables = [...prev]
        newSelectedRepairables.splice(index, 1)
        return newSelectedRepairables
      })
    }
  }

  const handleQuantityChange = (index: number, value: string, type: AddnRemoveItem) => {
    switch (type) {
      case 'product':
        setSelectedProducts((prev) => {
          const newSelectedProducts = [...prev]
          newSelectedProducts[index].quantity = parseInt(value)
          newSelectedProducts[index].price = newSelectedProducts[index].productPrice * parseInt(value)
          return newSelectedProducts
        })
        break
      case 'repairable':
        setSelectedRepairables((prev) => {
          const newSelectedRepairables = [...prev]
          newSelectedRepairables[index].problem = value
          return newSelectedRepairables
        })
        break
      case 'service':
        setSelectedServices((prev) => {
          const newSelectedServices = [...prev]
          newSelectedServices[index].amount = parseInt(value)
          return newSelectedServices
        })
        break
    }
  }

  const addProduct = (type: AddnRemoveItem) => {
    if (type === 'service') {
      setSelectedServices((prev) => {
        return [...prev, { serviceName: '', id: 0, amount: 0 }]
      })
    } else if (type === 'product') {
      setSelectedProducts((prev) => {
        return [...prev, { productName: '', quantity: 0, productId: 0, price: 0, productPrice: 0 }]
      })
    } else {
      setSelectedRepairables((prev) => {
        return [...prev, { repairableName: '', id: 0, problem: '' }]
      })
    }
  }

  async function handleSubmit(formData: FormData) {
    if (customerData.id === 0) {
      toast.error('Please select a customer')
      return
    }

    const products = selectedProducts.filter((product) => product.quantity !== 0 || product.productId !== 0 )
    const services = selectedServices.filter((service) => service.amount !== 0 || service.id !== 0 )
    const repairables = selectedRepairables.filter((repairable) => !repairable.problem || repairable.id !== 0)

    if (products.length === 0 && services.length === 0 && repairables.length === 0) {
      toast.error('Please add at least one item')
      return
    }

    const data = {
      customer: customerData.id,
      products,
      services,
      repairables,
      payment: {
        amount: Number(formData.get('paymentPrice')),
        method: formData.get('paymentMethod') as 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER',
        note: formData.get('paymentNote') as string
      }
    }

    const response = await newRepairTicket(data)
    if (response.status !== 201){
      toast.error(response.message)
      return
    }
    toast.success(response.message)
    replace('/tickets')
  }

  async function fetchProductPrice(productId: number, index: number){
    const response = await fetch(`/api/get-price/?productId=${productId}`)
    if (!response.ok) {
      toast.error('An error occurred while getting the price')
      return
    }
    const data = await response.json()
    setSelectedProducts((prev) => {
      const newSelectedProducts = [...prev]
      newSelectedProducts[index].productPrice = data.price
      return newSelectedProducts
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Repair Ticket</CardTitle>
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

          <div className="mb-2 border border-gray-200 shadow-inner p-4">
            <h4 className="text-lg font-bold mb-2">Repairables</h4>
            {selectedRepairables.map((selectedRepairable, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant='outline' role="combobox" className='w-full my-1'>
                      {selectedRepairable.repairableName 
                        ? repairableNames?.find((repairable) => repairable.value === selectedRepairable.id.toString())?.label
                        : "Select Repairable..."
                      }
                      <ChevronsUpDown className="shrink-0 opacity-50 ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Command>
                      <CommandInput placeholder="Search Products..." />
                      <CommandList>
                        <CommandEmpty>No Repairable found.</CommandEmpty>
                        <CommandGroup>
                          {repairableNames?.map((repairable) => (
                            <CommandItem
                              key={repairable.value} 
                              value={repairable.label}
                              onSelect={(currentValue) => {
                                setSelectedRepairables((prev) => {
                                  const newSelectedRepairable = [...prev]
                                  newSelectedRepairable[index].repairableName = currentValue
                                  newSelectedRepairable[index].id = parseInt(repairable.value)
                                  return newSelectedRepairable
                                })
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", repairable.value === selectedRepairable.id.toString() ? "opacity-100": 'opacity-0')} />
                              {repairable.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="w-full">
                  <Input placeholder="Problem" onChange={(e) => handleQuantityChange(index, e.target.value, 'repairable')} />
                </div>
                {index !== 0 && (
                  <Button variant='destructive' onClick={() => handleDeleteItem(index, 'repairable')}>Remove</Button>
                )}
              </div>
            ))}
            <Button variant='outline' onClick={() => addProduct('repairable')}>Add Item</Button>

            <div className="my-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='outline'> New Repairable </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <RepairableForm />
                </PopoverContent>
              </Popover>
            </div>
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
                                  fetchProductPrice(parseInt(product.value), index)
                                  return newSelectedProducts
                                })
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", product.value === selectedProduct.productId.toString() ? "opacity-100": 'opacity-0')} />
                              {product.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="w-full">
                  <Input type="number" placeholder="Quantity" onChange={(e) => handleQuantityChange(index, e.target.value, 'product')} min='0' />
                </div>
                <p className="w-full">₦ {selectedProduct.price.toLocaleString()}</p>
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
                              <Check className={cn("mr-2 h-4 w-4", service.value === selectedService.id.toString() ? "opacity-100": 'opacity-0')} />
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
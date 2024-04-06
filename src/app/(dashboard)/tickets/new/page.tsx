import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SaleTicketForm from "./saleform";
import { getCustomers } from "@/actions/tickets";
import { getAllItems, getRepairables, getServices } from "@/actions/inventory";
import RepairTicketForm from "./repairform";

export default async function NewTicket() {
  const customers = await getCustomers();
  const { items: products } = await getAllItems();
  const { services } = await getServices();
  const { repairables } = await getRepairables();

  return (
    <div className="p-4 overflow-auto">
      <section className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">New Ticket</h1>
      </section>

      <section className="mt-6">
        <Tabs defaultValue="sale">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="sale">Sale Ticket</TabsTrigger>
            <TabsTrigger value="repair">Repair Ticket</TabsTrigger>
          </TabsList>
          <TabsContent value="sale">
            <SaleTicketForm customers={customers} products={products} services={services} />
          </TabsContent>
          <TabsContent value="repair">
            <RepairTicketForm customers={customers} products={products} services={services} repairables={repairables} />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
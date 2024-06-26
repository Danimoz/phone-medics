import { getSingleTicket } from "@/actions/tickets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddPayment from "./addPayment";
import PrintInvoice from "./printInvoice";
import CloseTicket from "./closeTicket";
import { getSession } from "@/actions/auth";
import AddItemModal from "@/components/elements/addItemModal";
import AddRepairableModal from "@/components/elements/addRepairableModal";

export default async function SingleTicket({ params }: { params: { id: string } }) {
  const { ticket } = await getSingleTicket(Number(params.id));
  const { user } = await getSession();
  
  if (!ticket) return (
    <main className="container p-4">
      <Card>
        <CardHeader>
          <CardTitle>Single Ticket</CardTitle>
        </CardHeader>
        <p>Couldn&apos;t fetch Ticket at this time. Try again later</p>
      </Card>
    </main>
  )

  return (
    <main className="container p-4">
      <Card>
        <CardHeader>
          <CardTitle>Ticket Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <h2 className="text-xl font-bold uppercase">{ticket.type === "SALE" ? "Sale" : "Repair"} Ticket</h2>
          <h3 className="text-lg font-semibold">ID: {ticket.id}</h3>
          <h3 className="text-lg font-semibold">Status: {ticket.status}</h3>
          <p className="text-sm">Date: {new Date(ticket.createdAt).toDateString()}</p>
          {ticket.saleTicket && (
            <>
              <div>
                <h3 className="text-lg font-semibold">Items: </h3>
                <div className="flex justify-between gap-4">
                  {ticket.saleTicket?.itemsSold?.map((item) => (
                    <div key={item.id}>
                      <p className="font-semibold">{item.inventory.name}</p>
                      <p className="text-sm">Quantity: {item.quantity}</p>
                    </div>
                  ))}
                  {user.isAdmin && (
                    <AddItemModal id={ticket.saleTicket.id} type={ticket.type} />
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Services: </h3>
                {ticket.saleTicket?.serviceForSale?.map((service) => (
                  <div key={service.id}>
                    <p className="font-semibold">{service.service.name}</p>
                    <p className="text-sm">Price: ₦ {service.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {ticket.repairTicket && (
            <>
              <div>
                <h3 className="text-lg font-semibold">Items: </h3>
                <div className="flex justify-between gap-4"> 
                  {ticket.repairTicket.itemUsedForRepair?.map((item) => (
                    <div key={item.id}>
                      <p className="font-semibold">{item.inventory.name}</p>
                      <p className="text-sm">Quantity: {item.quantity}</p>
                    </div>
                  ))}

                  {user.isAdmin && (
                    <AddItemModal id={ticket.repairTicket.id} type={ticket.type} /> 
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Services: </h3>
                {ticket.repairTicket.serviceForRepair?.map((service) => (
                  <div key={service.id}>
                    <p className="font-semibold">{service.service.name}</p>
                    <p className="text-sm">Price: ₦ {service.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-lg font-semibold">Repairables: </h3>
                <div className="flex gap-x-4 justify-between">
                  {ticket.repairTicket.repairable?.map((repairable) => (
                    <div key={repairable.id}>
                      <p className="font-semibold">{repairable.repairable.name}</p>
                      <p className="text-sm">Problem: {repairable.problem}</p>
                    </div>
                  ))}

                  {user.isAdmin && (
                    <AddRepairableModal id={ticket.repairTicket.id} />
                  )}
                </div>
              </div>
            </>
          )}
          
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <div className="flex justify-between gap-4">
            <div className="p-6 rounded-lg shadow">
              <p className="font-semibold">Customer: {ticket.customer.firstName} {ticket.customer.lastName}</p>
              <p className="text-sm">Phone: {ticket.customer.phone} </p>
              <p className="text-sm">Email: {ticket.customer.email} </p>
            </div>
            <div className="p-6 rounded-lg shadow">
              <p className="font-semibold">{ticket.type === 'REPAIR' ? "Technician" : "Seller"}: {ticket.seller.firstName} {ticket.seller.lastName}</p>
              <p className="text-sm">Email: {ticket.seller.email} </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <h5 className="font-semibold">Total Price: ₦ {ticket.price.toLocaleString()}</h5>
          <h5 className="font-semibold">Amount Paid: ₦ {ticket.payment.reduce((acc, payment) => acc + payment.amount, 0).toLocaleString()}</h5>
          <h5 className="font-semibold">Balance: ₦ {(ticket.price - ticket.payment.reduce((acc, payment) => acc + payment.amount, 0)).toLocaleString()}</h5>
          
          <h3 className="text-lg font-semibold">Payments</h3>
          <div className="flex gap-x-4 mb-6">
            {ticket.payment.map((payment) => (
              <div key={payment.id} className="shadow-lg py-4 px-6 rounded-lg border border-gray-200">
                <p className="text-base font-semibold">Amount: ₦ {payment.amount.toLocaleString()}</p>
                <p className="text-sm">Method: {payment.method}</p>
                <p className="text-sm">Date: {new Date(payment.createdAt).toDateString()}</p>
                <p className="text-sm">Note: {payment.note}</p>
              </div>
            ))}
          </div>

          <AddPayment ticketId={ticket.id} />
        </CardContent>
      </Card>

      <div className="flex justify-between gap-4 items-center">
        <PrintInvoice />
        <CloseTicket ticketId={ticket.id} status={ticket.status} />
      </div>

    </main>
  );
}
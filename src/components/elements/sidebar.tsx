import { getSession } from "@/actions/auth";
import { BoxIcon, HomeIcon, Settings, Ticket, UserIcon } from "lucide-react";
import Link from "next/link";
import Logout from "./logout";


export default async function Sidebar(){
  const { user } = await getSession();

  const sidebarItems = [
    { icon: <Ticket />, name: 'Tickets', link: '/tickets' },
    { icon: <UserIcon />, name: 'Customers', link: '/customers' },
    { icon: <UserIcon />, name: 'Staff', link: '/staff' },
    { icon: <BoxIcon />, name: 'Products', link: '/products' } 
  ]
  if (user && user.isAdmin) {
    sidebarItems.push({ icon: <BoxIcon />, name: 'Inventory', link: '/inventory' })
  }

  return (
    <div className="border-r border-gray-200 dark:border-gray-700 flex flex-col w-64 min-h-screen shadow-xl">
      <div className="flex items-center p-4">
        <Link className="flex items-center gap-2 text-lg font-bold" href="/">
          <HomeIcon className="h-6 w-6" />
          <span>Home</span>
        </Link>
      </div>

      <nav className="flex-1 min-h-0 overflow-auto mt-9">
        <div className="flex flex-col gap-px">
          {sidebarItems.map(({ icon , name, link }) => (
            <Link key={name} href={link} className="group flex items-center gap-4 p-4 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
              {icon}
              <span>{name}</span>
            </Link>
          ))}
          <Logout />
        </div>
      </nav>
    </div>
  )
}
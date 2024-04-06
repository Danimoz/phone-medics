'use client';

import Link from "next/link";
import { Button } from "../ui/button";
import { usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function Pagination({ hasNextPage, hasPreviousPage }: PaginationProps){
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  return (
    <div className="flex justify-between items-center p-4">
      <Button asChild variant='outline'>
        <Link
          href={{pathname, query: {
            page: hasPreviousPage ? currentPage - 1 : 1,
          }}}
          className={`${!hasPreviousPage && 'pointer-events-none opacity-50' }`}
        >
          Previous
        </Link>
      </Button>

      <Button asChild variant='outline'>
        <Link 
          href={{ pathname, query: {
            page: hasNextPage ? currentPage + 1 : currentPage,
          }}}
          className={`${!hasNextPage && 'pointer-events-none opacity-50' }`}
        >
          Next
        </Link>
      </Button>

    </div>
  )
}
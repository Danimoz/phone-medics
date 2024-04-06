'use client';

import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export default function Search({ placeholder }: { placeholder: string }){
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term){
      params.set('search', term);
    } else {
      params.delete('search');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 400);


  return (
    <div className="relative mx-auto rounded-lg p-4">
      <span className="absolute inset-y-0 left-2 flex items-center pl-3">
        <SearchIcon />
      </span>
      <Input 
        type="search" 
        placeholder={placeholder} 
        className="w-full pl-10" 
        onChange={(e) => {
          handleSearch(e.target.value) 
        }}
        defaultValue={searchParams.get('search')?.toString()}
      />
    </div>
  )
}
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

type SortPopoverProps = {
  sortBy: string;
  onSortChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export default function SortPopover({
  sortBy,
  onSortChange,
}: SortPopoverProps) {
  // State untuk mengontrol popover
  const [isOpenModal, setIsOpenModal] = useState(false);

  // Options untuk sorting
  const sortOptions = [
    { value: "createdAt", label: "Terbaru" },
    { value: "viewCount", label: "Paling Banyak Dilihat" },
    { value: "title", label: "Judul A-Z" },
  ];

  // Function untuk handle selection
  const handleSortSelect = (value: any) => {
    onSortChange(value); // fungsi yang sudah ada
    setIsOpenModal(false); // tutup popover setelah memilih
  };

  return (
    <Popover open={isOpenModal} onOpenChange={setIsOpenModal}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="sm:w-[250px] w-fit rounded-full border border-primary justify-between"
        >
          {/* Icon untuk mobile, text untuk desktop */}
          <span className="block sm:hidden">
            <Icons.Filter />
          </span>
          <span className="hidden sm:block">
            {sortOptions.find((option) => option.value === sortBy)?.label ||
              "Pilih urutan"}
          </span>
          {/* Chevron icon untuk desktop */}
          <span className="hidden sm:block ">
            <Icons.ChevronDown
              className={`h-4 w-4 transition-transform ${
                isOpenModal ? "rotate-180" : ""
              }`}
            />
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[250px] p-2 font-mono" align="start">
        <div className="space-y-1">
          {sortOptions.map((option) => (
            <Button
              key={option.value}
              variant="ghost"
              className={`w-full justify-between text-left h-auto py-2 px-3 ${
                sortBy === option.value ? "bg-accent" : ""
              }`}
              onClick={() => handleSortSelect(option.value)}
            >
              <span>{option.label}</span>
              {sortBy === option.value && <Icons.Check className="h-4 w-4" />}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

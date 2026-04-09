import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";

export default function Page() {
  return (
    <>
      <div className="flex flex-col gap-4">
        <SectionCards />
        <DataTable />
      </div>
    </>
  );
}

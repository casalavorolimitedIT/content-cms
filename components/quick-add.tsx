"use client";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";

const QuickAdd = ({ roles }: { roles: string[] }) => {
  const router = useRouter();
  return (
    <>
      <div
        onClick={() =>
          router.push(`/dashboard/add-post?roles=${roles.join(",")}`)
        }
        className="fixed z-30 bottom-10 right-10 cursor-pointer shadow-xl shadow-black/40 border border-slate-100 bg-[#ff6900] p-4 rounded-full"
      >
        <HugeiconsIcon
          icon={PlusSignIcon}
          strokeWidth={2}
          className="w-6 h-6 text-white"
        />
      </div>
    </>
  );
};

export default QuickAdd;

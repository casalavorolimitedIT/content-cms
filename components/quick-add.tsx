"use client";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import AddPost from "./add-post";

const QuickAdd = ({ roles }: { roles: string[] }) => {
  const [postOpen, setPostOpen] = useState(false);
  return (
    <>
      <div
        onClick={() => setPostOpen(true)}
        className="fixed z-30 bottom-10 right-10 cursor-pointer shadow-xl shadow-black/40 border border-slate-100 bg-[#ff6900] p-4 rounded-full"
      >
        <HugeiconsIcon
          icon={PlusSignIcon}
          strokeWidth={2}
          className="w-6 h-6 text-white"
        />
      </div>
      {postOpen && <AddPost roles={roles} onClose={() => setPostOpen(false)} />}
    </>
  );
};

export default QuickAdd;

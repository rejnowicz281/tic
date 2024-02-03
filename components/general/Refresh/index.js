"use client";

import { useRouter } from "next/navigation";
import { IoIosRefresh } from "react-icons/io";

export default function RefreshButton() {
    const router = useRouter();

    return (
        <button
            className="rounded max-w-[400px] w-full flex items-center justify-center gap-3 bg-gray-700 p-3 font-bold text-gray-300 shadow-sm hover:bg-gray-600"
            onClick={() => router.refresh()}
        >
            <IoIosRefresh className="text-2xl" />
            Refresh
        </button>
    );
}

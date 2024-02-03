"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function FreshDataProvider({ children }) {
    const router = useRouter();

    useEffect(() => {
        router.refresh();
    }, []);

    return <>{children}</>;
}

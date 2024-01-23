"use client";

import Game from "@/components/Game";

import { useSearchParams } from "next/navigation";

export default function PlayPage() {
    const queryParams = useSearchParams();

    const smartAI = queryParams.get("smart") === "true";
    const randomAI = queryParams.get("random") === "true";
    const gameID = queryParams.get("game");

    return <Game smartAI={smartAI} randomAI={randomAI} gameID={gameID} />;
}

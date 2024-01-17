"use client";

import Board from "@/components/Board";
import { useState } from "react";

export default function PlayPage() {
    const [hits, setHits] = useState([...Array(3)].map(() => [...Array(3)].map(() => null)));

    function onCellClick(row, column) {
        const newHits = [...hits];
        newHits[row][column] = "X";
        setHits(newHits);
    }

    return (
        <div>
            <h1>Play Page</h1>
            <Board hits={hits} onCellClick={onCellClick} />
        </div>
    );
}

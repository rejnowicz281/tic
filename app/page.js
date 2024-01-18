import Link from "next/link";

export default function Home() {
    return (
        <>
            <h1>welcome to tic</h1>
            <p>choose your gameplay</p>
            <div>
                <Link href="/play?smart=true">you vs smart ai (recommended)</Link>
            </div>
            <div>
                <Link href="/play?random=true">you vs random ai</Link>
            </div>
            <div>
                <Link href="/play">you vs friend</Link>
            </div>
        </>
    );
}

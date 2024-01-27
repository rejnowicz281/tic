import Link from "next/link";

export default function Home() {
    return (
        <>
            <h1>welcome to tic</h1>
            <p>choose your gameplay</p>
            <div>
                <Link href="/play?smart=true">play with smart ai (recommended)</Link>
            </div>
            <div>
                <Link href="/play?random=true">play with random ai</Link>
            </div>
            <div>
                <Link href="/play?online=true">play online</Link>
            </div>
            <div>
                <Link href="/play">play with a friend</Link>
            </div>
        </>
    );
}

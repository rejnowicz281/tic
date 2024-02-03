import "./globals.css";

export const metadata = {
    title: "tic",
    description: "toes,..... as in - toe... tic... toe...",
};

export default function RootLayout({ children }) {
    return (
        <html className="h-full" lang="en">
            <body className="min-h-full flex flex-col bg-gray-800 text-white">{children}</body>
        </html>
    );
}

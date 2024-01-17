import "./globals.css";

export const metadata = {
    title: "tic",
    description: "toes,..... as in - toe... tic... toe...",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}

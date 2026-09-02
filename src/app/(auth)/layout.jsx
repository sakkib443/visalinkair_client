import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function AuthLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex flex-1 flex-col">
                {children}
            </main>
            <Footer />
        </div>
    );
}

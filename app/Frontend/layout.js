import Header from "./_Components/header";
import Footer from "./_Components/footer";

export default function FrontendLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

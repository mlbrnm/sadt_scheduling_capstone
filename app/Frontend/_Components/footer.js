export default function Footer() {
  return (
    <footer className="background-headerfooter py-4 px-6 text-white flex items-center justify-between">
      <p className="text-center flex-1">
        © {new Date().getFullYear()} SAIT School for Advanced Digital
        Technology. All rights reserved.
      </p>
      <img src="/sadt_icon_bw.png" alt="SAIT Icon" className="h-6 w-6" />
    </footer>
  );
}

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={poppins.className}>
      {children}
    </div>
  );
}
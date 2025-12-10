import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FaFacebookF, FaInstagram} from "react-icons/fa";
import { SiTiktok } from "react-icons/si";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c0a1e] via-[#1b0a4d] to-[#2d1b69] text-white flex flex-col">
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <ul className="flex gap-8 text-sm font-medium">
          {["Contact", "Education", "Hobbies","Favorite"].map((item) => (
            <li key={item} className="hover:text-blue-500 cursor-pointer">
               <Link href={`/${item.toLowerCase()}`}>
                 {item}
               </Link>
            </li>
          ))}
       </ul>
     </nav>
      <main className="flex flex-col-reverse md:flex-row items-center justify-between max-w-7xl mx-auto px-8 py-20 gap-12">
        <div className="max-w-xl">
          <div className="flex gap-4 mb-6 mt-10">
            <a href="https://www.facebook.com/gregprado17" className="border border-white-500 text-white-500 rounded-full p-2 hover:bg-blue-500 hover:text-white transition">
              <FaFacebookF />
            </a>
            <a href="https://www.instagram.com/angimongangkol/" className="border border-white-500 text-white-500 rounded-full p-2 hover:bg-blue-500 hover:text-white transition">
              <FaInstagram />
            </a>
            <a href="https://www.tiktok.com/@boplaxinism?_r=1&_t=ZS-91WcWx6DgS9" className="border border-white-500 text-white-500 rounded-full p-2 hover:bg-blue-500 hover:text-white transition">
             <SiTiktok />
             </a>
          </div>

          <h1 className="text-5xl font-extrabold mb-4">
            I am Greg Philip Prado
          </h1>
          <p className="text-lg italic text-gray-300 mb-8">
            I’m Greg, BSIT Student in Naga College Foundation Inc.
          </p>
          <Link href="/about">
          <Button className="bg-blue-500 hover:bg-blue-700 px-6 py-3 text-lg font-semibold shadow-lg">
            My Background
          </Button>
          </Link>
        </div> 
        
        <div className="relative w-72 h-72 md:w-96 md:h-96">
          <Image
            src="/grgp.png"
            alt="Greg Philip Prado"
            width={300}
            height={300}
            objectFit="contain"
            className="rounded-lg shadow-2xl"
          />
        </div>
      </main>
    </div>
  );
}

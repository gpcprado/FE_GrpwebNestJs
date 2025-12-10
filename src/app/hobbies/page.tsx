import Link from "next/link";
import Image from "next/image";

export default function Education() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c0a1e] via-[#1b0a4d] to-[#2d1b69] text-white flex flex-col items-center px-8 py-20">
      <h1 className="text-5xl font-extrabold mb-12">My Hobbies</h1>
      <div className="max-w-4xl w-full space-y-16">
        
        <div className="flex flex-col md:flex-row items-center bg-[#2a144e] rounded-xl shadow-xl p-8 gap-8">
          <div className="flex-1">
            <h2 className="text-5xl font-extrabold mb-2">Basketball</h2>
          </div>
          <div className="flex-1 relative w-full h-64 md:h-72">
            <Image
              src="/basketball.jpg"
              alt="Greg Philip Prado"
              fill
              className="rounded-lg shadow-2xl object-contain"
            />
          </div>
          
        </div>
        <div className="flex flex-col md:flex-row items-center bg-[#2a144e] rounded-xl shadow-xl p-8 gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-extrabold mb-2">Gaming</h2>
            <p className="text-gray-300 italic mb-1">- Call Of Duty</p>
            <p className="text-gray-300 italic mb-1">- Honor Of Kings</p>
            <p className="text-gray-300 italic mb-1">- BloodStrike</p>
            <p className="text-gray-300 italic mb-1">- Mobile Legends Bang Bang</p>
          </div>
          <div className="flex-1 relative w-full h-64 md:h-72">
            <Image
              src="/gamingg.jpg"
              alt="Greg Philip Prado"
              fill
              className="rounded-lg shadow-2xl object-contain"
            />
          </div>
        </div>
        
      </div>
      <Link href="/creator">
        <button className="mt-12 bg-blue-500 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold shadow-lg transition">
          Back to Home
        </button>
      </Link>
    </div>
  );
}

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen items-center justify-center bg-gray-900">
      {/* Başlık ve açıklama */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-2 text-white">Nissan Skyline Modelleri</h1>
        <p className="text-lg text-gray-300">
          Bu sayfada Nissan Skyline'ın üç efsanevi modeli olan R-32, R-33 ve R-34'ü keşfedebilirsiniz.
        </p>
      </div>
      {/* Üç model kutusu */}
      <div className="flex gap-8">
        {/* R-32 */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between items-center w-48 h-64 text-center transition-transform duration-200 hover:scale-105 hover:shadow-xl cursor-pointer">
          <div>
            <h2 className="text-xl font-semibold mb-2">R-32</h2>
            <p className="text-gray-500 mb-4">İlk efsanevi Skyline modeli.</p>
          </div>
          <Link href="/r-32" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full">
            R-32'yi İncele
          </Link>
        </div>
        {/* R-33 */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between items-center w-48 h-64 text-center transition-transform duration-200 hover:scale-105 hover:shadow-xl cursor-pointer">
          <div>
            <h2 className="text-xl font-semibold mb-2">R-33</h2>
            <p className="text-gray-500 mb-4">Gelişmiş performans ve konfor.</p>
          </div>
          <Link href="/r-33" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full">
            R-33'ü İncele
          </Link>
        </div>
        {/* R-34 */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between items-center w-48 h-64 text-center transition-transform duration-200 hover:scale-105 hover:shadow-xl cursor-pointer">
          <div>
            <h2 className="text-xl font-semibold mb-2">R-34</h2>
            <p className="text-gray-500 mb-4">Efsanenin zirvesi, modern Skyline.</p>
          </div>
          <Link href="/r-34" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full">
            R-34'ü İncele
          </Link>
        </div>
      </div>
    </main>
  );
}

import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Bassan.os</h1>
        <p className="text-gray-600 mb-8">Business Operating System</p>
        <div className="space-x-4">
          <Link
            href="/login"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="border border-primary-600 text-primary-600 px-6 py-3 rounded-lg hover:bg-primary-50 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  )
}

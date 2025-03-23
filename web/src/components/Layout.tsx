import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 p-4 md:p-6 pt-12">
        <Outlet />
      </main>
      <Navbar />
    </div>
  )
}


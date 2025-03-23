"use client"

import { Link, useLocation } from "react-router-dom"
import { X, Home, Upload, Settings } from "lucide-react"
import { Button } from "./ui/button"
import { cn } from "../lib/utils"

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation()

  const links = [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/upload", label: "Upload", icon: Upload },
    { to: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-background border-r p-4 pt-20 transition-transform duration-300 md:translate-x-0 md:z-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 md:hidden" onClick={onClose}>
          <X className="h-5 w-5" />
          <span className="sr-only">Close sidebar</span>
        </Button>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.to

            return (
              <Link key={link.to} to={link.to} onClick={() => onClose()}>
                <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start">
                  <Icon className="h-5 w-5 mr-3" />
                  {link.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="rounded-lg bg-muted p-4">
            <h4 className="font-medium mb-2">Octopush</h4>
            <p className="text-sm text-muted-foreground">A concurrent file server for easy file sharing</p>
          </div>
        </div>
      </aside>
    </>
  )
}


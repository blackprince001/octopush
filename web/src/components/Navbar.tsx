"use client"

import { Link, useLocation } from "react-router-dom"
import { Upload, Moon, Sun, Laptop } from "lucide-react"
import { Button } from "./ui/button"
import { useTheme } from "./ThemeProvider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

export default function Navbar() {
  const { theme, setTheme } = useTheme()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="fixed bottom-0 left-0 right-0 z-30 bg-background border-b h-16 flex items-center px-4 md:px-6">
      <div className="container mx-auto flex items-center gap-8 justify-center">
        <nav className="hidden md:flex items-center gap-4">
          <Link to="/">
            <Button variant={isActive("/") ? "secondary" : "ghost"} className="font-medium">
              Files
            </Button>
          </Link>
          <Link to="/upload">
            <Button variant={isActive("/upload") ? "secondary" : "ghost"} className="font-medium">
              Upload
            </Button>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/upload" className="md:hidden">
            <Button size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                {theme === "light" ? (
                  <Sun className="h-5 w-5" />
                ) : theme === "dark" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Laptop className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="h-4 w-4 mr-2" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Laptop className="h-4 w-4 mr-2" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}


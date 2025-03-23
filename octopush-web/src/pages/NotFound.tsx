import { Link } from "react-router-dom"
import { FileQuestion } from "lucide-react"
import { Button } from "../components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto py-32">
      <FileQuestion className="h-24 w-24 text-muted-foreground mb-6" />
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-muted-foreground mb-8">The page you are looking for doesn't exist or has been moved.</p>
      <Link to="/">
        <Button>Return to Dashboard</Button>
      </Link>
    </div>
  )
}


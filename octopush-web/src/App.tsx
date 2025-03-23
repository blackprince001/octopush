import { Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import Layout from "./components/Layout"
import FilesPage from "./pages/FilesPage"
import Upload from "./pages/Upload"
import FileDetails from "./pages/FileDetails"
import NotFound from "./pages/NotFound"
import { ThemeProvider } from "./components/ThemeProvider"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="octopush-theme">
      <Toaster position="bottom-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<FilesPage />} />
          <Route path="upload" element={<Upload />} />
          <Route path="files/:shortLink" element={<FileDetails />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ThemeProvider>
  )
}

export default App


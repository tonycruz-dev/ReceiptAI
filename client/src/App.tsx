import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReceiptListPage from "./pages/ReceiptListPage";
import UploadReceiptPage from "./pages/UploadReceiptPage";
import ReceiptDetailsPage from "./pages/ReceiptDetailsPage";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="max-w-6xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<ReceiptListPage />} />
          <Route path="/upload" element={<UploadReceiptPage />} />
          <Route path="/receipts/:id" element={<ReceiptDetailsPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

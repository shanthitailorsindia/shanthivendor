import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import VendorsPage from "@/pages/VendorsPage";
import PurchaseBillsPage from "@/pages/PurchaseBillsPage";
import PaymentsPage from "@/pages/PaymentsPage";
import ProductsPage from "@/pages/ProductsPage";
import QRPriceTagsPage from "@/pages/QRPriceTagsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/purchase-bills" element={<PurchaseBillsPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/qr-price-tags" element={<QRPriceTagsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

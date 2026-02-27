import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductSelector } from "../ProductSelector";
import { Printer, Package } from "lucide-react";
import { BarcodePreview } from "./BarcodePreview";
import { printBarcodeStickers } from "@/utils/barcodePrintUtils";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";

interface Product {
  id: string;
  name: string;
  item_code: string;
  cost_price: number;
  unit_price: number;
  category: string;
  hsn_code: string;
  gst_rate: number;
  color?: string;
  size?: string;
}

export const IndividualProductPrint = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [numberOfStickers, setNumberOfStickers] = useState<number>(1);
  const [stickerSize, setStickerSize] = useState<string>("2-across");
  const [includePrice, setIncludePrice] = useState<boolean>(true);
  const { toast } = useToast();

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const isReadymadeCostume = (category: string) => {
    return category?.toLowerCase().includes("readymade") || category?.toLowerCase().includes("costume");
  };

  const generatePrintContent = async () => {
    if (!selectedProduct) return "";

    const is2Across = stickerSize === "2-across";
    const isJewelleryTag = stickerSize === "jewellery-tag";
    const is4Across = stickerSize === "4-across";
    const showColorSize = is2Across && isReadymadeCostume(selectedProduct.category);

    // Generate QR code data URL for all formats
    const qrDataUrl = await QRCode.toDataURL(selectedProduct.item_code, {
      width: is4Across ? 80 : is2Across ? 120 : 80,
      margin: 1,
      errorCorrectionLevel: "M",
    });

    const stickers = Array.from({ length: numberOfStickers }, (_, index) => {
      if (isJewelleryTag) {
        return `
          <div class="barcode-sticker jewellery-layout" id="sticker-${index}">
            <div class="barcode-section">
              <div class="barcode-container">
                <img src="${qrDataUrl}" class="qr-code-img" alt="QR Code" />
              </div>
              <div class="item-code-below">${selectedProduct.item_code}</div>
            </div>
            <div class="details-section">
              <div class="product-name">${selectedProduct.name}</div>
              <div class="product-code">${selectedProduct.item_code}</div>
              ${includePrice ? `<div class="price">Rs. ${selectedProduct.unit_price.toFixed(2)}</div>` : ""}
            </div>
          </div>
        `;
      } else if (is2Across) {
        return `
          <div class="barcode-sticker two-across-layout" id="sticker-${index}">
            <div class="barcode-section">
              <img src="${qrDataUrl}" class="qr-code-img qr-2across" alt="QR Code" />
              <div class="item-code-below">${selectedProduct.item_code}</div>
            </div>
            <div class="details-section">
              <div class="company-name">SHANTHI TAILORS</div>
              <div class="product-name">${selectedProduct.name}</div>
              ${showColorSize && selectedProduct.color ? `<div class="variant-info color">Color: ${selectedProduct.color}</div>` : ""}
              ${showColorSize && selectedProduct.size ? `<div class="variant-info size">Size: ${selectedProduct.size}</div>` : ""}
              ${includePrice ? `<div class="price">Our Price : ₹${selectedProduct.unit_price.toFixed(2)}</div>` : ""}
            </div>
          </div>
        `;
      } else {
        return `
          <div class="barcode-sticker four-across-layout" id="sticker-${index}">
            <div class="four-across-main">
              <div class="four-across-company-vertical">SHANTHI TAILORS</div>
              <div class="four-across-center">
                <img src="${qrDataUrl}" class="qr-code-img" alt="QR Code" />
                ${includePrice ? `<div class="price">₹${selectedProduct.unit_price.toFixed(2)}</div>` : ""}
              </div>
              <div class="four-across-name-vertical">${selectedProduct.name}</div>
            </div>
            <div class="four-across-bottom-code">${selectedProduct.item_code}</div>
          </div>
        `;
      }
    }).join("");

    return `<div class="print-container">${stickers}</div>`;
  };

  const handlePrint = async () => {
    if (!selectedProduct) return;

    try {
      // Create a temporary div with print content
      const printDiv = document.createElement("div");
      printDiv.id = "barcode-print-content";
      printDiv.innerHTML = await generatePrintContent();
      document.body.appendChild(printDiv);

      // Trigger print
      await printBarcodeStickers("barcode-print-content", {
        format: stickerSize as any,
        includePrice,
        onBeforePrint: () => {
          toast({
            title: "Printing Started",
            description: `Sending ${numberOfStickers} sticker(s) to Citizen Label Printer...`,
          });
        },
        onAfterPrint: () => {
          toast({
            title: "Print Complete",
            description: `Successfully printed ${numberOfStickers} sticker(s)`,
          });
          // Clean up
          document.body.removeChild(printDiv);
        },
      });
    } catch (error) {
      console.error("Print error:", error);
      toast({
        title: "Print Error",
        description: "Failed to print barcodes. Please check your printer connection.",
        variant: "destructive",
      });
    }
  };

  const handleIncludePriceChange = (checked: boolean | "indeterminate") => {
    setIncludePrice(checked === true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Individual Product Barcode Print
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="product-selector">Select Product</Label>
                <ProductSelector onProductSelect={handleProductSelect} />
              </div>

              <div>
                <Label htmlFor="sticker-count">Number of Stickers</Label>
                <Input
                  id="sticker-count"
                  type="number"
                  min="1"
                  max="100"
                  value={numberOfStickers}
                  onChange={(e) => setNumberOfStickers(parseInt(e.target.value) || 1)}
                />
              </div>

              <div>
                <Label htmlFor="sticker-size">Sticker Format</Label>
                <Select value={stickerSize} onValueChange={setStickerSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jewellery-tag">Jewellery Tag (92x15mm)</SelectItem>
                    <SelectItem value="2-across">2 Across (50x25mm)</SelectItem>
                    <SelectItem value="4-across">4 Across (25x20mm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="include-price" checked={includePrice} onCheckedChange={handleIncludePriceChange} />
                <Label htmlFor="include-price">Include Price on Label</Label>
              </div>

              <Button onClick={handlePrint} disabled={!selectedProduct} className="w-full flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Print {numberOfStickers} Sticker{numberOfStickers > 1 ? "s" : ""}
              </Button>
            </div>

            <div>
              {selectedProduct && (
                <BarcodePreview product={selectedProduct} size={stickerSize} includePrice={includePrice} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

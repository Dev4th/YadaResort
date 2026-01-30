import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Minus, ShoppingCart, Trash2, CreditCard, Banknote, QrCode, Search, Printer, Receipt, X, Building, Loader2, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useProductStore, useOrderStore, useSettingsStore } from '@/stores/supabaseStore';
import { generatePromptPayQR, generateBankTransferQR, THAI_BANKS } from '@/lib/promptpay';

const categories = [
  { id: 'all', name: 'ทั้งหมด' },
  { id: 'beverage', name: 'เครื่องดื่ม' },
  { id: 'alcohol', name: 'แอลกอฮอล์' },
  { id: 'snack', name: 'ของว่าง' },
  { id: 'other', name: 'อื่นๆ' },
];

const paymentIcons: Record<string, any> = {
  cash: Banknote,
  card: CreditCard,
  transfer: Building,
  promptpay: QrCode,
};

export default function Bar() {
  const { products, fetchProducts } = useProductStore();
  const { createOrder } = useOrderStore();
  const { settings } = useSettingsStore();
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [guestName, setGuestName] = useState('');
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [paymentInfoOpen, setPaymentInfoOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [qrLoading, setQrLoading] = useState(false);
  const [qrExpiryTime, setQrExpiryTime] = useState<number>(0); // timestamp เมื่อ QR หมดอายุ
  const [qrTimeLeft, setQrTimeLeft] = useState<number>(0); // เวลาที่เหลือ (วินาที)
  const [selectedBankIndex, setSelectedBankIndex] = useState<number | null>(null); // ธนาคารที่เลือกสำหรับโอนเงิน
  const [bankQrDataUrl, setBankQrDataUrl] = useState<string>(''); // QR สำหรับโอนเงิน
  const [bankQrLoading, setBankQrLoading] = useState(false);
  const QR_EXPIRY_MINUTES = 5; // QR หมดอายุใน 5 นาที
  const receiptRef = useRef<HTMLDivElement>(null);

  // Get enabled payment methods from settings
  const enabledPaymentMethods = settings.paymentMethods.filter(m => m.enabled);

  // Generate receipt number
  const generateReceiptNo = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = date.getTime().toString().slice(-4);
    return `RCP-${dateStr}-${timeStr}`;
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // QR Code expiry countdown timer
  useEffect(() => {
    if (!qrExpiryTime || !paymentInfoOpen) return;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((qrExpiryTime - now) / 1000));
      setQrTimeLeft(remaining);

      if (remaining <= 0) {
        // QR หมดอายุ - ล้าง QR Code
        setQrCodeDataUrl('');
      }
    };

    // Update ทันที
    updateTimer();

    // Update ทุกวินาที
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [qrExpiryTime, paymentInfoOpen]);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch =
      product.name_th?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && product.is_active && product.stock > 0;
  });

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          product,
          quantity: 1,
          price: product.price,
          total: product.price,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product_id === productId) {
            const newQuantity = item.quantity + delta;
            if (newQuantity <= 0) return null;
            return {
              ...item,
              quantity: newQuantity,
              total: newQuantity * item.price,
            };
          }
          return item;
        })
        .filter(Boolean) as any[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const taxRate = settings.taxRate / 100;
  const tax = cartTotal * taxRate;
  const total = cartTotal + tax;

  // สร้าง QR Code ใหม่
  const generateNewQR = useCallback(async () => {
    if (!settings.promptPayNumber) return;
    
    setQrLoading(true);
    try {
      const qrDataUrl = await generatePromptPayQR(settings.promptPayNumber, total);
      setQrCodeDataUrl(qrDataUrl);
      // ตั้งเวลาหมดอายุ
      setQrExpiryTime(Date.now() + QR_EXPIRY_MINUTES * 60 * 1000);
      setQrTimeLeft(QR_EXPIRY_MINUTES * 60);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setQrLoading(false);
    }
  }, [settings.promptPayNumber, total]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // Show payment info for transfer/promptpay
    if (selectedPayment === 'transfer' || selectedPayment === 'promptpay') {
      // Generate QR Code for PromptPay
      if (selectedPayment === 'promptpay') {
        await generateNewQR();
      }
      setPaymentInfoOpen(true);
      return;
    }

    processPayment();
  };

  const processPayment = () => {
    const receiptNo = generateReceiptNo();
    const paymentMethodObj = enabledPaymentMethods.find(m => m.id === selectedPayment);
    const paymentMethodName = paymentMethodObj?.name || 'เงินสด';

    // Create order
    createOrder({
      guest_name: guestName || 'ลูกค้าทั่วไป',
      booking_id: null,
      room_id: null,
      items: cart,
      subtotal: cartTotal,
      tax,
      total,
      status: 'paid',
      payment_method: selectedPayment,
    });

    // Set receipt data with settings info
    setReceiptData({
      receiptNo,
      date: new Date(),
      guestName: guestName || 'ลูกค้าทั่วไป',
      items: [...cart],
      subtotal: cartTotal,
      tax,
      taxRate: settings.taxRate,
      total,
      paymentMethod: paymentMethodName,
      // Resort info from settings
      hotelName: settings.hotelName,
      hotelNameTh: settings.hotelNameTh,
      address: settings.address,
      phone: settings.phone,
      taxId: settings.taxId,
    });

    setCart([]);
    setGuestName('');
    setCheckoutOpen(false);
    setPaymentInfoOpen(false);
    setReceiptOpen(true);
  };

  const handlePrintReceipt = () => {
    if (receiptRef.current) {
      const printContent = receiptRef.current.innerHTML;
      const printWindow = window.open('', '', 'width=400,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>ใบเสร็จรับเงิน - Yada Homestay</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'IBM Plex Sans Thai', sans-serif; padding: 20px; }
                .receipt { max-width: 300px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px dashed #ccc; }
                .logo { font-size: 20px; font-weight: bold; color: #1F2933; }
                .sub-logo { font-size: 12px; color: #C2A97E; }
                .info { font-size: 11px; color: #6B7280; margin-top: 8px; line-height: 1.6; }
                .receipt-no { margin: 15px 0; padding: 10px; background: #FAF9F6; border-radius: 8px; }
                .receipt-no p { font-size: 12px; }
                .items { margin: 15px 0; }
                .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dotted #ddd; font-size: 13px; }
                .item-name { flex: 1; }
                .item-qty { width: 50px; text-align: center; }
                .item-price { width: 80px; text-align: right; }
                .totals { margin-top: 15px; padding-top: 15px; border-top: 2px dashed #ccc; }
                .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
                .grand-total { font-size: 18px; font-weight: bold; border-top: 1px solid #333; padding-top: 10px; margin-top: 10px; }
                .grand-total span:last-child { color: #C2A97E; }
                .footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 2px dashed #ccc; font-size: 11px; color: #6B7280; }
                .thank-you { font-size: 14px; font-weight: 600; color: #1F2933; margin-bottom: 8px; }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  // Get cart quantity for a product
  const getCartQuantity = (productId: string) => {
    const item = cart.find((item) => item.product_id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-resort-primary">บาร์ / มินิบาร์</h1>
        <p className="text-resort-accent">ขายเครื่องดื่มและของว่าง</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Products */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="ค้นหาสินค้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-200 rounded-lg"
            />
          </div>

          {/* Categories */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="h-auto p-1 bg-transparent gap-2">
              {categories.map((cat) => (
                <TabsTrigger 
                  key={cat.id} 
                  value={cat.id} 
                  className="px-4 py-2 rounded-full data-[state=active]:bg-resort-primary data-[state=active]:text-white bg-white border border-gray-200 text-gray-600"
                >
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product, index) => {
              const cartQty = getCartQuantity(product.id);
              return (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow bg-white relative"
                  onClick={() => addToCart(product)}
                >
                  {/* Cart Quantity Badge */}
                  {cartQty > 0 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-resort-primary text-white text-xs font-bold flex items-center justify-center z-10">
                      {cartQty}
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
                      <ShoppingCart className="w-5 h-5 text-gray-400" />
                    </div>
                    <h3 className="font-medium text-resort-primary">{product.name_th}</h3>
                    <p className="text-xs text-gray-400">P{String(index + 1).padStart(3, '0')}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-resort-primary text-lg">
                        ฿{product.price}
                      </span>
                      <span className="text-xs text-gray-400">
                        เหลือ {product.stock}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Cart */}
        <Card className="h-fit">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                ตะกร้า
              </h3>
              <span className="text-sm text-gray-500">{cart.length} รายการ</span>
            </div>

            {/* Guest Name */}
            <Input
              placeholder="ชื่อลูกค้า (ไม่บังคับ)"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="mb-4"
            />

            {/* Cart Items */}
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">ตะกร้าว่าง</p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name_th}</p>
                      <p className="text-sm text-gray-500">
                        ฿{item.price} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product_id, -1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 ml-2"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Summary */}
            {cart.length > 0 && (
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ยอดรวม</span>
                  <span>฿{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ภาษี ({settings.taxRate}%)</span>
                  <span>฿{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>รวมทั้งสิ้น</span>
                  <span className="text-resort-accent">฿{total.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full btn-primary mt-4"
                  onClick={() => setCheckoutOpen(true)}
                >
                  ชำระเงิน
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ชำระเงิน</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">ยอดรวม</span>
                <span>฿{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">ภาษี ({settings.taxRate}%)</span>
                <span>฿{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-2 border-t">
                <span>รวมทั้งสิ้น</span>
                <span className="text-resort-accent">฿{total.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">วิธีการชำระเงิน</p>
              <div className="grid grid-cols-2 gap-3">
                {enabledPaymentMethods.map((method) => {
                  const Icon = paymentIcons[method.id] || CreditCard;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        selectedPayment === method.id
                          ? 'border-resort-accent bg-resort-accent/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-xs">{method.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCheckoutOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button
                className="flex-1 bg-resort-primary hover:bg-resort-primary-hover"
                onClick={handleCheckout}
              >
                {selectedPayment === 'transfer' || selectedPayment === 'promptpay' 
                  ? 'ดูข้อมูลการชำระเงิน' 
                  : 'ยืนยันการชำระเงิน'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Info Dialog (for Transfer/PromptPay) */}
      <Dialog open={paymentInfoOpen} onOpenChange={setPaymentInfoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPayment === 'promptpay' ? (
                <>
                  <QrCode className="w-5 h-5 text-resort-accent" />
                  ชำระผ่าน PromptPay
                </>
              ) : (
                <>
                  <Building className="w-5 h-5 text-resort-accent" />
                  โอนเงินผ่านธนาคาร
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Amount */}
            <div className="p-4 bg-resort-accent/10 rounded-lg text-center">
              <p className="text-sm text-gray-500">ยอดที่ต้องชำระ</p>
              <p className="text-3xl font-bold text-resort-accent">฿{total.toFixed(2)}</p>
            </div>

            {/* PromptPay Info */}
            {selectedPayment === 'promptpay' && (
              <div className="space-y-4">
                {/* Timer แสดงเวลาที่เหลือ */}
                {qrCodeDataUrl && qrTimeLeft > 0 && (
                  <div className={`flex items-center justify-center gap-2 p-2 rounded-lg ${
                    qrTimeLeft <= 60 ? 'bg-red-100 text-red-600' : 'bg-resort-accent/10 text-resort-accent'
                  }`}>
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">
                      QR หมดอายุใน {Math.floor(qrTimeLeft / 60)}:{(qrTimeLeft % 60).toString().padStart(2, '0')} นาที
                    </span>
                  </div>
                )}

                {/* Generated QR Code */}
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border-2 border-dashed border-resort-accent">
                  {qrLoading ? (
                    <div className="w-56 h-56 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-resort-accent" />
                    </div>
                  ) : qrCodeDataUrl && qrTimeLeft > 0 ? (
                    <>
                      <img 
                        src={qrCodeDataUrl} 
                        alt="PromptPay QR Code"
                        className="w-56 h-56 object-contain"
                      />
                      <p className="text-xs text-gray-500 mt-2">สแกน QR Code เพื่อชำระเงิน</p>
                    </>
                  ) : (
                    <div className="w-56 h-56 flex flex-col items-center justify-center bg-gray-100 rounded-lg gap-4">
                      <div className="text-center">
                        <p className="text-sm text-red-500 font-medium">QR Code หมดอายุแล้ว</p>
                        <p className="text-xs text-gray-400 mt-1">กรุณาสร้าง QR Code ใหม่</p>
                      </div>
                      <Button
                        onClick={generateNewQR}
                        disabled={qrLoading}
                        className="bg-resort-primary hover:bg-resort-primary-hover"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        สร้าง QR ใหม่
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* PromptPay Details */}
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">หมายเลข PromptPay</span>
                    <span className="font-medium font-mono">{settings.promptPayNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">ชื่อบัญชี</span>
                    <span className="font-medium">{settings.promptPayName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">จำนวนเงิน</span>
                    <span className="font-bold text-resort-accent">฿{total.toFixed(2)}</span>
                  </div>
                </div>
                
                <p className="text-xs text-center text-gray-400">
                  * QR Code นี้มีอายุ {QR_EXPIRY_MINUTES} นาที หลังหมดอายุต้องสร้างใหม่
                </p>
              </div>
            )}

            {/* Bank Transfer Info */}
            {selectedPayment === 'transfer' && (
              <div className="space-y-4">
                {/* Info Notice */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    💡 <strong>แนะนำ:</strong> ใช้ PromptPay จะสะดวกกว่า เพราะสามารถสแกน QR Code พร้อมยอดเงินได้เลย
                  </p>
                </div>

                {/* Bank Accounts List */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">ข้อมูลบัญชีสำหรับโอนเงิน:</p>
                  <div className="space-y-3">
                    {settings.bankAccounts.map((account, index) => {
                      const bankCode = account.bankCode || '004';
                      const bankInfo = THAI_BANKS[bankCode as keyof typeof THAI_BANKS];
                      return (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                          <div className="flex items-center gap-3 mb-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: bankInfo?.color || '#666' }}
                            >
                              {bankInfo?.shortName || 'BANK'}
                            </div>
                            <div>
                              <p className="font-medium">{account.bankName}</p>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">ชื่อบัญชี</span>
                              <span className="font-medium">{account.accountName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">เลขบัญชี</span>
                              <span className="font-mono font-bold text-lg">{account.accountNumber}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Amount to Transfer */}
                <div className="p-4 bg-resort-accent/10 rounded-lg border-2 border-resort-accent">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ยอดที่ต้องโอน</span>
                    <span className="text-2xl font-bold text-resort-accent">฿{total.toFixed(2)}</span>
                  </div>
                </div>

                <p className="text-xs text-center text-gray-400">
                  * กรุณาโอนเงินตามยอดที่ระบุ และแจ้งพนักงานหลังโอนเสร็จ
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setPaymentInfoOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button
                className="flex-1 bg-resort-primary hover:bg-resort-primary-hover"
                onClick={processPayment}
              >
                ยืนยันการชำระเงิน
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <div className="p-4 bg-white flex items-center justify-between border-b">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-resort-accent" />
              <span className="font-semibold">ใบเสร็จรับเงิน</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrintReceipt}
                className="gap-2"
              >
                <Printer className="w-4 h-4" />
                พิมพ์
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setReceiptOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {receiptData && (
            <div ref={receiptRef} className="p-6">
              <div className="receipt">
                {/* Header */}
                <div className="header text-center mb-6 pb-4 border-b-2 border-dashed border-gray-300">
                  <h2 className="logo text-xl font-bold text-resort-text">{receiptData.hotelName}</h2>
                  <p className="sub-logo text-sm text-resort-accent font-medium">{receiptData.hotelNameTh}</p>
                  <div className="info text-xs text-gray-500 mt-3 space-y-1">
                    <p>{receiptData.address}</p>
                    <p>โทร: {receiptData.phone}</p>
                    <p>เลขประจำตัวผู้เสียภาษี: {receiptData.taxId}</p>
                  </div>
                </div>

                {/* Receipt Info */}
                <div className="receipt-no bg-gray-50 p-3 rounded-lg mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">เลขที่ใบเสร็จ:</span>
                    <span className="font-semibold">{receiptData.receiptNo}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">วันที่:</span>
                    <span>{receiptData.date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">เวลา:</span>
                    <span>{receiptData.date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">ลูกค้า:</span>
                    <span>{receiptData.guestName}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="items mb-4">
                  <div className="flex text-xs text-gray-500 pb-2 border-b border-gray-200 mb-2">
                    <span className="flex-1">รายการ</span>
                    <span className="w-12 text-center">จำนวน</span>
                    <span className="w-20 text-right">ราคา</span>
                  </div>
                  {receiptData.items.map((item: any, index: number) => (
                    <div key={index} className="item flex py-2 border-b border-dotted border-gray-200 text-sm">
                      <span className="item-name flex-1">{item.product.name_th}</span>
                      <span className="item-qty w-12 text-center text-gray-500">{item.quantity}</span>
                      <span className="item-price w-20 text-right">฿{item.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="totals border-t-2 border-dashed border-gray-300 pt-4 space-y-2">
                  <div className="total-row flex justify-between text-sm">
                    <span className="text-gray-500">ยอดรวม</span>
                    <span>฿{receiptData.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="total-row flex justify-between text-sm">
                    <span className="text-gray-500">ภาษีมูลค่าเพิ่ม ({receiptData.taxRate}%)</span>
                    <span>฿{receiptData.tax.toFixed(2)}</span>
                  </div>
                  <div className="grand-total flex justify-between text-lg font-bold pt-3 mt-2 border-t border-gray-300">
                    <span>รวมทั้งสิ้น</span>
                    <span className="text-resort-accent">฿{receiptData.total.toFixed(2)}</span>
                  </div>
                  <div className="total-row flex justify-between text-sm pt-2">
                    <span className="text-gray-500">ชำระโดย</span>
                    <span>{receiptData.paymentMethod}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="footer text-center mt-6 pt-4 border-t-2 border-dashed border-gray-300">
                  <p className="thank-you text-base font-semibold text-resort-text mb-2">ขอบคุณที่ใช้บริการ</p>
                  <p className="text-xs text-gray-500">Thank you for your visit</p>
                  <p className="text-xs text-gray-400 mt-3">*** ใบเสร็จนี้ออกเป็นสำเนา ***</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

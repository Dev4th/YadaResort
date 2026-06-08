import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, AlertTriangle, Search, Edit } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProductStore } from '@/stores/store';
import api from '@/lib/api';

const categories = [
  { id: 'beverage', name: 'เครื่องดื่ม' },
  { id: 'alcohol', name: 'แอลกอฮอล์' },
  { id: 'snack', name: 'ของว่าง' },
  { id: 'other', name: 'อื่นๆ' },
];

export default function Inventory() {
  const { products, fetchProducts, getLowStockProducts } = useProductStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    name_th: '',
    category: 'beverage',
    price: '',
    cost: '',
    stock: '',
    unit: 'piece'
  });
  
  const [adjustData, setAdjustData] = useState({
    quantity: 0,
    type: 'in',
    reason: ''
  });

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    name_th: '',
    category: 'beverage',
    price: '',
    cost: '',
    unit: 'piece'
  });

  useEffect(() => {
    fetchProducts();
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const { data } = await api.get('/inventory');
    setTransactions(data || []);
  };

  const handleSubmit = async () => {
    setLoading(true);
    await api.post('/products', {
      ...formData,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost),
      stock: parseInt(formData.stock),
      is_active: true
    });
    setDialogOpen(false);
    setFormData({
      name: '',
      name_th: '',
      category: 'beverage',
      price: '',
      cost: '',
      stock: '',
      unit: 'piece'
    });
    await fetchProducts();
    setLoading(false);
  };

  const handleAdjust = async () => {
    if (!selectedProduct) return;
    
    setLoading(true);
    await api.post('/inventory', {
      product_id: selectedProduct.id,
      quantity: adjustData.quantity,
      type: adjustData.type,
      reason: adjustData.reason,
    });
    
    setAdjustDialogOpen(false);
    setAdjustData({ quantity: 0, type: 'in', reason: '' });
    await fetchProducts();
    await fetchTransactions();
    setLoading(false);
  };

  const toggleActive = async (product: any) => {
    await api.put(`/products/${product.id}`, { is_active: !product.is_active });
    await fetchProducts();
  };

  const handleOpenEdit = (product: any) => {
    setSelectedProduct(product);
    setEditFormData({
      name: product.name || '',
      name_th: product.name_th || '',
      category: product.category || 'beverage',
      price: String(product.price || ''),
      cost: String(product.cost || ''),
      unit: product.unit || 'piece',
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedProduct) return;
    setLoading(true);
    try {
      await api.put(`/products/${selectedProduct.id}`, {
        ...editFormData,
        price: parseFloat(editFormData.price),
        cost: parseFloat(editFormData.cost),
      });
      setEditDialogOpen(false);
      await fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name_th.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockProducts = getLowStockProducts();

  return (
    <div className="space-y-6">
      <PageHeader
        title="คลังสินค้า"
        subtitle="จัดการสต็อกสินค้าและวัตถุดิบ"
        actions={
          <Button variant="yada" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มสินค้า
          </Button>
        }
      />

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">สินค้าใกล้หมด</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.map((p) => (
                <span key={p.id} className="px-3 py-1 bg-white rounded-full text-sm">
                  {p.name_th} (เหลือ {p.stock})
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">สินค้า</TabsTrigger>
          <TabsTrigger value="transactions">ประวัติการเคลื่อนไหว</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="ค้นหาสินค้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className={!product.is_active ? 'opacity-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{product.name_th}</h4>
                      <p className="text-sm text-gray-500">{product.name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.stock <= 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {product.stock}
                    </span>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">ราคาขาย</span>
                      <span>฿{product.price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">ต้นทุน</span>
                      <span>฿{product.cost}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">หมวดหมู่</span>
                      <span>{categories.find(c => c.id === product.category)?.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEdit(product)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      แก้ไข
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedProduct(product);
                        setAdjustDialogOpen(true);
                      }}
                    >
                      ปรับสต็อก
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleActive(product)}
                    >
                      {product.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">ประวัติการเคลื่อนไหวล่าสุด</h3>
              <div className="space-y-3">
                {transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{t.products?.name_th}</p>
                      <p className="text-sm text-gray-500">
                        {t.type === 'in' ? 'รับเข้า' : t.type === 'out' ? 'เบิกออก' : 'ปรับยอด'} {' '}
                        {t.quantity} หน่วย
                        {t.reason && ` - ${t.reason}`}
                      </p>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(t.created_at).toLocaleString('th-TH')}
                    </span>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <p className="text-gray-500 text-center py-4">ไม่มีประวัติ</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>เพิ่มสินค้าใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">ชื่อ (ไทย)</label>
              <Input
                value={formData.name_th}
                onChange={(e) => setFormData({ ...formData, name_th: e.target.value })}
                placeholder="ชาเย็น"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ชื่อ (อังกฤษ)</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Thai Iced Tea"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">หมวดหมู่</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">หน่วย</label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="glass, bottle"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">ราคาขาย</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ต้นทุน</label>
                <Input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">จำนวนเริ่มต้น</label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button
                variant="yada" className="flex-1"
                onClick={handleSubmit}
                disabled={!formData.name_th || !formData.price || loading}
              >
                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Adjust Stock Dialog */}
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ปรับสต็อก {selectedProduct?.name_th}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">สต็อกปัจจุบัน</p>
              <p className="text-2xl font-bold">{selectedProduct?.stock}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">ประเภท</label>
                <Select
                  value={adjustData.type}
                  onValueChange={(value) => setAdjustData({ ...adjustData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">รับเข้า (+)</SelectItem>
                    <SelectItem value="out">เบิกออก (-)</SelectItem>
                    <SelectItem value="adjustment">ปรับยอด</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">จำนวน</label>
                <Input
                  type="number"
                  value={adjustData.quantity}
                  onChange={(e) => setAdjustData({ ...adjustData, quantity: parseInt(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">เหตุผล</label>
              <Input
                value={adjustData.reason}
                onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                placeholder="เช่น รับสินค้าใหม่, สินค้าเสียหาย"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setAdjustDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button
                variant="yada" className="flex-1"
                onClick={handleAdjust}
                disabled={adjustData.quantity === 0 || loading}
              >
                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>แก้ไขสินค้า</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">ชื่อ (ไทย)</label>
              <Input
                value={editFormData.name_th}
                onChange={(e) => setEditFormData({ ...editFormData, name_th: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ชื่อ (อังกฤษ)</label>
              <Input
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">หมวดหมู่</label>
                <Select
                  value={editFormData.category}
                  onValueChange={(value) => setEditFormData({ ...editFormData, category: value })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">หน่วย</label>
                <Input
                  value={editFormData.unit}
                  onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">ราคาขาย</label>
                <Input
                  type="number"
                  value={editFormData.price}
                  onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ต้นทุน</label>
                <Input
                  type="number"
                  value={editFormData.cost}
                  onChange={(e) => setEditFormData({ ...editFormData, cost: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setEditDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button
                variant="yada" className="flex-1"
                onClick={handleEditSubmit}
                disabled={!editFormData.name_th || loading}
              >
                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

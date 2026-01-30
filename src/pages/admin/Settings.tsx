import { useState, useEffect } from 'react';
import { Save, UserPlus, Users, Shield, Bell, Mail, CreditCard, Building, QrCode, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettingsStore } from '@/stores/supabaseStore';
import { THAI_BANKS } from '@/lib/promptpay';

const rolePermissions: Record<string, string[]> = {
  owner: [
    'dashboard_view',
    'bookings_manage',
    'rooms_manage',
    'guests_manage',
    'orders_manage',
    'products_manage',
    'reports_view',
    'users_manage',
    'settings_manage',
  ],
  admin: [
    'dashboard_view',
    'bookings_manage',
    'rooms_manage',
    'guests_manage',
    'orders_manage',
    'products_manage',
    'reports_view',
  ],
  receptionist: [
    'dashboard_view',
    'bookings_manage',
    'guests_manage',
    'orders_manage',
  ],
  staff: ['dashboard_view', 'orders_manage'],
};

const permissionLabels: Record<string, string> = {
  dashboard_view: 'ดูแดชบอร์ด',
  bookings_manage: 'จัดการการจอง',
  rooms_manage: 'จัดการห้องพัก',
  guests_manage: 'จัดการลูกค้า',
  orders_manage: 'จัดการออเดอร์',
  products_manage: 'จัดการสินค้า',
  reports_view: 'ดูรายงาน',
  users_manage: 'จัดการผู้ใช้',
  settings_manage: 'ตั้งค่าระบบ',
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const { settings, updateSettings, saveSettings, loading } = useSettingsStore();
  
  const [notifications, setNotifications] = useState({
    emailNewBooking: true,
    emailCheckIn: true,
    emailCheckOut: false,
    pushNewOrder: true,
    pushLowStock: true,
  });

  // Bank account management
  const addBankAccount = () => {
    const newAccounts = [...settings.bankAccounts, { bankCode: '004', bankName: 'ธนาคารกสิกรไทย', accountName: '', accountNumber: '' }];
    updateSettings({ bankAccounts: newAccounts });
  };

  const removeBankAccount = (index: number) => {
    const newAccounts = settings.bankAccounts.filter((_, i) => i !== index);
    updateSettings({ bankAccounts: newAccounts });
  };

  const updateBankAccount = (index: number, field: string, value: string) => {
    const newAccounts = settings.bankAccounts.map((account, i) => 
      i === index ? { ...account, [field]: value } : account
    );
    updateSettings({ bankAccounts: newAccounts });
  };

  // Payment method toggle
  const togglePaymentMethod = (methodId: string) => {
    const newMethods = settings.paymentMethods.map(method =>
      method.id === methodId ? { ...method, enabled: !method.enabled } : method
    );
    updateSettings({ paymentMethods: newMethods });
  };

  const handleSave = async () => {
    await saveSettings();
    alert('บันทึกการตั้งค่าสำเร็จ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-resort-text">ตั้งค่า</h1>
          <p className="text-resort-text-secondary">จัดการการตั้งค่าระบบและผู้ใช้</p>
        </div>
        <Button onClick={handleSave} className="bg-resort-primary hover:bg-resort-primary-hover transition-all duration-300">
          <Save className="w-4 h-4 mr-2" />
          บันทึก
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex-wrap h-auto">
          <TabsTrigger value="general">ทั่วไป</TabsTrigger>
          <TabsTrigger value="payment">การชำระเงิน</TabsTrigger>
          <TabsTrigger value="users">ผู้ใช้งาน</TabsTrigger>
          <TabsTrigger value="notifications">การแจ้งเตือน</TabsTrigger>
          <TabsTrigger value="permissions">สิทธิ์การใช้งาน</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลโฮมสเตย์</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    ชื่อโฮมสเตย์ (ภาษาอังกฤษ)
                  </label>
                  <Input
                    value={settings.hotelName}
                    onChange={(e) =>
                      updateSettings({ hotelName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    ชื่อโฮมสเตย์ (ภาษาไทย)
                  </label>
                  <Input
                    value={settings.hotelNameTh}
                    onChange={(e) =>
                      updateSettings({ hotelNameTh: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    อีเมล
                  </label>
                  <Input
                    type="email"
                    value={settings.email}
                    onChange={(e) =>
                      updateSettings({ email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    โทรศัพท์
                  </label>
                  <Input
                    value={settings.phone}
                    onChange={(e) =>
                      updateSettings({ phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    เลขประจำตัวผู้เสียภาษี
                  </label>
                  <Input
                    value={settings.taxId}
                    onChange={(e) =>
                      updateSettings({ taxId: e.target.value })
                    }
                    placeholder="1234567890123"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    ที่อยู่
                  </label>
                  <Input
                    value={settings.address}
                    onChange={(e) =>
                      updateSettings({ address: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>การตั้งค่าการเข้าพัก</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    เวลา Check-in
                  </label>
                  <Input
                    type="time"
                    value={settings.checkInTime}
                    onChange={(e) =>
                      updateSettings({ checkInTime: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    เวลา Check-out
                  </label>
                  <Input
                    type="time"
                    value={settings.checkOutTime}
                    onChange={(e) =>
                      updateSettings({ checkOutTime: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    อัตราภาษี (%)
                  </label>
                  <Input
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) =>
                      updateSettings({ taxRate: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="mt-6 space-y-6">
          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-resort-accent" />
                วิธีการชำระเงิน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">{method.name}</span>
                  </div>
                  <Switch
                    checked={method.enabled}
                    onCheckedChange={() => togglePaymentMethod(method.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* PromptPay */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-resort-accent" />
                PromptPay / QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    หมายเลข PromptPay
                  </label>
                  <Input
                    value={settings.promptPayNumber}
                    onChange={(e) =>
                      updateSettings({ promptPayNumber: e.target.value })
                    }
                    placeholder="081-234-5678 หรือ เลขบัตรประชาชน"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    ชื่อบัญชี PromptPay
                  </label>
                  <Input
                    value={settings.promptPayName}
                    onChange={(e) =>
                      updateSettings({ promptPayName: e.target.value })
                    }
                    placeholder="ชื่อที่แสดงบน PromptPay"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    URL รูป QR Code (ถ้ามี)
                  </label>
                  <Input
                    value={settings.qrCodeUrl}
                    onChange={(e) =>
                      updateSettings({ qrCodeUrl: e.target.value })
                    }
                    placeholder="https://example.com/qr-code.png"
                  />
                  {settings.qrCodeUrl && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">ตัวอย่าง QR Code:</p>
                      <img 
                        src={settings.qrCodeUrl} 
                        alt="QR Code" 
                        className="w-32 h-32 object-contain mx-auto"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Accounts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-resort-accent" />
                บัญชีธนาคาร
              </CardTitle>
              <Button size="sm" onClick={addBankAccount} className="bg-resort-primary hover:bg-resort-primary-hover transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มบัญชี
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.bankAccounts.map((account, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">บัญชีที่ {index + 1}</span>
                    {settings.bankAccounts.length > 1 && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => removeBankAccount(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">ธนาคาร</label>
                      <Select
                        value={account.bankCode || '004'}
                        onValueChange={(value) => {
                          const bankInfo = THAI_BANKS[value as keyof typeof THAI_BANKS];
                          updateBankAccount(index, 'bankCode', value);
                          updateBankAccount(index, 'bankName', bankInfo?.name || '');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกธนาคาร" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(THAI_BANKS).map(([code, bank]) => (
                            <SelectItem key={code} value={code}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold"
                                  style={{ backgroundColor: bank.color }}
                                >
                                  {bank.shortName.slice(0, 3)}
                                </div>
                                <span>{bank.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">ชื่อบัญชี</label>
                      <Input
                        value={account.accountName}
                        onChange={(e) => updateBankAccount(index, 'accountName', e.target.value)}
                        placeholder="ญาดาโฮมสเตย์"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">เลขบัญชี</label>
                      <Input
                        value={account.accountNumber}
                        onChange={(e) => updateBankAccount(index, 'accountNumber', e.target.value)}
                        placeholder="123-4-56789-0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Receipt Settings Preview */}
          <Card>
            <CardHeader>
              <CardTitle>ตัวอย่างใบเสร็จ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold">{settings.hotelName}</h3>
                  <p className="text-sm text-resort-accent">{settings.hotelNameTh}</p>
                  <p className="text-xs text-gray-500">{settings.address}</p>
                  <p className="text-xs text-gray-500">โทร: {settings.phone}</p>
                  <p className="text-xs text-gray-500">เลขประจำตัวผู้เสียภาษี: {settings.taxId}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-dashed border-gray-300 text-center text-sm text-gray-500">
                  <p>--- ข้อมูลนี้จะปรากฏในใบเสร็จ ---</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>ผู้ใช้งานระบบ</CardTitle>
              <Button size="sm" className="bg-resort-primary hover:bg-resort-primary-hover">
                <UserPlus className="w-4 h-4 mr-2" />
                เพิ่มผู้ใช้
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['เจ้าของรีสอร์ท', 'ผู้ดูแลระบบ', 'พนักงานต้อนรับ', 'พนักงานทั่วไป'].map(
                  (name, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-resort-accent/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-resort-accent" />
                        </div>
                        <div>
                          <p className="font-medium">{name}</p>
                          <p className="text-sm text-gray-500">
                            {
                              ['owner', 'admin', 'receptionist', 'staff'][
                                index
                              ]
                            }
                            @yadahomestay.com
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            index === 0
                              ? 'bg-purple-100 text-purple-700'
                              : index === 1
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {index === 0
                            ? 'เจ้าของ'
                            : index === 1
                            ? 'แอดมิน'
                            : index === 2
                            ? 'ต้อนรับ'
                            : 'พนักงาน'}
                        </span>
                        <Button variant="ghost" size="sm">
                          แก้ไข
                        </Button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>การแจ้งเตือนทางอีเมล</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  key: 'emailNewBooking',
                  label: 'การจองใหม่',
                  description: 'รับอีเมลเมื่อมีการจองใหม่',
                },
                {
                  key: 'emailCheckIn',
                  label: 'Check-in',
                  description: 'รับอีเมลเมื่อลูกค้า Check-in',
                },
                {
                  key: 'emailCheckOut',
                  label: 'Check-out',
                  description: 'รับอีเมลเมื่อลูกค้า Check-out',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        [item.key]: checked,
                      })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>การแจ้งเตือนแบบ Push</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  key: 'pushNewOrder',
                  label: 'ออเดอร์ใหม่',
                  description: 'แจ้งเตือนเมื่อมีออเดอร์จากบาร์',
                },
                {
                  key: 'pushLowStock',
                  label: 'สินค้าใกล้หมด',
                  description: 'แจ้งเตือนเมื่อสินค้าใกล้หมดสต็อก',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        [item.key]: checked,
                      })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions */}
        <TabsContent value="permissions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>สิทธิ์การใช้งานตามบทบาท</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(rolePermissions).map(([role, permissions]) => (
                  <div key={role} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-5 h-5 text-resort-accent" />
                      <h4 className="font-semibold capitalize">
                        {role === 'owner'
                          ? 'เจ้าของ'
                          : role === 'admin'
                          ? 'ผู้ดูแลระบบ'
                          : role === 'receptionist'
                          ? 'พนักงานต้อนรับ'
                          : 'พนักงานทั่วไป'}
                      </h4>
                    </div>
                    <div className="grid md:grid-cols-3 gap-2">
                      {permissions.map((perm) => (
                        <div
                          key={perm}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span>{permissionLabels[perm]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

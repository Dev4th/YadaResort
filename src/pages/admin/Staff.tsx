import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, UserPlus, Shield, Mail, Phone, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface StaffMember {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  permissions: string[];
  created_at: string;
}

const roleConfig: Record<string, { label: string; color: string }> = {
  owner: { label: 'เจ้าของ', color: 'bg-purple-100 text-purple-700' },
  admin: { label: 'ผู้ดูแลระบบ', color: 'bg-blue-100 text-blue-700' },
  receptionist: { label: 'พนักงานต้อนรับ', color: 'bg-green-100 text-green-700' },
  staff: { label: 'พนักงานทั่วไป', color: 'bg-gray-100 text-gray-700' },
};

const rolePermissions: Record<string, string[]> = {
  owner: [
    'dashboard_view', 'bookings_manage', 'rooms_manage', 'guests_manage',
    'orders_manage', 'products_manage', 'reports_view', 'users_manage', 'settings_manage'
  ],
  admin: [
    'dashboard_view', 'bookings_manage', 'rooms_manage', 'guests_manage',
    'orders_manage', 'products_manage', 'reports_view', 'settings_manage'
  ],
  receptionist: [
    'dashboard_view', 'bookings_manage', 'guests_manage', 'orders_manage'
  ],
  staff: ['dashboard_view', 'orders_manage'],
};

export default function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    role: 'staff',
    password: '',
  });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenDialog = (staffMember?: StaffMember) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({
        username: staffMember.username,
        name: staffMember.name,
        email: staffMember.email,
        phone: staffMember.phone || '',
        role: staffMember.role,
        password: '',
      });
    } else {
      setEditingStaff(null);
      setFormData({
        username: '',
        name: '',
        email: '',
        phone: '',
        role: 'staff',
        password: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.username) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (!editingStaff && !formData.password) {
      alert('กรุณาระบุรหัสผ่าน');
      return;
    }

    setSaving(true);
    try {
      const permissions = rolePermissions[formData.role] || [];

      if (editingStaff) {
        // Update
        const updateData: any = {
          username: formData.username,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          permissions,
        };

        if (formData.password) {
          updateData.password = formData.password;
        }

        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', editingStaff.id);

        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from('users')
          .insert({
            username: formData.username,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            password: formData.password,
            status: 'active',
            permissions,
          });

        if (error) throw error;
      }

      await fetchStaff();
      setDialogOpen(false);
      setEditingStaff(null);
    } catch (error: any) {
      console.error('Error saving staff:', error);
      if (error.code === '23505') {
        alert('ชื่อผู้ใช้หรืออีเมลซ้ำในระบบ');
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึก');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (staffMember: StaffMember) => {
    const newStatus = staffMember.status === 'active' ? 'inactive' : 'active';
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', staffMember.id);

      if (error) throw error;
      await fetchStaff();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleDelete = async (staffMember: StaffMember) => {
    if (!confirm(`ยืนยันลบพนักงาน "${staffMember.name}" ?`)) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', staffMember.id);

      if (error) throw error;
      await fetchStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('ไม่สามารถลบพนักงานได้');
    }
  };

  const filteredStaff = staff.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = staff.filter(s => s.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-resort-text">พนักงาน</h1>
          <p className="text-resort-text-secondary">จัดการบัญชีพนักงานและสิทธิ์การเข้าถึง</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-resort-primary hover:bg-resort-primary-hover"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          เพิ่มพนักงาน
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">พนักงานทั้งหมด</p>
            <p className="text-2xl font-bold text-resort-text">{staff.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">ใช้งานอยู่</p>
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">ระงับการใช้งาน</p>
            <p className="text-2xl font-bold text-red-600">{staff.length - activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">ผู้ดูแลระบบ</p>
            <p className="text-2xl font-bold text-blue-600">
              {staff.filter(s => s.role === 'admin' || s.role === 'owner').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="ค้นหาพนักงาน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-resort-primary" />
        </div>
      ) : filteredStaff.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">ไม่พบข้อมูลพนักงาน</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredStaff.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-resort-primary/10 text-resort-primary font-semibold">
                      {member.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-resort-text truncate">
                        {member.name}
                      </h3>
                      <Badge className={roleConfig[member.role]?.color || 'bg-gray-100'}>
                        {roleConfig[member.role]?.label || member.role}
                      </Badge>
                      {member.status !== 'active' && (
                        <Badge variant="outline" className="text-red-500 border-red-500">
                          ระงับ
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">@{member.username}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </span>
                      {member.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {member.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDialog(member)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={member.status === 'active' ? 'outline' : 'default'}
                      onClick={() => handleToggleStatus(member)}
                      className={member.status !== 'active' ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      {member.status === 'active' ? 'ระงับ' : 'เปิดใช้'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(member)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ชื่อผู้ใช้ *</Label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="username"
                />
              </div>
              <div className="space-y-2">
                <Label>ตำแหน่ง *</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">เจ้าของ</SelectItem>
                    <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                    <SelectItem value="receptionist">พนักงานต้อนรับ</SelectItem>
                    <SelectItem value="staff">พนักงานทั่วไป</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>ชื่อ-นามสกุล *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ชื่อจริง นามสกุล"
              />
            </div>

            <div className="space-y-2">
              <Label>อีเมล *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>เบอร์โทรศัพท์</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="08x-xxx-xxxx"
              />
            </div>

            <div className="space-y-2">
              <Label>{editingStaff ? 'รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)' : 'รหัสผ่าน *'}</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Permissions Preview */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">สิทธิ์การใช้งาน ({roleConfig[formData.role]?.label})</p>
              <div className="flex flex-wrap gap-2">
                {(rolePermissions[formData.role] || []).map(perm => (
                  <Badge key={perm} variant="outline" className="text-xs">
                    {perm.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              ยกเลิก
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-resort-primary hover:bg-resort-primary-hover"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingStaff ? 'บันทึก' : 'เพิ่มพนักงาน'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

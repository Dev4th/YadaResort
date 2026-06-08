import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Wrench, Plus, AlertTriangle, Clock, Check, User, Calendar, Trash2 } from 'lucide-react';
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
import { useRoomStore } from '@/stores/store';
import api from '@/lib/api';

const priorities = [
  { id: 'low', name: 'ต่ำ', color: 'bg-gray-100 text-gray-700' },
  { id: 'medium', name: 'ปานกลาง', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'high', name: 'สูง', color: 'bg-orange-100 text-orange-700' },
  { id: 'urgent', name: 'ด่วน', color: 'bg-red-100 text-red-700' },
];

export default function Maintenance() {
  const { rooms, fetchRooms } = useRoomStore();
  const [requests, setRequests] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<{ id: string; name: string }[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    room_id: '',
    title: '',
    description: '',
    priority: 'medium',
    assigned_to: '',
    cost: ''
  });

  useEffect(() => {
    fetchRequests();
    fetchRooms();
    fetchTechnicians();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/maintenance');
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const { data } = await api.get('/users');
      setTechnicians((data || []).filter((u: any) => u.is_active));
    } catch (error) {
      console.error('Error fetching technicians:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.room_id || !formData.title.trim()) {
      toast.error('กรุณาเลือกห้องพักและระบุหัวข้อการซ่อมบำรุง');
      return;
    }
    
    const cost = formData.cost ? parseFloat(formData.cost) : null;
    if (formData.cost && (isNaN(cost!) || cost! < 0)) {
      toast.error('กรุณาระบุค่าใช้จ่ายให้ถูกต้อง');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/maintenance', {
        ...formData,
        cost,
        status: 'pending'
      });
      
      // Update room status if urgent
      if (formData.priority === 'urgent' || formData.priority === 'high') {
        await api.patch(`/rooms/${formData.room_id}/status`, { status: 'maintenance' });
        await fetchRooms();
      }
      
      setDialogOpen(false);
      setFormData({
        room_id: '',
        title: '',
        description: '',
        priority: 'medium',
        assigned_to: '',
        cost: ''
      });
      await fetchRequests();
    } catch (error) {
      console.error('Error creating maintenance request:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้างรายการซ่อมบำรุง');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const updateData: any = { status };
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }
    
    await api.patch(`/maintenance/${id}`, updateData);
    
    // Update room status back to available if completed
    if (status === 'completed') {
      const request = requests.find(r => r.id === id);
      if (request) {
        await api.patch(`/rooms/${request.room_id}/status`, { status: 'available' });
        await fetchRooms();
      }
    }
    
    await fetchRequests();
  };

  const deleteRequest = async (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')) {
      await api.delete(`/maintenance/${id}`);
      await fetchRequests();
    }
  };

  const getPriorityBadge = (priority: string) => {
    const p = priorities.find(p => p.id === priority);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${p?.color || ''}`}>
        {p?.name}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
    };
    const labels: Record<string, string> = {
      pending: 'รอดำเนินการ',
      in_progress: 'กำลังซ่อม',
      completed: 'เสร็จสิ้น',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ซ่อมบำรุง"
        subtitle="จัดการงานซ่อมบำรุงห้องพักและอุปกรณ์"
        actions={
          <Button variant="yada" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            แจ้งซ่อมใหม่
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
                <p className="text-sm text-gray-500">รอดำเนินการ</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {requests.filter(r => r.status === 'in_progress').length}
                </p>
                <p className="text-sm text-gray-500">กำลังซ่อม</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {requests.filter(r => r.status === 'completed').length}
                </p>
                <p className="text-sm text-gray-500">เสร็จสิ้น</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {requests.filter(r => r.priority === 'urgent' && r.status !== 'completed').length}
                </p>
                <p className="text-sm text-gray-500">ด่วน</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">รายการซ่อมบำรุง</h3>
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{request.title}</h4>
                      {getPriorityBadge(request.priority)}
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {request.rooms?.name_th}
                      </span>
                      {request.assigned_to && (
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {technicians.find(t => t.id === request.assigned_to)?.name}
                        </span>
                      )}
                      {request.cost && (
                        <span>ค่าใช้จ่าย: ฿{request.cost.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {request.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(request.id, 'in_progress')}
                      >
                        เริ่มซ่อม
                      </Button>
                    )}
                    {request.status === 'in_progress' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(request.id, 'completed')}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        เสร็จสิ้น
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteRequest(request.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <p className="text-gray-500 text-center py-4">ไม่มีรายการซ่อมบำรุง</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Request Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>แจ้งซ่อมใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">ห้องพัก</label>
              <Select
                value={formData.room_id}
                onValueChange={(value) => setFormData({ ...formData, room_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกห้องพัก" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name_th}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">หัวข้อ</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="เช่น แอร์ไม่เย็น, หลอดไฟเสีย"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">รายละเอียด</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="อธิบายปัญหา..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">ความเร่งด่วน</label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">มอบหมายให้</label>
                <Select
                  value={formData.assigned_to}
                  onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกช่าง" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map((tech) => (
                      <SelectItem key={tech.id} value={tech.id}>
                        {tech.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">ประมาณการค่าใช้จ่าย</label>
              <Input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="0.00"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDialogOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button
                variant="yada" className="flex-1"
                onClick={handleSubmit}
                disabled={!formData.room_id || !formData.title || loading}
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

import { useState, useEffect } from 'react';
import { Plus, Search, LayoutGrid, List, Sparkles, Wrench, Bed, Loader2, Edit, X, Wifi, Tv, Wind, Car, Coffee, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
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
import { useRoomStore } from '@/stores/supabaseStore';
import { supabase } from '@/lib/supabase';

// Available amenities list
const AVAILABLE_AMENITIES = [
  { id: 'wifi', name: 'Wi-Fi', nameTh: 'ไวไฟ', icon: Wifi },
  { id: 'tv', name: 'TV', nameTh: 'ทีวี', icon: Tv },
  { id: 'aircon', name: 'Air Conditioning', nameTh: 'แอร์', icon: Wind },
  { id: 'parking', name: 'Parking', nameTh: 'ที่จอดรถ', icon: Car },
  { id: 'coffee', name: 'Coffee Maker', nameTh: 'เครื่องชงกาแฟ', icon: Coffee },
  { id: 'minibar', name: 'Minibar', nameTh: 'มินิบาร์', icon: Utensils },
  { id: 'balcony', name: 'Balcony', nameTh: 'ระเบียง', icon: Wind },
  { id: 'bathtub', name: 'Bathtub', nameTh: 'อ่างอาบน้ำ', icon: Coffee },
  { id: 'safe', name: 'Safe', nameTh: 'ตู้เซฟ', icon: Bed },
  { id: 'fridge', name: 'Refrigerator', nameTh: 'ตู้เย็น', icon: Utensils },
];

const statusDot: Record<string, string> = {
  available: 'bg-green-500',
  occupied: 'bg-blue-500',
  maintenance: 'bg-red-500',
  cleaning: 'bg-yellow-500',
};

const getRoomType = (name: string): string => {
  if (name.toLowerCase().includes('family')) return 'แฟมิลี่';
  if (name.toLowerCase().includes('deluxe')) return 'ดีลักซ์';
  if (name.toLowerCase().includes('suite')) return 'สวีท';
  if (name.toLowerCase().includes('standard')) return 'มาตรฐาน';
  return 'มาตรฐาน';
};

export default function RoomsPage() {
  const { rooms, updateRoomStatus, fetchRooms } = useRoomStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Add room state
  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [addRoomLoading, setAddRoomLoading] = useState(false);
  const [roomForm, setRoomForm] = useState({
    name: '',
    name_th: '',
    description: '',
    capacity: 2,
    price: 0,
    type: 'standard',
  });

  // Edit room state
  const [editRoomOpen, setEditRoomOpen] = useState(false);
  const [editRoomLoading, setEditRoomLoading] = useState(false);
  const [editRoomForm, setEditRoomForm] = useState({
    id: '',
    name: '',
    name_th: '',
    description: '',
    description_th: '',
    capacity: 2,
    price: 0,
    amenities: [] as string[],
    bed_type: '',
    view: '',
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  // Map old format amenities to new format
  const mapOldToNewAmenities = (amenities: string[]): string[] => {
    const mapping: Record<string, string> = {
      'WiFi': 'wifi',
      'TV': 'tv',
      'Air Conditioning': 'aircon',
      'Hot Water': 'hotwater',
      'Work Desk': 'workdesk',
      'Balcony': 'balcony',
      'Mini Bar': 'minibar',
      'Kitchenette': 'kitchenette',
      'Private Pool': 'privatepool',
      'Full Kitchen': 'fullkitchen',
      'Outdoor Shower': 'outdoorshower',
    };
    
    const validIds = AVAILABLE_AMENITIES.map(a => a.id);
    const converted = amenities.map(a => mapping[a] || a);
    // Only keep valid amenity IDs and remove duplicates
    return [...new Set(converted.filter(a => validIds.includes(a)))];
  };

  // Open edit dialog with room data
  const handleEditRoom = (room: any) => {
    const convertedAmenities = mapOldToNewAmenities(room.amenities || []);
    setEditRoomForm({
      id: room.id,
      name: room.name || '',
      name_th: room.name_th || '',
      description: room.description || '',
      description_th: room.description_th || '',
      capacity: room.capacity || 2,
      price: room.price || 0,
      amenities: convertedAmenities,
      bed_type: room.bed_type || '',
      view: room.view || '',
    });
    setEditRoomOpen(true);
    setDetailOpen(false);
  };

  // Save edited room
  const handleSaveRoom = async () => {
    if (!editRoomForm.name || !editRoomForm.name_th || !editRoomForm.price) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setEditRoomLoading(true);
    try {
      const { error } = await supabase
        .from('rooms')
        .update({
          name: editRoomForm.name,
          name_th: editRoomForm.name_th,
          description: editRoomForm.description,
          description_th: editRoomForm.description_th,
          capacity: editRoomForm.capacity,
          price: editRoomForm.price,
          amenities: editRoomForm.amenities,
          bed_type: editRoomForm.bed_type,
          view: editRoomForm.view,
        })
        .eq('id', editRoomForm.id);

      if (error) throw error;

      setEditRoomOpen(false);
      fetchRooms();
      alert('บันทึกข้อมูลห้องพักสำเร็จ');
    } catch (error) {
      console.error('Error updating room:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setEditRoomLoading(false);
    }
  };

  // Toggle amenity
  const toggleAmenity = (amenityId: string) => {
    setEditRoomForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name_th?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleStatusChange = async (roomId: string, newStatus: string) => {
    await updateRoomStatus(roomId, newStatus as any);
    setDetailOpen(false);
  };

  const handleAddRoom = async () => {
    if (!roomForm.name || !roomForm.name_th || !roomForm.price) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setAddRoomLoading(true);
    try {
      const { error } = await supabase
        .from('rooms')
        .insert({
          name: roomForm.name,
          name_th: roomForm.name_th,
          description: roomForm.description || null,
          capacity: roomForm.capacity,
          price: roomForm.price,
          status: 'available',
        });

      if (error) throw error;

      setAddRoomOpen(false);
      setRoomForm({
        name: '',
        name_th: '',
        description: '',
        capacity: 2,
        price: 0,
        type: 'standard',
      });
      fetchRooms();
    } catch (error) {
      console.error('Error adding room:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มห้องพัก');
    } finally {
      setAddRoomLoading(false);
    }
  };

  // Stats
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === 'available').length;
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
  const cleaningRooms = rooms.filter((r) => r.status === 'cleaning').length;
  const maintenanceRooms = rooms.filter((r) => r.status === 'maintenance').length;
  const bookedRooms = 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-resort-text">จัดการห้องพัก</h1>
          <p className="text-gray-500">ดูและจัดการสถานะห้องพักทุกห้อง</p>
        </div>
        <Button className="bg-resort-primary hover:bg-resort-primary-hover" onClick={() => setAddRoomOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มห้องพัก
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="border-l-4 border-l-gray-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <div>
                <p className="text-2xl font-bold">{totalRooms}</p>
                <p className="text-sm text-gray-500">ทั้งหมด</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div>
                <p className="text-2xl font-bold">{availableRooms}</p>
                <p className="text-sm text-gray-500">ว่าง</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <div>
                <p className="text-2xl font-bold">{occupiedRooms}</p>
                <p className="text-sm text-gray-500">มีผู้เข้าพัก</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{cleaningRooms}</p>
                <p className="text-sm text-gray-500">ทำความสะอาด</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div>
                <p className="text-2xl font-bold">{maintenanceRooms}</p>
                <p className="text-sm text-gray-500">ซ่อมบำรุง</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <div>
                <p className="text-2xl font-bold">{bookedRooms}</p>
                <p className="text-sm text-gray-500">จองแล้ว</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & View Toggle */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="ค้นหาหมายเลขห้องหรือชื่อห้อง..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex border rounded-lg overflow-hidden">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-resort-primary' : ''}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-resort-primary' : ''}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6' : 'grid-cols-1'} gap-4`}>
        {filteredRooms.map((room) => {
          const roomNumber = room.name?.match(/\d+/)?.[0] || room.id.slice(-3);
          const roomType = getRoomType(room.name || '');
          
          return (
            <Card
              key={room.id}
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2 hover:border-resort-accent"
              onClick={() => {
                setSelectedRoom(room);
                setDetailOpen(true);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-3 h-3 rounded-full ${statusDot[room.status]}`} />
                  <span className="text-xs text-gray-500">{roomType}</span>
                </div>
                <h3 className="text-2xl font-bold text-resort-text mb-1">{roomNumber}</h3>
                <p className="text-sm text-gray-600 mb-3">{room.name_th || room.name}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{room.capacity} ท่าน</span>
                  <span className="font-semibold text-resort-accent">฿{room.price?.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Room Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          {selectedRoom && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${statusDot[selectedRoom.status]}`} />
                    <DialogTitle>
                      ห้อง {selectedRoom.name?.match(/\d+/)?.[0] || selectedRoom.id.slice(-3)}
                    </DialogTitle>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleEditRoom(selectedRoom)}>
                    <Edit className="w-4 h-4 mr-1" />
                    แก้ไข
                  </Button>
                </div>
                <p className="text-gray-500">{selectedRoom.name_th || selectedRoom.name}</p>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                {/* Amenities */}
                {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">สิ่งอำนวยความสะดวก</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoom.amenities.map((amenityId: string) => {
                        const amenity = AVAILABLE_AMENITIES.find(a => a.id === amenityId);
                        return amenity ? (
                          <span key={amenityId} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                            {amenity.nameTh}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                {/* Room Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">ประเภท</p>
                    <p className="font-medium">{getRoomType(selectedRoom.name || '')}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">ความจุ</p>
                    <p className="font-medium">{selectedRoom.capacity} ท่าน</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">ชั้น</p>
                    <p className="font-medium">ชั้น {selectedRoom.name?.match(/\d/)?.[0] || '1'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">ราคา/คืน</p>
                    <p className="font-medium text-resort-accent">฿{selectedRoom.price?.toLocaleString()}</p>
                  </div>
                </div>

                {/* Status Actions */}
                <div>
                  <p className="text-sm font-medium mb-3">เปลี่ยนสถานะ</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="justify-start gap-2"
                      onClick={() => handleStatusChange(selectedRoom.id, 'cleaning')}
                    >
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      ทำความสะอาด
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start gap-2"
                      onClick={() => handleStatusChange(selectedRoom.id, 'maintenance')}
                    >
                      <Wrench className="w-4 h-4 text-red-500" />
                      ซ่อมบำรุง
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start gap-2 col-span-2"
                      onClick={() => handleStatusChange(selectedRoom.id, 'occupied')}
                    >
                      <Bed className="w-4 h-4 text-blue-500" />
                      มีผู้เข้าพัก
                    </Button>
                    {selectedRoom.status !== 'available' && (
                      <Button
                        variant="outline"
                        className="justify-start gap-2 col-span-2 border-green-500 text-green-600 hover:bg-green-50"
                        onClick={() => handleStatusChange(selectedRoom.id, 'available')}
                      >
                        <div className="w-4 h-4 rounded-full bg-green-500" />
                        ว่าง (พร้อมให้บริการ)
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Room Dialog */}
      <Dialog open={addRoomOpen} onOpenChange={setAddRoomOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>เพิ่มห้องพักใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>ชื่อห้อง (อังกฤษ) *</Label>
              <Input
                value={roomForm.name}
                onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                placeholder="เช่น Room 101, Deluxe Suite"
                className="mt-2"
              />
            </div>

            <div>
              <Label>ชื่อห้อง (ไทย) *</Label>
              <Input
                value={roomForm.name_th}
                onChange={(e) => setRoomForm({ ...roomForm, name_th: e.target.value })}
                placeholder="เช่น ห้องดีลักซ์"
                className="mt-2"
              />
            </div>

            <div>
              <Label>ประเภทห้อง</Label>
              <Select
                value={roomForm.type}
                onValueChange={(value) => setRoomForm({ ...roomForm, type: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">มาตรฐาน</SelectItem>
                  <SelectItem value="deluxe">ดีลักซ์</SelectItem>
                  <SelectItem value="family">แฟมิลี่</SelectItem>
                  <SelectItem value="suite">สวีท</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ความจุ (ท่าน) *</Label>
                <Input
                  type="number"
                  min={1}
                  value={roomForm.capacity}
                  onChange={(e) => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) || 1 })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>ราคา/คืน (บาท) *</Label>
                <Input
                  type="number"
                  min={0}
                  value={roomForm.price}
                  onChange={(e) => setRoomForm({ ...roomForm, price: parseInt(e.target.value) || 0 })}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label>รายละเอียด</Label>
              <Input
                value={roomForm.description}
                onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                placeholder="รายละเอียดห้องพัก..."
                className="mt-2"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setAddRoomOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button
                className="flex-1 bg-resort-primary hover:bg-resort-primary-hover"
                onClick={handleAddRoom}
                disabled={addRoomLoading || !roomForm.name || !roomForm.name_th || !roomForm.price}
              >
                {addRoomLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  'เพิ่มห้องพัก'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={editRoomOpen} onOpenChange={setEditRoomOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>แก้ไขห้องพัก</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ชื่อห้อง (EN) *</Label>
                <Input
                  value={editRoomForm.name}
                  onChange={(e) => setEditRoomForm({ ...editRoomForm, name: e.target.value })}
                  placeholder="Standard Room"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>ชื่อห้อง (TH) *</Label>
                <Input
                  value={editRoomForm.name_th}
                  onChange={(e) => setEditRoomForm({ ...editRoomForm, name_th: e.target.value })}
                  placeholder="ห้องมาตรฐาน"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ความจุ (ท่าน) *</Label>
                <Input
                  type="number"
                  min={1}
                  value={editRoomForm.capacity}
                  onChange={(e) => setEditRoomForm({ ...editRoomForm, capacity: parseInt(e.target.value) || 1 })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>ราคา/คืน (บาท) *</Label>
                <Input
                  type="number"
                  min={0}
                  value={editRoomForm.price}
                  onChange={(e) => setEditRoomForm({ ...editRoomForm, price: parseInt(e.target.value) || 0 })}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ประเภทเตียง</Label>
                <Input
                  value={editRoomForm.bed_type}
                  onChange={(e) => setEditRoomForm({ ...editRoomForm, bed_type: e.target.value })}
                  placeholder="เตียงคู่, เตียงเดี่ยว 2 เตียง"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>วิว</Label>
                <Input
                  value={editRoomForm.view}
                  onChange={(e) => setEditRoomForm({ ...editRoomForm, view: e.target.value })}
                  placeholder="วิวสวน, วิวสระว่ายน้ำ"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label>รายละเอียด (TH)</Label>
              <Textarea
                value={editRoomForm.description_th}
                onChange={(e) => setEditRoomForm({ ...editRoomForm, description_th: e.target.value })}
                placeholder="รายละเอียดห้องพัก..."
                className="mt-2"
                rows={3}
              />
            </div>

            {/* Amenities */}
            <div>
              <Label className="mb-3 block">สิ่งอำนวยความสะดวก</Label>
              <div className="grid grid-cols-2 gap-3">
                {AVAILABLE_AMENITIES.map((amenity) => {
                  const Icon = amenity.icon;
                  const isChecked = editRoomForm.amenities.includes(amenity.id);
                  return (
                    <div
                      key={amenity.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isChecked ? 'bg-resort-primary/10 border-resort-primary' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => toggleAmenity(amenity.id)}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleAmenity(amenity.id)}
                      />
                      <Icon className={`w-4 h-4 ${isChecked ? 'text-resort-primary' : 'text-gray-500'}`} />
                      <span className={`text-sm ${isChecked ? 'text-resort-primary font-medium' : 'text-gray-700'}`}>
                        {amenity.nameTh}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRoomOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              className="bg-resort-primary hover:bg-resort-primary-hover"
              onClick={handleSaveRoom}
              disabled={editRoomLoading}
            >
              {editRoomLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                'บันทึก'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

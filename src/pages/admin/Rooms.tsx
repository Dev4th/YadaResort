import { useState, useEffect } from 'react';
import { Plus, Search, LayoutGrid, List, Sparkles, Wrench, Bed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRoomStore } from '@/stores/supabaseStore';

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

  useEffect(() => {
    fetchRooms();
  }, []);

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
          <h1 className="text-2xl font-bold text-[#1a1a1a]">จัดการห้องพัก</h1>
          <p className="text-gray-500">ดูและจัดการสถานะห้องพักทุกห้อง</p>
        </div>
        <Button className="bg-[#c9a962] hover:bg-[#d4b978]">
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
            className={viewMode === 'grid' ? 'bg-[#c9a962]' : ''}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-[#c9a962]' : ''}
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
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2 hover:border-[#c9a962]"
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
                <h3 className="text-2xl font-bold text-[#1a1a1a] mb-1">{roomNumber}</h3>
                <p className="text-sm text-gray-600 mb-3">{room.name_th || room.name}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{room.capacity} ท่าน</span>
                  <span className="font-semibold text-[#c9a962]">฿{room.price?.toLocaleString()}</span>
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
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${statusDot[selectedRoom.status]}`} />
                  <DialogTitle>
                    ห้อง {selectedRoom.name?.match(/\d+/)?.[0] || selectedRoom.id.slice(-3)}
                  </DialogTitle>
                </div>
                <p className="text-gray-500">{selectedRoom.name_th || selectedRoom.name}</p>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
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
                    <p className="font-medium text-[#c9a962]">฿{selectedRoom.price?.toLocaleString()}</p>
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
    </div>
  );
}

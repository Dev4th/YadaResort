import { useState, useEffect } from 'react';
import { Sparkles, Check, Clock, AlertCircle, User, Calendar, Play, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRoomStore } from '@/stores/supabaseStore';
import { supabase } from '@/lib/supabase';

const cleaningStaff = [
  { id: 'staff1', name: 'สมศรี' },
  { id: 'staff2', name: 'ประเสริฐ' },
  { id: 'staff3', name: 'มานี' },
];

// Local state type for cleaning tasks
interface CleaningTask {
  id: string;
  room_id: string;
  room_name: string;
  room_name_en: string;
  status: 'pending' | 'in_progress' | 'completed' | 'inspected';
  assigned_to: string;
  started_at?: string;
  completed_at?: string;
}

export default function RoomCleaning() {
  const { rooms, fetchRooms, updateRoomStatus } = useRoomStore();
  const [cleaningTasks, setCleaningTasks] = useState<CleaningTask[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRooms();
    loadTasksFromStorage();
  }, []);

  // Load tasks from localStorage
  const loadTasksFromStorage = () => {
    const saved = localStorage.getItem('cleaningTasks');
    if (saved) {
      setCleaningTasks(JSON.parse(saved));
    }
  };

  // Save tasks to localStorage
  const saveTasks = (tasks: CleaningTask[]) => {
    localStorage.setItem('cleaningTasks', JSON.stringify(tasks));
    setCleaningTasks(tasks);
  };

  const roomsNeedingCleaning = rooms.filter(r => r.status === 'cleaning');

  // มอบหมายงาน
  const assignTask = (room: any, staffId: string) => {
    const newTask: CleaningTask = {
      id: `task-${Date.now()}`,
      room_id: room.id,
      room_name: room.name_th,
      room_name_en: room.name,
      status: 'in_progress',
      assigned_to: staffId,
      started_at: new Date().toISOString(),
    };
    
    const updatedTasks = [...cleaningTasks, newTask];
    saveTasks(updatedTasks);
  };

  // เสร็จสิ้นการทำความสะอาด
  const completeCleaning = async (taskId: string) => {
    setLoading(true);
    const updatedTasks = cleaningTasks.map(task => 
      task.id === taskId 
        ? { ...task, status: 'completed' as const, completed_at: new Date().toISOString() }
        : task
    );
    saveTasks(updatedTasks);
    setLoading(false);
  };

  // ตรวจสอบห้อง
  const inspectRoom = async (taskId: string) => {
    setLoading(true);
    const task = cleaningTasks.find(t => t.id === taskId);
    
    if (task) {
      // อัพเดทสถานะห้องเป็น available
      await updateRoomStatus(task.room_id, 'available');
      
      const updatedTasks = cleaningTasks.map(t => 
        t.id === taskId 
          ? { ...t, status: 'inspected' as const }
          : t
      );
      saveTasks(updatedTasks);
      await fetchRooms();
    }
    setLoading(false);
  };

  // ลบงานที่เสร็จแล้ว
  const clearCompletedTasks = () => {
    const activeTasks = cleaningTasks.filter(t => t.status !== 'inspected');
    saveTasks(activeTasks);
  };

  // ลบงานเดี่ยว
  const deleteTask = (taskId: string) => {
    const updatedTasks = cleaningTasks.filter(t => t.id !== taskId);
    saveTasks(updatedTasks);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      inspected: 'bg-purple-100 text-purple-700',
    };
    const labels: Record<string, string> = {
      pending: 'รอดำเนินการ',
      in_progress: 'กำลังทำความสะอาด',
      completed: 'เสร็จสิ้น',
      inspected: 'ตรวจสอบแล้ว',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // นับสถิติ
  const stats = {
    pending: roomsNeedingCleaning.length,
    in_progress: cleaningTasks.filter(t => t.status === 'in_progress').length,
    completed: cleaningTasks.filter(t => t.status === 'completed').length,
    inspected: cleaningTasks.filter(t => t.status === 'inspected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-resort-text">ทำความสะอาดห้องพัก</h1>
        <p className="text-gray-500">จัดการงานทำความสะอาดห้องพัก</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-sm text-gray-500">รอทำความสะอาด</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.in_progress}</p>
                <p className="text-sm text-gray-500">กำลังทำความสะอาด</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-sm text-gray-500">รอตรวจสอบ</p>
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
                <p className="text-2xl font-bold text-purple-600">{stats.inspected}</p>
                <p className="text-sm text-gray-500">ตรวจสอบแล้ว</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rooms Needing Cleaning */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">ห้องที่ต้องทำความสะอาด</h3>
          <div className="space-y-4">
            {roomsNeedingCleaning.map((room) => (
              <div
                key={room.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{room.name_th}</p>
                  <p className="text-sm text-gray-500">{room.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Select onValueChange={(value) => assignTask(room, value)}>
                    <SelectTrigger className="w-40">
                      <User className="w-4 h-4 mr-2 flex-shrink-0" />
                      <SelectValue placeholder="มอบหมาย..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cleaningStaff.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          <span className="truncate">{staff.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
            {roomsNeedingCleaning.length === 0 && (
              <p className="text-gray-500 text-center py-4">ไม่มีห้องที่ต้องทำความสะอาด</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cleaning Tasks */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">งานทำความสะอาดทั้งหมด</h3>
            {stats.inspected > 0 && (
              <Button size="sm" variant="outline" onClick={clearCompletedTasks}>
                ล้างงานที่เสร็จแล้ว
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {cleaningTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-resort-accent/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-resort-accent" />
                  </div>
                  <div>
                    <p className="font-medium">{task.room_name}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {cleaningStaff.find(s => s.id === task.assigned_to)?.name || 'ไม่ระบุ'}
                      </span>
                      {task.started_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.started_at).toLocaleTimeString('th-TH')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(task.status)}
                  
                  {/* ปุ่มเสร็จสิ้น - แสดงเมื่อกำลังทำ */}
                  {task.status === 'in_progress' && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => completeCleaning(task.id)}
                      disabled={loading}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      เสร็จสิ้น
                    </Button>
                  )}
                  
                  {/* ปุ่มตรวจสอบ - แสดงเมื่อเสร็จแล้ว */}
                  {task.status === 'completed' && (
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => inspectRoom(task.id)}
                      disabled={loading}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      ตรวจสอบ
                    </Button>
                  )}

                  {/* ปุ่มลบ */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {cleaningTasks.length === 0 && (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">ไม่มีงานทำความสะอาด</p>
                <p className="text-sm text-gray-400 mt-1">เลือกพนักงานจากรายการด้านบนเพื่อเริ่มงาน</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


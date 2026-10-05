import { useState } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, MessageSquare, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import type { Screen } from '../App';

interface MessageManagementProps {
  onNavigate: (screen: Screen) => void;
}

interface SavedMessage {
  id: string;
  text: string;
  createdAt: Date;
}

interface MessageTemplate {
  id: string;
  locationPlaceholder: string;
  statusText: string;
  timePlaceholder: string;
}

export function MessageManagement({ onNavigate }: MessageManagementProps) {
  const [messages, setMessages] = useState<SavedMessage[]>([
    { id: '1', text: '[상일IC]를 지나가고 있습니다. [10]분 후 도착합니다.', createdAt: new Date() },
    { id: '2', text: '[한남대교]를 지나가고 있습니다. [13]분 후 도착합니다.', createdAt: new Date() },
    { id: '3', text: '[청담사거리]를 지나가고 있습니다. [10]분 후 도착합니다.', createdAt: new Date() },
    { id: '4', text: '[천호이마트] 근처입니다. [13]분 후 도착합니다.', createdAt: new Date() },
    { id: '5', text: '[고덕이케아] 부근입니다. [10]분 후 도착합니다.', createdAt: new Date() },
  ]);
  
  const [templates] = useState<MessageTemplate[]>([
    { id: 't1', locationPlaceholder: '{위치}', statusText: '근처입니다', timePlaceholder: '{시간}' },
    { id: 't2', locationPlaceholder: '{위치}', statusText: '지나가고 있습니다', timePlaceholder: '{시간}' },
    { id: 't3', locationPlaceholder: '{위치}', statusText: '부근입니다', timePlaceholder: '{시간}' },
  ]);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<SavedMessage | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleAddMessage = () => {
    if (newMessage.trim()) {
      const message: SavedMessage = {
        id: Date.now().toString(),
        text: newMessage,
        createdAt: new Date(),
      };
      setMessages([...messages, message]);
      setNewMessage('');
      setIsAddDialogOpen(false);
    }
  };

  const handleDeleteMessage = (id: string) => {
    if (confirm('이 메시지를 삭제하시겠습니까?')) {
      setMessages(messages.filter(m => m.id !== id));
    }
  };

  const handleEditMessage = () => {
    if (editingMessage && editingMessage.text.trim()) {
      setMessages(messages.map(m => m.id === editingMessage.id ? editingMessage : m));
      setIsEditDialogOpen(false);
      setEditingMessage(null);
    }
  };

  const openEditDialog = (message: SavedMessage) => {
    setEditingMessage({ ...message });
    setIsEditDialogOpen(true);
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setNewMessage(`${template.locationPlaceholder} ${template.statusText} ${template.timePlaceholder}`);
      setSelectedTemplate(templateId);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0f2920] text-white">
      {/* Header */}
      <header className="flex items-center px-4 py-4 border-b border-gray-800">
        <button onClick={() => onNavigate('settings')} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-center">자주 쓰는 메시지 관리</h1>
        <div className="w-10" />
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
            <p>저장된 메시지가 없습니다</p>
            <p className="text-sm mt-2">자주 사용하는 메시지를 추가해보세요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className="bg-[#1a3d32] border-2 border-gray-700 rounded-2xl p-4 hover:border-[#00ff88] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-white mb-2">{message.text}</p>
                    <p className="text-xs text-gray-500">
                      {message.createdAt.toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditDialog(message)}
                      className="p-2 hover:bg-[#235a47] rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-[#00ff88]" />
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className="p-2 hover:bg-[#235a47] rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setIsAddDialogOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#00ff88] hover:bg-[#00dd77] rounded-full flex items-center justify-center shadow-lg transition-colors"
      >
        <Plus className="w-6 h-6 text-[#0f2920]" />
      </button>

      {/* Add Message Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-[#1a3d32] border-2 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>새 메시지 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Template Selection */}
            <div className="space-y-2">
              <Label className="text-gray-400">템플릿 선택</Label>
              <div className="space-y-2">
                {templates.map(template => {
                  const isSelected = selectedTemplate === template.id;
                  return (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template.id)}
                      className={`w-full text-left bg-[#0f2920] border-2 rounded-xl p-3 transition-all ${
                        isSelected ? 'border-[#00ff88]' : 'border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          {template.locationPlaceholder} <span className="text-[#00ff88]">{template.statusText}</span> {template.timePlaceholder}분 후 도착합니다.
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-[#00ff88]"/>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-gray-700"></div>

            <div className="space-y-2">
              <Label htmlFor="newMessage" className="text-gray-400">메시지 내용</Label>
              <textarea
                id="newMessage"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="예: [상일IC]를 지나가고 있습니다. [10]분 후 도착합니다."
                rows={3}
                className="w-full bg-[#0f2920] border-2 border-gray-700 rounded-xl p-3 text-white placeholder:text-gray-500 resize-none focus:border-[#00ff88] focus:ring-0"
              />
              <p className="text-xs text-gray-500">
                [위치]와 [시간]은 실제 운행 중 자동으로 대체됩니다
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setNewMessage('');
                  setSelectedTemplate(null);
                }}
                variant="outline"
                className="flex-1 bg-transparent border-2 border-gray-700 hover:bg-gray-800 text-white"
              >
                취소
              </Button>
              <Button
                onClick={handleAddMessage}
                className="flex-1 bg-[#00ff88] hover:bg-[#00dd77] text-[#0f2920]"
              >
                추가
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Message Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#1a3d32] border-2 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>메시지 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="editMessage" className="text-gray-400">메시지 내용</Label>
              <Input
                id="editMessage"
                value={editingMessage?.text || ''}
                onChange={(e) => setEditingMessage(editingMessage ? { ...editingMessage, text: e.target.value } : null)}
                placeholder="예: {5분}후 곧 도착해요."
                className="bg-[#0f2920] border-2 border-gray-700 text-white focus:border-[#00ff88] focus:ring-0"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingMessage(null);
                }}
                variant="outline"
                className="flex-1 bg-transparent border-2 border-gray-700 hover:bg-gray-800 text-white"
              >
                취소
              </Button>
              <Button
                onClick={handleEditMessage}
                className="flex-1 bg-[#00ff88] hover:bg-[#00dd77] text-[#0f2920]"
              >
                저장
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="bg-[#1a3d32] border-2 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>템플릿 선택</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {templates.map(template => (
              <div
                key={template.id}
                className="bg-[#0f2920] border-2 border-gray-700 rounded-2xl p-4 hover:border-[#00ff88] transition-colors"
                onClick={() => applyTemplate(template.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-white mb-2">{template.locationPlaceholder} {template.statusText} {template.timePlaceholder}</p>
                  </div>
                  <div className="flex gap-2">
                    {selectedTemplate === template.id && <Check className="w-4 h-4 text-[#00ff88]" />}
                  </div>
                </div>
              </div>
            ))}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setIsTemplateDialogOpen(false);
                  setNewMessage('');
                }}
                variant="outline"
                className="flex-1 bg-transparent border-2 border-gray-700 hover:bg-gray-800 text-white"
              >
                취소
              </Button>
              <Button
                onClick={handleAddMessage}
                className="flex-1 bg-[#00ff88] hover:bg-[#00dd77] text-[#0f2920]"
              >
                추가
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
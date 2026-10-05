import { useState, useEffect } from 'react';
import { ArrowLeft, Edit2, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import type { Screen } from '../App';

interface MessageManagementProps {
  onNavigate: (screen: Screen) => void;
}

export interface MessageTemplates {
  departure: string;
  waypoint: string;
  arrival: string;
}

export const defaultTemplates: MessageTemplates = {
  departure: '{출발지}에서 출발했습니다. 약 {남은시간}분 후 도착 예정입니다.',
  waypoint: '{경유지}를 지나고 있습니다. 약 {남은시간}분 후 도착 예정입니다.',
  arrival: '{도착지} 근처입니다. 곧 도착 예정입니다.'
};

export function MessageManagement({ onNavigate }: MessageManagementProps) {
  const [templates, setTemplates] = useState<MessageTemplates>(() => {
    try {
      // [FIX] SMS 전용 키 'sms_templates' 사용. 없으면 기존 'message_templates'에서 마이그레이션
      const saved = localStorage.getItem('sms_templates') || localStorage.getItem('message_templates');
      return saved ? { ...defaultTemplates, ...JSON.parse(saved) } : defaultTemplates;
    } catch {
      return defaultTemplates;
    }
  });

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<keyof MessageTemplates | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    localStorage.setItem('sms_templates', JSON.stringify(templates)); // [FIX] SMS 전용 키
  }, [templates]);

  const openEditDialog = (type: keyof MessageTemplates) => {
    setEditingType(type);
    setEditingText(templates[type]);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingType && editingText.trim()) {
      setTemplates({ ...templates, [editingType]: editingText });
      setIsEditDialogOpen(false);
    }
  };

  const insertVariable = (variable: string) => {
    setEditingText(prev => prev + variable);
  };

  const getTypeLabel = (type: keyof MessageTemplates) => {
    switch (type) {
      case 'departure': return '출발 문자';
      case 'waypoint': return '경유지 문자';
      case 'arrival': return '도착 문자';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0f2920] text-white">
      {/* Header */}
      <header className="flex items-center px-4 pt-safe mt-4 pb-4 border-b border-gray-800">
        <button onClick={() => onNavigate('mypage')} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg">문자 템플릿 관리</h1>
        <button 
          onClick={() => {
            if (confirm('모든 템플릿을 심플한 기본 문구로 초기화하시겠습니까?')) {
              setTemplates(defaultTemplates);
            }
          }}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          초기화
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8 pb-32 space-y-6">
        <div className="bg-black/20 p-4 rounded-xl text-sm text-gray-300">
          📱 <strong className="text-white">일반 문자(SMS) 전용</strong> 템플릿입니다.<br/>
          <span className="text-xs text-gray-400">카카오 알림톡(공식 알림)은 본 설정과 별개로 고정된 양식으로 발송됩니다.</span><br className="mt-1"/>
          치환 변수를 사용하면 실제 값으로 자동 변경되어 발송됩니다.
        </div>

        {(Object.keys(templates) as Array<keyof MessageTemplates>).map((type) => (
          <div key={type} className="bg-[#1a3d32] border border-[#2a6d5d] rounded-2xl p-5 shadow-lg relative">
            <div className="flex items-center justify-between mb-3 border-b border-[#2a6d5d] pb-2">
              <div className="flex items-center gap-2 text-[#00ff88] font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{getTypeLabel(type)}</span>
              </div>
              <button
                onClick={() => openEditDialog(type)}
                className="text-gray-400 hover:text-[#00ff88] transition-colors p-1"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap min-h-[3rem]">
              {templates[type]}
            </p>
          </div>
        ))}
      </div>

      {/* Edit Message Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[90vw] max-w-[400px] rounded-2xl bg-[#1a3d32] border border-gray-700 text-white" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingType && getTypeLabel(editingType)} 수정
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-3">
              <Label className="text-gray-400">메시지 내용</Label>
              <textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                className="w-full h-32 bg-[#0f2920] border-2 border-gray-700 text-white rounded-xl p-4 focus:border-[#00ff88] focus:ring-0 resize-none"
              />

              <div>
                <Label className="text-xs text-gray-400 mb-2 block">치환 변수 추가 (터치하여 삽입)</Label>
                <div className="flex flex-wrap gap-2">
                  {['{출발지}', '{경유지}', '{도착지}', '{남은시간}'].map(v => (
                    <button
                      key={v}
                      onClick={() => insertVariable(v)}
                      className="px-3 py-1.5 bg-[#0f2920] border border-gray-600 rounded-lg text-xs text-[#00ff88] hover:bg-gray-800 transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setIsEditDialogOpen(false)}
                variant="outline"
                className="flex-1 bg-transparent border-2 border-gray-700 hover:bg-gray-800 text-white h-12 rounded-xl"
              >
                취소
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="flex-1 bg-gradient-to-r from-app-accent to-[#00cc6a] hover:brightness-110 text-app-primary font-bold h-12 rounded-xl"
              >
                저장
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

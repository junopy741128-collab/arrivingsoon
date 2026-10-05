import { X, Info } from 'lucide-react';
import { Button } from './ui/button';

interface PriceTableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PriceTableModal({ isOpen, onClose }: PriceTableModalProps) {
  if (!isOpen) return null;

  const prices = [
    { type: '일반문자', content: '경유지/도착문자, 수신 1인', cost: '50p' },
    { type: '일반문자', content: '출발문자+경유지, 수신 1인', cost: '50p' },
    { type: '일반문자', content: '경유지/도착문자, 수신 2인이상', cost: '100p' },
    { type: '일반문자', content: '출발문자+경유지, 수신 2인이상', cost: '100p' },
    { type: '카카오 알림톡', content: '경유지/도착문자, 수신 1인', cost: '50p' },
    { type: '카카오 알림톡', content: '출발문자+경유지, 수신 1인', cost: '100p' },
    { type: '카카오 알림톡', content: '경유지/도착문자, 수신 2인', cost: '100p' },
    { type: '카카오 알림톡', content: '출발문자+경유지, 수신 2인', cost: '200p' },
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-app-secondary w-full max-w-sm rounded-[32px] overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-app-accent/20 flex items-center justify-center text-app-accent">
              <Info className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-white">서비스 이용 요금표</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[70vh] overflow-y-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-white/5">
                <th className="py-3 px-2">종류</th>
                <th className="py-3 px-2">내용</th>
                <th className="py-3 px-2 text-right">비용</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {prices.map((item, idx) => (
                <tr key={idx} className="text-sm hover:bg-white/5 transition-colors">
                  <td className="py-4 px-2 align-top shrink-0 w-16">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap inline-block ${
                      item.type === '카카오 알림톡' 
                        ? 'bg-[#FEE500] text-black' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {item.type === '카카오 알림톡' ? '알림톡' : '문자'}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-gray-300 leading-snug">
                    {item.content}
                  </td>
                  <td className="py-4 px-2 text-right font-bold text-white whitespace-nowrap">
                    {item.cost}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Rules Summary */}
          <div className="mt-4 p-4 bg-app-primary rounded-2xl border border-white/5 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">계산 방식</span>
              <span className="text-white font-medium">문자 수 × 수신인</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">기준 요금</span>
              <span className="text-white font-medium">문자 1건 = 50p</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">포인트 환산</span>
              <span className="text-app-accent font-bold">50원 = 50p</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-2">
          <Button 
            onClick={onClose}
            className="w-full h-14 bg-app-accent hover:bg-app-accent/90 text-app-primary font-bold text-base rounded-2xl"
          >
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}

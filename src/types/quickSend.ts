export interface QuickSendRecipient {
    name: string;
    phone: string;
}

export interface QuickSendPreset {
    id: string;
    category: '가족' | '업무' | '그룹' | '기타';
    title: string;
    recipients: QuickSendRecipient[];
    message: string;
    order: number;
}

export const DEFAULT_QUICK_SEND_PRESETS: QuickSendPreset[] = [];

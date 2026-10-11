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

export const DEFAULT_QUICK_SEND_PRESETS: QuickSendPreset[] = [
    {
        id: 'preset-1',
        category: '가족',
        title: '아내',
        recipients: [{ name: '아내', phone: '010-1234-5678' }],
        message: '지금 가고 있어. 나오세요.',
        order: 0
    },
    {
        id: 'preset-2',
        category: '업무',
        title: '거래처A 김팀장',
        recipients: [{ name: '거래처A 김팀장', phone: '010-9876-5432' }],
        message: '차가 막히네요. 조금만 더 기다려 주세요.',
        order: 1
    },
    {
        id: 'preset-3',
        category: '그룹',
        title: '학부모A 외 8명',
        recipients: [
            { name: '학부모A', phone: '010-5555-4444' }
        ],
        message: '안녕하세요. 곧 도착합니다. 안전운전하겠습니다.',
        order: 2
    }
];

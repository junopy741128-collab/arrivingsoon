import React from 'react';
import { getPreviewMessage } from '../utils/templateUtils';

interface MessagePreviewProps {
    template: string;
    compact?: boolean; // New prop for compact display
}

export function MessagePreview({ template, compact = false }: MessagePreviewProps) {
    const preview = getPreviewMessage(template);

    // Don't show preview if template is empty
    if (!template.trim()) {
        return null;
    }

    // Compact version for message list
    if (compact) {
        return (
            <div style={{
                color: '#9ca3af',
                fontSize: '11px',
                lineHeight: '1.4'
            }}>
                📱 {preview}
            </div>
        );
    }

    // Full version for dialogs
    return (
        <div style={{
            backgroundColor: '#1a3d32',
            padding: '12px',
            borderRadius: '8px',
            marginTop: '12px',
            border: '1px solid #234a3d'
        }}>
            <div style={{
                color: '#9ca3af',
                fontSize: '12px',
                marginBottom: '6px',
                fontWeight: 500
            }}>
                📱 미리보기:
            </div>
            <div style={{
                color: 'white',
                fontSize: '14px',
                lineHeight: '1.5'
            }}>
                {preview}
            </div>
            <div style={{
                color: '#6b7280',
                fontSize: '11px',
                marginTop: '8px',
                fontStyle: 'italic'
            }}>
                * 실제 발송 시 정ㅇㅇ, 5, 고덕역, 집 대신 실제 데이터가 들어갑니다
            </div>
        </div>
    );
}

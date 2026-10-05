import React from 'react';

interface TemplateTagButtonsProps {
    onInsertTag: (tag: string) => void;
}

export function TemplateTagButtons({ onInsertTag }: TemplateTagButtonsProps) {
    const tags = [
        { label: '+시간', value: '{시간}', color: '#00ff88' },
        { label: '+기사이름', value: '{기사명}', color: '#00ff88' },
        { label: '+도착장소', value: '{도착지}', color: '#00ff88' },
        { label: '+출발장소', value: '{출발지}', color: '#00ff88' }
    ];

    return (
        <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginTop: '8px'
        }}>
            {tags.map(tag => (
                <button
                    key={tag.value}
                    type="button"
                    onClick={() => onInsertTag(tag.value)}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#1a3d32',
                        color: tag.color,
                        border: '1px solid #234a3d',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 500,
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#234a3d';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#1a3d32';
                    }}
                >
                    {tag.label}
                </button>
            ))}
        </div>
    );
}

import { MapPin, ChevronRight } from 'lucide-react';
import type { Trip } from '../App';

interface ActiveTripBannerProps {
    trip: Trip;
    onClick: () => void;
}

export function ActiveTripBanner({ trip, onClick }: ActiveTripBannerProps) {
    return (
        <div
            style={{
                backgroundColor: '#1a3d32',
                borderRadius: '16px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
            }}
            onClick={onClick}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#234a3d'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a3d32'}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <MapPin style={{ width: '20px', height: '20px', color: '#00ff88' }} />
                    <div>
                        <div style={{ color: 'white', fontWeight: 500 }}>{trip.destination}</div>
                        <div style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>
                            {Math.floor(trip.estimatedTime)}분 남음 • {Math.floor(trip.estimatedDistance)}km
                        </div>
                    </div>
                </div>
                <ChevronRight style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
            </div>
        </div>
    );
}

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, Users, CreditCard, Bell, RefreshCw, CheckCircle, XCircle, MessageSquare, AlertCircle } from 'lucide-react';
import type { Screen } from '../App';

interface AdminPageProps {
    onNavigate: (screen: Screen) => void;
}

interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    points: number;
    created_at: string;
}

interface NotificationLog {
    id: string;
    type: string;
    channel: string;
    recipient: string;
    template_code: string;
    var1: string | null;
    var2: string | null;
    var3: string | null;
    var4: string | null;
    response_raw: Record<string, unknown> | null;
    status: string;
    error_message: string | null;
    created_at: string;
}

export function AdminPage({ onNavigate }: AdminPageProps) {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'points' | 'logs'>('logs');

    return (
        <div className="flex flex-col w-full h-full bg-app-primary text-text-primary overflow-hidden">
            {/* Header */}
            <header className="pt-safe px-4 h-16 flex items-center gap-4 border-b border-border bg-app-primary sticky top-0 z-10">
                <button
                    onClick={() => onNavigate('mypage')}
                    className="p-2 -ml-2 text-text-muted hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold text-status-error">관리자 페이지</h1>
            </header>

            {/* Tabs */}
            <div className="flex px-4 pt-4 mb-4 gap-2 border-b border-border/50 pb-2 overflow-x-auto scrollbar-hide">
                <TabButton label="대시보드" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                <TabButton label="회원 관리" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                <TabButton label="포인트 관리" active={activeTab === 'points'} onClick={() => setActiveTab('points')} />
                <TabButton label="알림톡 로그" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} highlight />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-24 scrollbar-hide">
                {activeTab === 'dashboard' && <DashboardView />}
                {activeTab === 'users' && <UserManagementView />}
                {activeTab === 'points' && <PointManagementView />}
                {activeTab === 'logs' && <NotificationLogView />}
            </div>
        </div>
    );
}

function TabButton({ label, active, onClick, highlight }: { label: string; active: boolean; onClick: () => void; highlight?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${active
                ? highlight
                    ? 'bg-yellow-500 text-black shadow-md'
                    : 'bg-status-error text-white shadow-md'
                : highlight
                    ? 'text-yellow-400 hover:bg-app-secondary'
                    : 'text-text-muted hover:bg-app-secondary'
                }`}
        >
            {label}
        </button>
    );
}

// Import shared fetch
import { directSupabaseFetch as adminDirectFetch } from '../lib/supabaseUtils';


// ─── 알림톡 로그 뷰 ───────────────────────────────────────────────────────────
function NotificationLogView() {
    const [logs, setLogs] = useState<NotificationLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'alimtalk' | 'sms' | 'error'>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const loadLogs = useCallback(async () => {
        setLoading(true);
        try {
            let query = 'notification_logs?select=*&order=created_at.desc&limit=100';
            if (filter !== 'all') {
                if (filter === 'error') {
                    query += `&or=(channel.eq.error,status.like.KKO_*)`;
                } else {
                    query += `&channel=eq.${filter}`;
                }
            }
            const data = await adminDirectFetch(query);
            setLogs(data || []);
        } catch (e) {
            console.error('알림톡 로그 로드 실패:', e);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => { loadLogs(); }, [loadLogs]);

    const getChannelBadge = (log: NotificationLog) => {
        const ch = log.channel;
        if (ch === 'alimtalk' || log.status === 'OK') {
            return (
                <span className="flex items-center gap-1 text-xs bg-green-900/40 text-green-400 border border-green-700/50 rounded-full px-2 py-0.5">
                    <CheckCircle className="w-3 h-3" />알림톡
                </span>
            );
        }
        if (ch === 'sms' || log.status?.startsWith('KKO_')) {
            return (
                <span className="flex items-center gap-1 text-xs bg-yellow-900/40 text-yellow-400 border border-yellow-700/50 rounded-full px-2 py-0.5">
                    <MessageSquare className="w-3 h-3" />SMS대체
                </span>
            );
        }
        if (ch === 'error' || ch === 'unknown') {
            return (
                <span className="flex items-center gap-1 text-xs bg-red-900/40 text-red-400 border border-red-700/50 rounded-full px-2 py-0.5">
                    <XCircle className="w-3 h-3" />오류
                </span>
            );
        }
        return (
            <span className="text-xs bg-gray-700 text-gray-300 rounded-full px-2 py-0.5">{ch}</span>
        );
    };

    const getTypeBadge = (type: string) => {
        const map: Record<string, { label: string; color: string }> = {
            departure: { label: '출발', color: 'text-blue-400 bg-blue-900/40 border-blue-700/50' },
            waypoint:  { label: '경유', color: 'text-purple-400 bg-purple-900/40 border-purple-700/50' },
            arrival:   { label: '도착', color: 'text-green-400 bg-green-900/40 border-green-700/50' },
        };
        const info = map[type] || { label: type, color: 'text-gray-400 bg-gray-700' };
        return (
            <span className={`text-xs border rounded-full px-2 py-0.5 ${info.color}`}>{info.label}</span>
        );
    };

    // 필터별 카운트
    const countAll = logs.length;
    const countAlimtalk = logs.filter(l => l.channel === 'alimtalk' || l.status === 'OK').length;
    const countSms = logs.filter(l => l.channel === 'sms' || l.status?.startsWith('KKO_')).length;
    const countError = logs.filter(l => l.channel === 'error' || l.channel === 'unknown').length;

    return (
        <div className="space-y-4">
            {/* 상단 요약 카드 */}
            <div className="grid grid-cols-4 gap-2">
                <MiniStatCard label="전체" value={countAll} color="text-white" />
                <MiniStatCard label="알림톡" value={countAlimtalk} color="text-green-400" />
                <MiniStatCard label="SMS대체" value={countSms} color="text-yellow-400" />
                <MiniStatCard label="오류" value={countError} color="text-red-400" />
            </div>

            {/* 안내 배너 */}
            {countSms > 0 && countAlimtalk === 0 && (
                <div className="flex items-start gap-2 bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-3">
                    <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-yellow-300">
                        <div className="font-bold mb-1">알림톡이 모두 SMS로 대체되고 있습니다</div>
                        <div className="text-yellow-400/80">status 코드를 확인해 카카오 채널 연동 상태를 점검하세요. KKO_010: 채널 연결 없음, KKO_011: 템플릿 불일치</div>
                    </div>
                </div>
            )}

            {/* 필터 + 새로고침 */}
            <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-1 bg-app-secondary rounded-xl p-1 overflow-x-auto scrollbar-hide">
                    {(['all', 'alimtalk', 'sms', 'error'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filter === f ? 'bg-app-accent text-app-primary' : 'text-text-muted hover:text-white'}`}
                        >
                            {f === 'all' ? '전체' : f === 'alimtalk' ? '알림톡' : f === 'sms' ? 'SMS대체' : '오류'}
                        </button>
                    ))}
                </div>
                <button
                    onClick={loadLogs}
                    className="p-2 bg-app-secondary rounded-xl text-text-muted hover:text-white transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* 로그 목록 */}
            {loading ? (
                <div className="text-center text-text-muted py-12">로딩 중...</div>
            ) : logs.length === 0 ? (
                <div className="text-center py-12">
                    <Bell className="w-10 h-10 text-text-muted mx-auto mb-3" />
                    <div className="text-text-muted text-sm">로그가 없습니다</div>
                    <div className="text-text-muted/60 text-xs mt-1">알림톡을 발송하면 여기에 기록됩니다</div>
                </div>
            ) : (
                <div className="space-y-2">
                    {logs.map(log => (
                        <div
                            key={log.id}
                            className="bg-app-secondary border border-border rounded-xl overflow-hidden"
                        >
                            {/* 로그 헤더 */}
                            <button
                                className="w-full text-left p-3 flex items-center gap-3"
                                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                            >
                                <div className="flex flex-col gap-1 flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {getTypeBadge(log.type)}
                                        {getChannelBadge(log)}
                                        <span className="text-xs text-text-muted">{log.recipient}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-text-muted/70 font-mono">
                                            {new Date(log.created_at).toLocaleString('ko-KR', {
                                                month: '2-digit', day: '2-digit',
                                                hour: '2-digit', minute: '2-digit', second: '2-digit'
                                            })}
                                        </span>
                                        {log.error_message && (
                                            <span className="text-xs text-red-400 truncate">{log.error_message}</span>
                                        )}
                                    </div>
                                </div>
                                <span className="text-text-muted/50 text-xs">
                                    {expandedId === log.id ? '▲' : '▼'}
                                </span>
                            </button>

                            {/* 상세 펼침 */}
                            {expandedId === log.id && (
                                <div className="border-t border-border/50 p-3 space-y-2 text-xs">
                                    <DetailRow label="템플릿" value={log.template_code || '-'} />
                                    <DetailRow label="VAR1" value={log.var1 || '-'} />
                                    <DetailRow label="VAR2" value={log.var2 || '-'} />
                                    <DetailRow label="VAR3" value={log.var3 || '-'} />
                                    {log.var4 && <DetailRow label="VAR4" value={log.var4} />}
                                    <DetailRow label="Status" value={log.status || '-'} mono />
                                    {log.response_raw && (
                                        <div>
                                            <div className="text-text-muted mb-1">API 응답 (raw)</div>
                                            <pre className="bg-black/40 rounded-lg p-2 text-green-400/80 text-[10px] overflow-x-auto whitespace-pre-wrap break-all">
                                                {JSON.stringify(log.response_raw, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function MiniStatCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="bg-app-secondary border border-border rounded-xl p-2 text-center">
            <div className={`text-lg font-bold ${color}`}>{value}</div>
            <div className="text-[10px] text-text-muted">{label}</div>
        </div>
    );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex gap-2">
            <span className="text-text-muted w-16 flex-shrink-0">{label}</span>
            <span className={`text-text-primary break-all ${mono ? 'font-mono text-yellow-300' : ''}`}>{value}</span>
        </div>
    );
}


// ─── 대시보드 뷰 ──────────────────────────────────────────────────────────────
function DashboardView() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPoints: 0,
        loading: true
    });

    useEffect(() => {
        const loadStats = async () => {
            try {
                const profiles = await adminDirectFetch('profiles?select=points');
                const totalPoints = profiles.reduce((sum: number, p: { points?: number }) => sum + (p.points || 0), 0);
                setStats({ totalUsers: profiles.length, totalPoints, loading: false });
            } catch (error) {
                console.error('통계 로드 실패:', error);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };
        loadStats();
    }, []);

    if (stats.loading) {
        return <div className="text-center text-text-muted py-8">로딩 중...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <StatCard icon={Users} label="총 회원수" value={stats.totalUsers.toString()} />
                <StatCard icon={CreditCard} label="총 포인트" value={stats.totalPoints.toLocaleString() + 'P'} />
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
        <div className="bg-app-secondary border border-border rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
                <Icon className="w-5 h-5 text-text-muted" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-text-muted">{label}</div>
        </div>
    );
}


// ─── 회원 관리 뷰 ─────────────────────────────────────────────────────────────
function UserManagementView() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const data = await adminDirectFetch('profiles?select=id,full_name,email,points,created_at&order=created_at.desc');
                setUsers(data);
            } catch (error) {
                console.error('회원 목록 로드 실패:', error);
            } finally {
                setLoading(false);
            }
        };
        loadUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center text-text-muted py-8">로딩 중...</div>;

    return (
        <div className="space-y-4">
            <div className="relative">
                <input
                    type="text"
                    placeholder="회원 이름 또는 이메일 검색"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-app-secondary border border-border rounded-xl py-3 px-4 text-sm text-text-primary focus:outline-none focus:border-app-accent"
                />
            </div>
            {filteredUsers.length === 0 ? (
                <div className="text-center text-text-muted py-8">회원이 없습니다</div>
            ) : (
                <div className="space-y-3">
                    {filteredUsers.map(user => (
                        <div key={user.id} className="bg-app-secondary border border-border rounded-xl p-4 flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-white">{user.full_name || user.email?.split('@')[0]}</span>
                                </div>
                                <div className="text-xs text-text-muted">{user.email}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-app-accent font-bold">{user.points?.toLocaleString() || 0} P</div>
                                <div className="text-xs text-text-muted">
                                    {new Date(user.created_at).toLocaleDateString('ko-KR')} 가입
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


// ─── 포인트 관리 뷰 ───────────────────────────────────────────────────────────
function PointManagementView() {
    const [searchEmail, setSearchEmail] = useState('');
    const [pointAmount, setPointAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleAwardPoints = async () => {
        if (!searchEmail || !pointAmount || !description) {
            setMessage('모든 필드를 입력해주세요.');
            return;
        }
        const amount = parseInt(pointAmount);
        if (isNaN(amount) || amount <= 0) {
            setMessage('올바른 포인트 금액을 입력해주세요.');
            return;
        }
        setLoading(true);
        setMessage('');
        try {
            const profiles = await adminDirectFetch(`profiles?email=eq.${searchEmail}&select=id,full_name,email,points`);
            const profile = profiles && profiles.length > 0 ? profiles[0] : null;
            if (!profile) {
                setMessage(`❌ 사용자를 찾을 수 없습니다: ${searchEmail}`);
                setLoading(false);
                return;
            }
            const { handlePointTransaction } = await import('../lib/supabaseUtils');
            const newBalance = await handlePointTransaction({
                userId: profile.id,
                amount,
                type: 'earned',
                description,
            });
            setMessage(`✅ ${profile.full_name || profile.email}님에게 ${amount}P 지급 완료! (잔액: ${newBalance}P)`);
            setSearchEmail(''); setPointAmount(''); setDescription('');
        } catch (error) {
            setMessage(`❌ 포인트 지급 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-app-secondary border border-border rounded-xl p-5">
                <h3 className="font-bold text-white mb-4">포인트 지급</h3>
                <div className="space-y-3">
                    <input
                        type="email"
                        placeholder="사용자 이메일 (예: junopy741128@gmail.com)"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        className="w-full bg-app-tertiary border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-app-accent"
                    />
                    <input
                        type="number"
                        placeholder="지급 포인트 금액"
                        value={pointAmount}
                        onChange={(e) => setPointAmount(e.target.value)}
                        className="w-full bg-app-tertiary border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-app-accent"
                    />
                    <textarea
                        placeholder="지급 사유 (예: 이벤트 참여 보상)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-app-tertiary border border-border rounded-lg p-3 text-sm h-20 resize-none focus:outline-none focus:border-app-accent"
                    />
                    <button
                        onClick={handleAwardPoints}
                        disabled={loading}
                        className={`w-full py-3 font-bold rounded-lg transition-colors ${loading
                            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                            : 'bg-app-accent hover:bg-app-accent-hover text-app-primary'}`}
                    >
                        {loading ? '처리 중...' : '포인트 지급하기'}
                    </button>
                    {message && (
                        <div className={`p-3 rounded-lg text-sm ${message.startsWith('✅')
                            ? 'bg-status-success-bg text-status-success'
                            : 'bg-status-error-bg text-status-error'}`}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

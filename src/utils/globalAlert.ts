/**
 * [Rule] 앱 전역 알림 유틸리티
 * - window.alert() 대신 이 함수를 사용하세요.
 * - 앱 내 커스텀 AlertModal과 연결됩니다.
 * - 디자인 변경 시 App.tsx의 이벤트 핸들러만 수정하면 됩니다.
 *
 * 사용법:
 *   import { showAlert } from '../utils/globalAlert';
 *   showAlert('메시지 내용');
 */
export function showAlert(message: string): void {
  // CustomEvent로 App.tsx에 알림 요청 (React props 없이도 동작)
  const event = new CustomEvent('app:show-alert', { detail: { message } });
  window.dispatchEvent(event);
}

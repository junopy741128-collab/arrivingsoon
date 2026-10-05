import LocalSms from '../plugins/LocalSmsPlugin';

export interface SmsRequest {
  recipient: string;
  message: string;
}

export interface SmsResponse {
  success: boolean;
  error?: string;
}

export const SmsService = {
  /**
   * Sends an SMS using the local device (no cloud service, no costs!)
   */
  sendSms: async (request: SmsRequest): Promise<SmsResponse> => {
    try {
      // Check SMS permission
      const permissionStatus = await LocalSms.checkPermission();

      if (!permissionStatus.granted) {
        // Request permission
        const requestResult = await LocalSms.requestPermission();

        if (!requestResult.granted) {
          return {
            success: false,
            error: 'SMS 권한이 거부되었습니다. 앱 설정에서 권한을 허용해주세요.'
          };
        }
      }

      // Send SMS using local device
      await LocalSms.sendSms({
        phoneNumber: request.recipient,
        message: request.message
      });

      return { success: true };
    } catch (error: any) {
      console.error('[SmsService] Local SMS Error:', error);
      return {
        success: false,
        error: `문자 전송 실패: ${error.message || '알 수 없는 오류'}`
      };
    }
  },
};


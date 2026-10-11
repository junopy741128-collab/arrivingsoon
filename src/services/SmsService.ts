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
            error: 'SMS 권한이 필요합니다. 휴대폰 설정 > 애플리케이션 > 곧도착해용 > 권한에서 "SMS"를 허용해주세요.'
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
        error: error.message || '문자 전송에 실패했습니다. 권한 또는 잔여 문자를 확인해주세요.'
      };
    }
  },
};

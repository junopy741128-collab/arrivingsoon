/**
 * Template variable definitions and replacement utilities
 */

export const TEMPLATE_VARIABLES = {
    TIME: '{시간}',
    DRIVER: '{기사명}',
    DESTINATION: '{도착지}',
    DEPARTURE: '{출발지}'
} as const;

export interface TemplateData {
    time?: number;
    driverName?: string;
    destination?: string;
    departure?: string;
}

/**
 * Replace template variables with actual data
 * @param template - Template string with variables like {시간}, {기사명}, etc.
 * @param data - Actual data to replace variables with
 * @returns Processed string with variables replaced
 */
export function replaceTemplateVariables(
    template: string,
    data: TemplateData
): string {
    let result = template;

    // Replace time variable
    if (data.time !== undefined) {
        result = result.replace(/{시간}/g, data.time.toString());
    }

    // Replace driver name variable
    if (data.driverName) {
        result = result.replace(/{기사명}/g, data.driverName);
    }

    // Replace destination variable
    if (data.destination) {
        result = result.replace(/{도착지}/g, data.destination);
    }

    // Replace departure variable
    if (data.departure) {
        result = result.replace(/{출발지}/g, data.departure);
    }

    return result;
}

/**
 * Get preview message with sample data
 * @param template - Template string to preview
 * @returns Preview string with sample data
 */
export function getPreviewMessage(template: string): string {
    return replaceTemplateVariables(template, {
        time: 5,
        driverName: '정ㅇㅇ',
        destination: '고덕역',
        departure: '집'
    });
}

/**
 * Check if a string contains any template variables
 * @param text - Text to check
 * @returns True if text contains template variables
 */
export function hasTemplateVariables(text: string): boolean {
    return /{시간}|{기사명}|{도착지}|{출발지}/.test(text);
}


export const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }
    return phone;
};

export const formatRecipientDisplay = (recipientString: string | undefined | null): string => {
    if (!recipientString) return '받는 사람 없음';

    const items = recipientString.split(',').map(item => item.trim()).filter(Boolean);
    if (items.length === 0) return '받는 사람 없음';

    // Helper to extract name from "Name (Number)" or just use item
    const getName = (item: string) => {
        // Check if matches "Name (Number)" pattern
        const match = item.match(/^(.+?)\s*\((\d{2,3}-?\d{3,4}-?\d{4})\)$/);
        if (match) {
            return match[1]; // Return Name
        }
        // Check if it's just a phone number
        if (item.match(/^\d{2,3}-?\d{3,4}-?\d{4}$/)) {
            return formatPhoneNumber(item);
        }
        return item;
    };

    const firstItemName = getName(items[0]);

    if (items.length === 1) {
        return firstItemName;
    }

    return `${firstItemName} 외 ${items.length - 1}명`;
};

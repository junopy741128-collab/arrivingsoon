import re

with open('src/components/MyPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_func = '''    // [New] Dynamic Purchase Handler
    const handlePurchase = async (productId: string, productName: string, amount: number, priceStr: string) => {
        try {
            console.log("🛠 [IAP] Initializing Purchase for " + productName + "...");
            const { default: OneStore } = await import('../utils/OneStore');
            const { supabase } = await import('../lib/supabaseClient');

            await OneStore.init();

            const result = await OneStore.purchase({
                productId: productId,
                productName: productName,
                developerPayload: userProfile.email || '' // Pass email for verification context
            });

            console.log("✅[IAP] Purchase Success:", result);
            setAlertState({ open: true, message: "구매가 완료되었습니다. 처리 중..." });

            // 1. Save Receipt to Supabase
            const { error: receiptError } = await supabase
                .from('payment_receipts')
                .insert({
                    user_id: localStorage.getItem('userId'),
                    order_id: result.orderId,
                    product_id: result.productId,
                    purchase_token: result.purchaseToken,
                    package_name: result.packageName,
                    purchase_time: result.purchaseTime,
                    security_token: result.securityToken,
                    signature: result.signature,
                    original_json: result.originalJson,
                    verified: true
                });

            if (receiptError) {
                console.error("❌[IAP] Receipt Save Failed:", receiptError);
            }

            // 2. Grant Points
            const { handlePointTransaction } = await import('../lib/supabaseUtils');
            await handlePointTransaction({
                userId: localStorage.getItem('userId') || '',
                amount: amount,
                type: 'earned',
                description: '포인트 충전 (' + priceStr + ')'
            });

            // 3. Consume the Product (원스토어 상품 소비 처리)
            try {
                console.log("🛠[IAP] Consuming product...");
                await OneStore.consume({ purchaseToken: result.purchaseToken });
                console.log("✅[IAP] Consume Success");
            } catch (consumeErr) {
                console.error("❌[IAP] Consume Failed:", consumeErr);
            }

            setAlertState({ open: true, message: amount + " 포인트가 충전되었습니다! 🎉" });
            
            // 포인트 내역 새로고침
            const history = await getPointHistory(localStorage.getItem('userId') || '');
            setPointHistory(history);

        } catch (e: any) {
            console.error("❌ [IAP] Purchase Failed:", e);
            setAlertState({ open: true, message: "구매 실패: " + (e.message || "알 수 없는 오류") });
        }
    };'''

# Replace from const handlePurchase = async () => { to // [New] Cloud Backup Handler
pattern = re.compile(r'const handlePurchase = async \(\) => \{.*?^\s*// \[New\] Cloud Backup Handler', re.MULTILINE | re.DOTALL)
content = pattern.sub(new_func + '\n\n    // [New] Cloud Backup Handler', content)

new_ui = '''                        {/* [New] Purchase Buttons */}
                        <div className="flex flex-col gap-2 mt-4 relative z-10">
                            <button
                                onClick={() => handlePurchase('0001007230', '1000 포인트 충전', 1000, '1,000원')}
                                className="px-4 py-3 bg-app-accent text-app-primary text-sm font-bold rounded-lg hover:bg-white transition-colors flex items-center justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    <span>1000 포인트 충전</span>
                                </div>
                                <span className="opacity-80">1,000원</span>
                            </button>
                            <button
                                onClick={() => handlePurchase('0001007231', '3000 포인트 충전', 3000, '3,000원')}
                                className="px-4 py-3 bg-app-accent text-app-primary text-sm font-bold rounded-lg hover:bg-white transition-colors flex items-center justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    <span>3000 포인트 충전</span>
                                </div>
                                <span className="opacity-80">3,000원</span>
                            </button>
                            <button
                                onClick={() => handlePurchase('0001007232', '5000 포인트 충전 (보너스 500P)', 5500, '5,000원')}
                                className="px-4 py-3 bg-gradient-to-r from-yellow-400 to-app-accent text-app-primary text-sm font-bold rounded-lg shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    <span>5500 포인트 (보너스 500P)</span>
                                </div>
                                <span className="opacity-80">5,000원</span>
                            </button>
                        </div>
                    </div>'''

pattern2 = re.compile(r'<button\s*onClick=\{handlePurchase\}[^>]*>[\s\S]*?</button>\s*</div>\s*<div className="absolute right-0 top-0 h-full w-1/3 bg-app-accent/5 skew-x-12"></div>\s*</div>', re.MULTILINE | re.DOTALL)
content = pattern2.sub(new_ui, content)

with open('src/components/MyPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced handlePurchase and UI")

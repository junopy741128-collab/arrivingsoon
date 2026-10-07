const fs = require('fs');
const content = fs.readFileSync('src/components/MyPage.tsx', 'utf8');

const newUI = `                        {/* [New] Purchase Buttons */}
                        <div className="flex flex-col gap-2 mt-4 relative z-10">
                            <button
                                onClick={() => handlePurchase('point_1000', '1000 포인트 충전', 1000, '1,500원')}
                                className="px-4 py-3 bg-app-accent text-app-primary text-sm font-bold rounded-lg hover:bg-white transition-colors flex items-center justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    <span>1000 포인트 충전</span>
                                </div>
                                <span className="opacity-80">1,500원</span>
                            </button>
                            <button
                                onClick={() => handlePurchase('point_3000', '3000 포인트 충전', 3000, '4,500원')}
                                className="px-4 py-3 bg-app-accent text-app-primary text-sm font-bold rounded-lg hover:bg-white transition-colors flex items-center justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    <span>3000 포인트 충전</span>
                                </div>
                                <span className="opacity-80">4,500원</span>
                            </button>
                            <button
                                onClick={() => handlePurchase('point_5000', '5000 포인트 충전 (보너스 500P)', 5500, '7,500원')}
                                className="px-4 py-3 bg-gradient-to-r from-yellow-400 to-app-accent text-app-primary text-sm font-bold rounded-lg shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    <span>5500 포인트 (보너스 500P)</span>
                                </div>
                                <span className="opacity-80">7,500원</span>
                            </button>
                        </div>
                    </div>`;

const regex = /<button[\s\S]*?onClick=\{handlePurchase\}[\s\S]*?<\/button>\s*<\/div>/m;
const newContent = content.replace(regex, newUI);
fs.writeFileSync('src/components/MyPage.tsx', newContent);
console.log('Done replacing UI');

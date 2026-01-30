import { useState, useEffect } from 'react';

export const usePro = () => {
    const [isPro, setIsPro] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // Mock checking subscription status
        const savedStatus = localStorage.getItem('entheo_pro_status');
        if (savedStatus === 'true') {
            setIsPro(true);
        }
        setIsLoading(false);
    }, []);

    const upgradeToPro = async () => {
        setIsLoading(true);
        // Simulate API call / Payment processing
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                localStorage.setItem('entheo_pro_status', 'true');
                setIsPro(true);
                setIsLoading(false);
                resolve();
            }, 1500);
        });
    };

    const restorePurchases = async () => {
        setIsLoading(true);
        // Simulate Restore
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                const savedStatus = localStorage.getItem('entheo_pro_status');
                if (savedStatus === 'true') {
                    setIsPro(true);
                }
                setIsLoading(false);
                resolve();
            }, 1000);
        });
    };

    // Dev helper to reset
    const resetPro = () => {
        localStorage.removeItem('entheo_pro_status');
        setIsPro(false);
    };

    return {
        isPro,
        isLoading,
        upgradeToPro,
        restorePurchases,
        resetPro
    };
};

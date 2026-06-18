import { useState, useCallback, useMemo } from "react";
import type { PdfTab } from '../types/pdf'

export function usePdfTabs() {
    const [tabs, setTabs] = useState<PdfTab[]>([]);
    const [activeTabId, setActiveTabId] = useState<string | null>(null);

    const openPdf = useCallback((data: Blob, name: string, password?: string) => {
        const url = URL.createObjectURL(data)

        const newTab: PdfTab = {
            id: crypto.randomUUID(),
            name,
            data,
            url,               // 👈
            zoom: 1.0,
            scrollTop: 0,
            currentPage: 1,
            password,
        }
        setTabs(prev => [...prev, newTab])
        setActiveTabId(newTab.id)
    }, [])

    const closeTab = useCallback((id: string) => {
        setTabs(prev => {
            const newTabs = prev.filter(t => t.id !== id);

            if (id === activeTabId) {
                const currentIndex = prev.findIndex(t => t.id === id);
                const nextTab = newTabs[currentIndex] || newTabs[currentIndex - 1];
                setActiveTabId(nextTab?.id || null);
            }
            return newTabs;
        });
    }, [activeTabId]);

    const switchTab = useCallback((id: string) => {
        setActiveTabId(id);
    }, []);

    const updateTab = useCallback((id: string, updates: Partial<Omit<PdfTab, 'id' | 'data'>>) => {
        setTabs(prev => prev.map(tab =>
            tab.id === id ? { ...tab, ...updates } : tab
        ));
    }, []);



    const activeTab = useMemo(
        () => tabs.find(t => t.id === activeTabId) || null,
        [tabs, activeTabId]
    );

    return {
        tabs,
        activeTab,
        activeTabId,
        openPdf,
        closeTab,
        switchTab,
        updateTab,
    };
}
import { PdfTab } from '../types/pdf';

interface PdfTabBarProps {
    tabs: PdfTab[];
    activeTabId: string | null;
    onSwitchTab: (id: string) => void;
    onCloseTab: (id: string) => void;
}

export function PdfTabBar({ tabs, activeTabId, onSwitchTab, onCloseTab }: PdfTabBarProps) {
    if (tabs.length === 0) return null;

    return (
        <div className="pdf-tab-bar">
            {tabs.map(tab => (
                <div 
                    key={tab.id}
                    className={`pdf-tab ${tab.id === activeTabId ? 'active' : ''}`}
                    onClick={() => onSwitchTab(tab.id)}
                >
                    <span className="tab-name">{tab.name}</span>
                    <button
                        className="tab-close"
                        onClick={(e) => {
                            e.stopPropagation();
                            onCloseTab(tab.id);
                        }}
                    >
                       ×
                    </button>
                </div>
            ))}
        </div>
    );
}
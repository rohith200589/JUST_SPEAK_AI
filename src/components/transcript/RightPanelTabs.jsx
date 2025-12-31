// src/components/transcript/RightPanelTabs.jsx
import React from 'react';
import { FileText, BarChart, Sparkles } from 'lucide-react';

const RightPanelTabs = ({ theme, rightPanelTabs, rightPanelTab, setRightPanelTab, currentThemeColors }) => {
  return (
    <div className="flex space-x-4">
      {rightPanelTabs.map((tab, index) => (
        <React.Fragment key={tab.name}>
          <button
            onClick={() => setRightPanelTab(tab.name)}
            className={`flex items-center gap-2 py-3 px-2 text-sm transition-colors duration-200
              ${rightPanelTab === tab.name
                ? `font-semibold ${currentThemeColors.tabActiveText} border-b-2 ${currentThemeColors.tabActiveBorder}`
                : `font-medium ${currentThemeColors.tabInactiveText} ${currentThemeColors.tabHoverText}`
              }
            `}
          >
            {React.cloneElement(tab.icon, { className: `h-4 w-4 ${rightPanelTab === tab.name ? currentThemeColors.tabActiveText : currentThemeColors.tabInactiveText}` })}
            <span className={rightPanelTab === tab.name ? currentThemeColors.tabActiveText : currentThemeColors.tabInactiveText}>{tab.name}</span>
          </button>
          {index < rightPanelTabs.length - 1 && <div className={`w-px h-5 my-auto ${currentThemeColors.panelBorder}`}></div>}
        </React.Fragment>
      ))}
    </div>
  );
};

export default RightPanelTabs;
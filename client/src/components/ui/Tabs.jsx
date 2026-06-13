import React, { useState } from 'react';

const Tabs = ({ tabs, defaultTab = 0 }) => {
  const [active, setActive] = useState(defaultTab);
  return (
    <div>
      <div className="flex gap-1 border-b mb-6" style={{ borderColor: 'var(--color-border)' }}>
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              active === i ? 'border-current' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={active === i ? { color: 'var(--color-primary)', borderColor: 'var(--color-primary)' } : {}}
          >
            {tab.icon && tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      {tabs[active]?.content}
    </div>
  );
};

export default Tabs;

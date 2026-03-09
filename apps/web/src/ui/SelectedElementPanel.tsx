import { Save, Code } from 'lucide-react';
import type { LocatorStrategy } from './elementLocators';

export function SelectedElementPanel({
  elementName,
  setElementName,
  screens,
  selectedScreen,
  setSelectedScreen,
  newScreenName,
  setNewScreenName,
  locators,
  primaryLocatorIndex,
  setPrimaryLocatorIndex,
  locatorTestResult,
  setLocatorTestResult,
  testSelectedLocator,
  selectedElement,
  saving,
  handleSave,
}: {
  elementName: string;
  setElementName: (v: string) => void;
  screens: any[];
  selectedScreen: string;
  setSelectedScreen: (v: string) => void;
  newScreenName: string;
  setNewScreenName: (v: string) => void;
  locators: LocatorStrategy[];
  primaryLocatorIndex: number;
  setPrimaryLocatorIndex: (v: number) => void;
  locatorTestResult: 'idle' | 'pass' | 'fail';
  setLocatorTestResult: (v: 'idle' | 'pass' | 'fail') => void;
  testSelectedLocator: () => void;
  selectedElement: HTMLElement;
  saving: boolean;
  handleSave: () => void;
}) {
  return (
    <div className="card" style={{ flex: 1, overflow: 'auto' }}>
      <div className="h2" style={{ marginBottom: 12 }}>
        Selected Element
      </div>
      <div style={{ marginBottom: 12 }}>
        <label className="small" style={{ display: 'block', marginBottom: 4, color: '#a8b3cf' }}>
          Element Name *
        </label>
        <input
          className="input"
          placeholder="e.g., Search Button"
          value={elementName}
          onChange={(e) => setElementName(e.target.value)}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label className="small" style={{ display: 'block', marginBottom: 4, color: '#a8b3cf' }}>
          Screen
        </label>
        <select
          className="input"
          value={selectedScreen}
          onChange={(e) => setSelectedScreen(e.target.value)}
          style={{ marginBottom: 4 }}
        >
          <option value="">Select existing screen...</option>
          {screens.map((s: any) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          className="input"
          placeholder="Or create new screen..."
          value={newScreenName}
          onChange={(e) => setNewScreenName(e.target.value)}
        />
      </div>

      <div className="h2" style={{ marginBottom: 8, fontSize: 14 }}>
        Generated Locators ({locators.length})
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <button
          className="btn"
          type="button"
          onClick={testSelectedLocator}
          style={{ padding: '6px 10px' }}
        >
          Test Locator
        </button>
        {locatorTestResult === 'pass' && (
          <span className="small" style={{ color: '#22c55e' }}>
            Match found
          </span>
        )}
        {locatorTestResult === 'fail' && (
          <span className="small" style={{ color: '#ef4444' }}>
            No match found
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {locators.map((loc, i) => (
          <div
            key={i}
            style={{
              padding: 8,
              background: i === primaryLocatorIndex ? 'rgba(99,102,241,0.15)' : '#1a1a1a',
              border: `1px solid ${i === primaryLocatorIndex ? '#6366f1' : '#2a2a2a'}`,
              borderRadius: 6,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <input
                type="radio"
                name="primary-locator"
                checked={i === primaryLocatorIndex}
                onChange={() => {
                  setPrimaryLocatorIndex(i);
                  setLocatorTestResult('idle');
                }}
              />
              <span className="badge" style={{ fontSize: 10 }}>
                {loc.type}
              </span>
              {i === primaryLocatorIndex && (
                <span className="small" style={{ color: '#6366f1' }}>
                  Primary
                </span>
              )}
              <span className="small" style={{ color: '#a8b3cf' }}>
                {Math.round(loc.reliability * 100)}% reliable
              </span>
            </div>
            <code style={{ fontSize: 11, color: '#a8b3cf', wordBreak: 'break-all' }}>
              {JSON.stringify(loc.value)}
            </code>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 16,
          padding: 12,
          background: '#1a1a1a',
          borderRadius: 6,
          border: '1px solid #2a2a2a',
        }}
      >
        <div className="small" style={{ color: '#a8b3cf', marginBottom: 6 }}>
          <Code size={14} style={{ display: 'inline', marginRight: 4 }} /> Element Info
        </div>
        <div className="small" style={{ color: '#a8b3cf', fontFamily: 'monospace' }}>
          Tag: {selectedElement.tagName.toLowerCase()}
          <br />
          {selectedElement.id && (
            <>
              ID: {selectedElement.id}
              <br />
            </>
          )}
          {selectedElement.className && (
            <>
              Class: {selectedElement.className}
              <br />
            </>
          )}
          Text: {selectedElement.textContent?.trim().slice(0, 50)}...
        </div>
      </div>

      <button
        className="btn"
        onClick={handleSave}
        disabled={saving}
        style={{ width: '100%', marginTop: 12 }}
      >
        <Save size={16} /> {saving ? 'Saving...' : 'Save Element'}
      </button>
    </div>
  );
}

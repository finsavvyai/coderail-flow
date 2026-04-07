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
    <div className="card panel-grow">
      <div className="h2 mb-12">Selected Element</div>
      <div className="field-group">
        <label className="small field-label">Element Name *</label>
        <input
          className="input"
          placeholder="e.g., Search Button"
          value={elementName}
          onChange={(e) => setElementName(e.target.value)}
        />
      </div>
      <div className="field-group">
        <label className="small field-label">Screen</label>
        <select
          className="input mb-4"
          value={selectedScreen}
          onChange={(e) => setSelectedScreen(e.target.value)}
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

      <div className="h2 mb-8" style={{ fontSize: 14 }}>
        Generated Locators ({locators.length})
      </div>
      <div className="locator-card-header mb-8">
        <button className="btn btn-compact" type="button" onClick={testSelectedLocator}>
          Test Locator
        </button>
        {locatorTestResult === 'pass' && <span className="small locator-pass">Match found</span>}
        {locatorTestResult === 'fail' && <span className="small locator-fail">No match found</span>}
      </div>
      <div className="locator-list">
        {locators.map((loc, i) => (
          <div
            key={i}
            className={`locator-card${i === primaryLocatorIndex ? ' locator-card--primary' : ''}`}
          >
            <div className="locator-card-header">
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
                <span className="small locator-primary-label">Primary</span>
              )}
              <span className="small locator-reliability">
                {Math.round(loc.reliability * 100)}% reliable
              </span>
            </div>
            <code className="locator-code">{JSON.stringify(loc.value)}</code>
          </div>
        ))}
      </div>

      <div className="element-info">
        <div className="small element-info-label">
          <Code size={14} style={{ display: 'inline', marginRight: 4 }} /> Element Info
        </div>
        <div className="small element-info-mono">
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

      <button className="btn w-full mt-12" onClick={handleSave} disabled={saving}>
        <Save size={16} /> {saving ? 'Saving...' : 'Save Element'}
      </button>
    </div>
  );
}

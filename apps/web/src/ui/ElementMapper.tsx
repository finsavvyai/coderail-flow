import React, { useState, useEffect, useRef } from 'react';
import { createElement, getScreens, createScreen } from './api';
import { generateLocators, findElementByLocator, type LocatorStrategy } from './elementLocators';
import { ElementMapperPreview } from './ElementMapperPreview';
import { SelectedElementPanel } from './SelectedElementPanel';
import { InspectToolbar } from './InspectToolbar';

export function ElementMapper({
  projectId,
  onSave,
  onCancel,
}: {
  projectId: string;
  onSave: (element: any) => void;
  onCancel: () => void;
}) {
  const [url, setUrl] = useState('');
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [elementName, setElementName] = useState('');
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [locators, setLocators] = useState<LocatorStrategy[]>([]);
  const [primaryLocatorIndex, setPrimaryLocatorIndex] = useState(0);
  const [screens, setScreens] = useState<any[]>([]);
  const [selectedScreen, setSelectedScreen] = useState('');
  const [newScreenName, setNewScreenName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [inspectMode, setInspectMode] = useState(false);
  const [locatorTestResult, setLocatorTestResult] = useState<'idle' | 'pass' | 'fail'>('idle');
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void loadScreens();
  }, [projectId]);

  async function loadScreens() {
    try {
      setScreens(await getScreens(projectId));
    } catch (e: any) {
      setError(e.message);
    }
  }

  function loadPage() {
    if (!url.trim()) return;
    setIframeLoaded(false);
    setSelectedElement(null);
    setLocators([]);
    setLocatorTestResult('idle');
    setTimeout(() => setIframeLoaded(true), 500);
  }

  function handleElementClick(e: React.MouseEvent) {
    if (!inspectMode) return;
    e.preventDefault();
    e.stopPropagation();
    const target = e.target as HTMLElement;
    setSelectedElement(target);
    setLocators(generateLocators(target));
    setPrimaryLocatorIndex(0);
    setLocatorTestResult('idle');
    setElementName(target.textContent?.trim().slice(0, 30) || target.tagName.toLowerCase());
    setInspectMode(false);
  }

  function testSelectedLocator() {
    const locator = locators[primaryLocatorIndex];
    if (!locator) return;
    const el = findElementByLocator(previewRef.current, locator);
    if (!el) {
      setLocatorTestResult('fail');
      return;
    }
    setLocatorTestResult('pass');
    const prevOutline = el.style.outline;
    el.style.outline = '3px solid var(--success)';
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => {
      el.style.outline = prevOutline;
    }, 1200);
  }

  async function handleSave() {
    if (!elementName.trim()) {
      setError('Element name is required');
      return;
    }
    if (locators.length === 0) {
      setError('No locators generated. Please select an element.');
      return;
    }

    let screenId = selectedScreen;
    if (newScreenName.trim()) {
      try {
        const urlObj = new URL(url);
        const screen = await createScreen({
          projectId,
          name: newScreenName.trim(),
          urlPath: urlObj.pathname,
        });
        screenId = screen.id;
        await loadScreens();
      } catch (e: any) {
        setError(`Failed to create screen: ${e.message}`);
        return;
      }
    }
    if (!screenId) {
      setError('Please select or create a screen');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const element = await createElement({
        screenId,
        name: elementName.trim(),
        locatorPrimary: locators[primaryLocatorIndex],
        locatorFallbacks: locators.filter((_, idx) => idx !== primaryLocatorIndex),
        reliabilityScore: locators[primaryLocatorIndex]?.reliability,
      });
      onSave(element);
    } catch (e: any) {
      setError(e.message || 'Failed to save element');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="inspector-layout">
      <div className="inspector-sidebar">
        <InspectToolbar
          url={url}
          setUrl={setUrl}
          iframeLoaded={iframeLoaded}
          inspectMode={inspectMode}
          setInspectMode={setInspectMode}
          error={error}
          onLoadPage={loadPage}
          onCancel={onCancel}
        />

        {selectedElement && (
          <SelectedElementPanel
            elementName={elementName}
            setElementName={setElementName}
            screens={screens}
            selectedScreen={selectedScreen}
            setSelectedScreen={setSelectedScreen}
            newScreenName={newScreenName}
            setNewScreenName={setNewScreenName}
            locators={locators}
            primaryLocatorIndex={primaryLocatorIndex}
            setPrimaryLocatorIndex={setPrimaryLocatorIndex}
            locatorTestResult={locatorTestResult}
            setLocatorTestResult={setLocatorTestResult}
            testSelectedLocator={testSelectedLocator}
            selectedElement={selectedElement}
            saving={saving}
            handleSave={handleSave}
          />
        )}
      </div>

      <div className="card inspector-preview">
        <ElementMapperPreview
          iframeLoaded={iframeLoaded}
          inspectMode={inspectMode}
          previewRef={previewRef}
          onElementClick={handleElementClick}
        />
      </div>
    </div>
  );
}

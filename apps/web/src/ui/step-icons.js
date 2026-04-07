import { jsx as _jsx } from "react/jsx-runtime";
import { Globe, MessageSquare, MousePointer, Pencil, Sparkles, Hourglass, Pause, Target, FileText, ClipboardList, Keyboard, FolderOpen, Shuffle, MousePointerClick, Pointer, Eraser, Crosshair, Wind, CheckCircle, Link, Search, Timer, Radio, Camera, FileDown, BarChart3, ScrollText, Frame, Smartphone, Monitor, Cookie, Zap, StickyNote, RefreshCw, HelpCircle, } from 'lucide-react';
const STEP_ICON_MAP = {
    goto: Globe,
    caption: MessageSquare,
    click: MousePointer,
    fill: Pencil,
    highlight: Sparkles,
    waitFor: Hourglass,
    pause: Pause,
    hover: Target,
    select: FileText,
    selectRow: ClipboardList,
    keyboard: Keyboard,
    fileUpload: FolderOpen,
    dragDrop: Shuffle,
    rightClick: MousePointerClick,
    doubleClick: Pointer,
    clearInput: Eraser,
    focus: Crosshair,
    blur: Wind,
    assertText: CheckCircle,
    assertUrl: Link,
    assertElement: Search,
    waitForNavigation: Timer,
    waitForNetwork: Radio,
    screenshot: Camera,
    pdf: FileDown,
    extractData: BarChart3,
    scroll: ScrollText,
    iframe: Frame,
    setViewport: Smartphone,
    emulateDevice: Monitor,
    setCookies: Cookie,
    executeScript: Zap,
    setVariable: StickyNote,
    loop: RefreshCw,
    conditional: HelpCircle,
};
export function StepIcon({ type, size = 18 }) {
    const Icon = STEP_ICON_MAP[type];
    if (Icon) {
        return (_jsx("span", { "aria-hidden": "true", className: "step-icon", children: _jsx(Icon, { size: size }) }));
    }
    return (_jsx("span", { "aria-hidden": "true", style: { fontSize: size }, children: "?" }));
}

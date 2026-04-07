import { jsx as _jsx } from "react/jsx-runtime";
import { InputField, SelectField, TextField, FullPageField, CookiesField, } from './StepFieldRenderersInputs';
const PLACEMENT_OPTS = [
    { value: 'top', label: 'Top' },
    { value: 'center', label: 'Center' },
    { value: 'bottom', label: 'Bottom' },
];
const STYLE_OPTS = [
    { value: 'box', label: 'Box' },
    { value: 'pulse', label: 'Pulse' },
];
const STATE_OPTS = [
    { value: 'visible', label: 'Visible' },
    { value: 'hidden', label: 'Hidden' },
];
const DIR_OPTS = [
    { value: 'up', label: 'Up' },
    { value: 'down', label: 'Down' },
    { value: 'top', label: 'To Top' },
    { value: 'bottom', label: 'To Bottom' },
];
const FIELD_MAP = {
    url: (p) => (_jsx(InputField, { ...p, label: "URL", field: "url", placeholder: "https://example.com or leave empty to use screenId" })),
    screenId: (p) => (_jsx(InputField, { ...p, label: "Screen ID", field: "screenId", placeholder: "scr-dashboard" })),
    elementId: (p) => (_jsx(InputField, { ...p, label: "Element ID *", field: "elementId", placeholder: "el-search-btn" })),
    text: (p) => _jsx(TextField, { ...p }),
    value: (p) => (_jsx(InputField, { ...p, label: "Value *", field: "value", placeholder: "Text to fill (use {{param}} for parameters)" })),
    narrate: (p) => (_jsx(InputField, { ...p, label: "Narration (optional)", field: "narrate", placeholder: "Spoken text for this step (appears in SRT subtitles)" })),
    placement: (p) => (_jsx(SelectField, { ...p, label: "Placement", field: "placement", fallback: "bottom", options: PLACEMENT_OPTS })),
    style: (p) => (_jsx(SelectField, { ...p, label: "Highlight Style", field: "style", fallback: "box", options: STYLE_OPTS })),
    ms: (p) => (_jsx(InputField, { ...p, label: "Duration (ms)", field: "ms", placeholder: "1000", type: "number" })),
    state: (p) => (_jsx(SelectField, { ...p, label: "State", field: "state", fallback: "visible", options: STATE_OPTS })),
    matchText: (p) => (_jsx(InputField, { ...p, label: "Match Text *", field: "matchText", placeholder: "Text to match in table row (use {{param}} for parameters)" })),
    direction: (p) => (_jsx(SelectField, { ...p, label: "Direction", field: "direction", fallback: "down", options: DIR_OPTS })),
    pixels: (p) => (_jsx(InputField, { ...p, label: "Pixels (optional)", field: "pixels", placeholder: "300", type: "number" })),
    label: (p) => (_jsx(InputField, { ...p, label: "Screenshot Label (optional)", field: "label", placeholder: "Label to show on screenshot" })),
    fullPage: (p) => _jsx(FullPageField, { ...p }),
    cookies: (p) => _jsx(CookiesField, { ...p }),
};
export function renderStepFields(fields, step, onUpdate) {
    return fields.map((field) => {
        const render = FIELD_MAP[field];
        if (!render)
            return null;
        return _jsx("div", { children: render({ step, onUpdate }) }, field);
    });
}

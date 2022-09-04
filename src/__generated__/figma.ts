// To parse this data:
//
//   import { Convert, Project } from "./file";
//
//   const project = Convert.toProject(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Project {
    componentSets: ComponentSets;
    components:    ComponentSets;
    document:      Document;
    editorType:    string;
    lastModified:  Date;
    linkAccess:    string;
    name:          string;
    role:          string;
    schemaVersion: number;
    styles:        { [key: string]: StyleValue };
    thumbnailUrl:  string;
    version:       string;
}

export interface ComponentSets {
}

export interface Document {
    children: DocumentChild[];
    id:       string;
    name:     string;
    type:     string;
}

export interface DocumentChild {
    backgroundColor:      Color;
    children:             PurpleChild[];
    flowStartingPoints:   any[];
    id:                   string;
    name:                 string;
    prototypeDevice:      PrototypeDevice;
    prototypeStartNodeID: null;
    type:                 string;
}

export interface Color {
    a: number;
    b: number;
    g: number;
    r: number;
}

export interface PurpleChild {
    absoluteBoundingBox:  Absolute;
    absoluteRenderBounds: Absolute;
    background:           Background[];
    backgroundColor:      Color;
    blendMode:            string;
    children:             FluffyChild[];
    clipsContent:         boolean;
    constraints:          Constraints;
    effects:              any[];
    fills:                Background[];
    id:                   string;
    name:                 string;
    strokeAlign:          string;
    strokeWeight:         number;
    strokes:              any[];
    type:                 string;
}

export interface Absolute {
    height: number;
    width:  number;
    x:      number;
    y:      number;
}

export interface Background {
    blendMode: BlendMode;
    color:     Color;
    type:      Type;
}

export enum BlendMode {
    Normal = "NORMAL",
}

export enum Type {
    Solid = "SOLID",
}

export interface FluffyChild {
    absoluteBoundingBox:  Absolute;
    absoluteRenderBounds: Absolute;
    background?:          any[];
    backgroundColor?:     Color;
    blendMode:            string;
    children?:            TentacledChild[];
    clipsContent?:        boolean;
    constraints:          Constraints;
    effects:              any[];
    fills:                Background[];
    id:                   string;
    name:                 string;
    preserveRatio?:       boolean;
    strokeAlign:          string;
    strokeWeight:         number;
    strokes:              any[];
    styles?:              Styles;
    type:                 string;
}

export interface TentacledChild {
    absoluteBoundingBox:      Absolute;
    absoluteRenderBounds:     Absolute;
    blendMode:                string;
    characterStyleOverrides?: any[];
    characters?:              string;
    constraints:              Constraints;
    effects:                  any[];
    fills:                    Background[];
    id:                       string;
    layoutVersion?:           number;
    lineIndentations?:        number[];
    lineTypes?:               string[];
    name:                     string;
    preserveRatio?:           boolean;
    strokeAlign:              string;
    strokeWeight:             number;
    strokes:                  any[];
    style?:                   ChildStyle;
    styleOverrideTable?:      ComponentSets;
    styles:                   Styles;
    type:                     string;
}

export interface Constraints {
    horizontal: Horizontal;
    vertical:   Vertical;
}

export enum Horizontal {
    Left = "LEFT",
}

export enum Vertical {
    Top = "TOP",
}

export interface ChildStyle {
    fontFamily:          string;
    fontPostScriptName:  null | string;
    fontSize:            number;
    fontWeight:          number;
    letterSpacing:       number;
    lineHeightPercent:   number;
    lineHeightPx:        number;
    lineHeightUnit:      string;
    textAlignHorizontal: Horizontal;
    textAlignVertical:   Vertical;
    textAutoResize:      string;
}

export interface Styles {
    fill: string;
}

export interface PrototypeDevice {
    rotation: string;
    type:     string;
}

export interface StyleValue {
    description: string;
    key:         string;
    name:        string;
    styleType:   string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toProject(json: string): Project {
        return cast(JSON.parse(json), r("Project"));
    }

    public static projectToJson(value: Project): string {
        return JSON.stringify(uncast(value, r("Project")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`, );
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases, val);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val);
    }
    if (typ === false) return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "Project": o([
        { json: "componentSets", js: "componentSets", typ: r("ComponentSets") },
        { json: "components", js: "components", typ: r("ComponentSets") },
        { json: "document", js: "document", typ: r("Document") },
        { json: "editorType", js: "editorType", typ: "" },
        { json: "lastModified", js: "lastModified", typ: Date },
        { json: "linkAccess", js: "linkAccess", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "role", js: "role", typ: "" },
        { json: "schemaVersion", js: "schemaVersion", typ: 0 },
        { json: "styles", js: "styles", typ: m(r("StyleValue")) },
        { json: "thumbnailUrl", js: "thumbnailUrl", typ: "" },
        { json: "version", js: "version", typ: "" },
    ], false),
    "ComponentSets": o([
    ], false),
    "Document": o([
        { json: "children", js: "children", typ: a(r("DocumentChild")) },
        { json: "id", js: "id", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "type", js: "type", typ: "" },
    ], false),
    "DocumentChild": o([
        { json: "backgroundColor", js: "backgroundColor", typ: r("Color") },
        { json: "children", js: "children", typ: a(r("PurpleChild")) },
        { json: "flowStartingPoints", js: "flowStartingPoints", typ: a("any") },
        { json: "id", js: "id", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "prototypeDevice", js: "prototypeDevice", typ: r("PrototypeDevice") },
        { json: "prototypeStartNodeID", js: "prototypeStartNodeID", typ: null },
        { json: "type", js: "type", typ: "" },
    ], false),
    "Color": o([
        { json: "a", js: "a", typ: 0 },
        { json: "b", js: "b", typ: 3.14 },
        { json: "g", js: "g", typ: 3.14 },
        { json: "r", js: "r", typ: 3.14 },
    ], false),
    "PurpleChild": o([
        { json: "absoluteBoundingBox", js: "absoluteBoundingBox", typ: r("Absolute") },
        { json: "absoluteRenderBounds", js: "absoluteRenderBounds", typ: r("Absolute") },
        { json: "background", js: "background", typ: a(r("Background")) },
        { json: "backgroundColor", js: "backgroundColor", typ: r("Color") },
        { json: "blendMode", js: "blendMode", typ: "" },
        { json: "children", js: "children", typ: a(r("FluffyChild")) },
        { json: "clipsContent", js: "clipsContent", typ: true },
        { json: "constraints", js: "constraints", typ: r("Constraints") },
        { json: "effects", js: "effects", typ: a("any") },
        { json: "fills", js: "fills", typ: a(r("Background")) },
        { json: "id", js: "id", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "strokeAlign", js: "strokeAlign", typ: "" },
        { json: "strokeWeight", js: "strokeWeight", typ: 0 },
        { json: "strokes", js: "strokes", typ: a("any") },
        { json: "type", js: "type", typ: "" },
    ], false),
    "Absolute": o([
        { json: "height", js: "height", typ: 3.14 },
        { json: "width", js: "width", typ: 3.14 },
        { json: "x", js: "x", typ: 3.14 },
        { json: "y", js: "y", typ: 3.14 },
    ], false),
    "Background": o([
        { json: "blendMode", js: "blendMode", typ: r("BlendMode") },
        { json: "color", js: "color", typ: r("Color") },
        { json: "type", js: "type", typ: r("Type") },
    ], false),
    "FluffyChild": o([
        { json: "absoluteBoundingBox", js: "absoluteBoundingBox", typ: r("Absolute") },
        { json: "absoluteRenderBounds", js: "absoluteRenderBounds", typ: r("Absolute") },
        { json: "background", js: "background", typ: u(undefined, a("any")) },
        { json: "backgroundColor", js: "backgroundColor", typ: u(undefined, r("Color")) },
        { json: "blendMode", js: "blendMode", typ: "" },
        { json: "children", js: "children", typ: u(undefined, a(r("TentacledChild"))) },
        { json: "clipsContent", js: "clipsContent", typ: u(undefined, true) },
        { json: "constraints", js: "constraints", typ: r("Constraints") },
        { json: "effects", js: "effects", typ: a("any") },
        { json: "fills", js: "fills", typ: a(r("Background")) },
        { json: "id", js: "id", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "preserveRatio", js: "preserveRatio", typ: u(undefined, true) },
        { json: "strokeAlign", js: "strokeAlign", typ: "" },
        { json: "strokeWeight", js: "strokeWeight", typ: 0 },
        { json: "strokes", js: "strokes", typ: a("any") },
        { json: "styles", js: "styles", typ: u(undefined, r("Styles")) },
        { json: "type", js: "type", typ: "" },
    ], false),
    "TentacledChild": o([
        { json: "absoluteBoundingBox", js: "absoluteBoundingBox", typ: r("Absolute") },
        { json: "absoluteRenderBounds", js: "absoluteRenderBounds", typ: r("Absolute") },
        { json: "blendMode", js: "blendMode", typ: "" },
        { json: "characterStyleOverrides", js: "characterStyleOverrides", typ: u(undefined, a("any")) },
        { json: "characters", js: "characters", typ: u(undefined, "") },
        { json: "constraints", js: "constraints", typ: r("Constraints") },
        { json: "effects", js: "effects", typ: a("any") },
        { json: "fills", js: "fills", typ: a(r("Background")) },
        { json: "id", js: "id", typ: "" },
        { json: "layoutVersion", js: "layoutVersion", typ: u(undefined, 0) },
        { json: "lineIndentations", js: "lineIndentations", typ: u(undefined, a(0)) },
        { json: "lineTypes", js: "lineTypes", typ: u(undefined, a("")) },
        { json: "name", js: "name", typ: "" },
        { json: "preserveRatio", js: "preserveRatio", typ: u(undefined, true) },
        { json: "strokeAlign", js: "strokeAlign", typ: "" },
        { json: "strokeWeight", js: "strokeWeight", typ: 0 },
        { json: "strokes", js: "strokes", typ: a("any") },
        { json: "style", js: "style", typ: u(undefined, r("ChildStyle")) },
        { json: "styleOverrideTable", js: "styleOverrideTable", typ: u(undefined, r("ComponentSets")) },
        { json: "styles", js: "styles", typ: r("Styles") },
        { json: "type", js: "type", typ: "" },
    ], false),
    "Constraints": o([
        { json: "horizontal", js: "horizontal", typ: r("Horizontal") },
        { json: "vertical", js: "vertical", typ: r("Vertical") },
    ], false),
    "ChildStyle": o([
        { json: "fontFamily", js: "fontFamily", typ: "" },
        { json: "fontPostScriptName", js: "fontPostScriptName", typ: u(null, "") },
        { json: "fontSize", js: "fontSize", typ: 0 },
        { json: "fontWeight", js: "fontWeight", typ: 0 },
        { json: "letterSpacing", js: "letterSpacing", typ: 0 },
        { json: "lineHeightPercent", js: "lineHeightPercent", typ: 0 },
        { json: "lineHeightPx", js: "lineHeightPx", typ: 3.14 },
        { json: "lineHeightUnit", js: "lineHeightUnit", typ: "" },
        { json: "textAlignHorizontal", js: "textAlignHorizontal", typ: r("Horizontal") },
        { json: "textAlignVertical", js: "textAlignVertical", typ: r("Vertical") },
        { json: "textAutoResize", js: "textAutoResize", typ: "" },
    ], false),
    "Styles": o([
        { json: "fill", js: "fill", typ: "" },
    ], false),
    "PrototypeDevice": o([
        { json: "rotation", js: "rotation", typ: "" },
        { json: "type", js: "type", typ: "" },
    ], false),
    "StyleValue": o([
        { json: "description", js: "description", typ: "" },
        { json: "key", js: "key", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "styleType", js: "styleType", typ: "" },
    ], false),
    "BlendMode": [
        "NORMAL",
    ],
    "Type": [
        "SOLID",
    ],
    "Horizontal": [
        "LEFT",
    ],
    "Vertical": [
        "TOP",
    ],
};

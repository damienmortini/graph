export default {
    inputTypeMap: {
        "text": "input-text",
        "color": "input-color",
        "number": "input-number",
        "range": "input-range",
    },
    typeResolvers: {
        "text": (value) => typeof value === "string",
        "range": (value) => typeof value === "number",
        "color": (value) => {
            return typeof value === "string" && ((value.length === 7 && value.startsWith("#")) || value.startsWith("rgb") || value.startsWith("hsl")) || (typeof value === "object" && value.r !== undefined && value.g !== undefined && value.b !== undefined);
        },
    },
};

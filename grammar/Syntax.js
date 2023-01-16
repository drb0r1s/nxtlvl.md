const Syntax = {
    headings: [
        { pattern: /^#{1,6}\s+(?=.*<br>$)/gm, end: "eol" }
    ],
    
    bold: { tag: "b", pattern: /\*\*/gm },
    italic: { tag: "i", pattern: /\*/gm }
};

export default Syntax;
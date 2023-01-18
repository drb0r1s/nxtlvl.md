const Syntax = {
    oneLine: [
        { tag: "h", pattern: /^#{1,6}\s+(?=.*<br>$)/gm },
        { tag: "blockquote", pattern: /^>\s+(?=.*<br>$)/gm }
    ],
    
    upperLine: [
        { tag: "h1", pattern: /.*(?=\n^={1,})/gm },
        { tag: "h2", pattern: /.*(?=\n^-{1,})/gm },
    ],
    
    classic: [
        { tag: "b", pattern: /\*\*/gm },
        { tag: "b", pattern: /__/gm },
        { tag: "i", pattern: /\*/gm },
        { tag: "i", pattern: /_/gm }
    ]
};

export default Syntax;
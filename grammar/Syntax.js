const Syntax = {
    oneLine: [
        { tag: "h1", md: "#" },
        { tag: "h2", md: "##" },
        { tag: "h3", md: "###" },
        { tag: "h4", md: "####" },
        { tag: "h5", md: "#####" },
        { tag: "h6", md: "######" }
    ],

    multipleLines: [
        { tag: "blockquote", md: ">" }
    ],
    
    upperLine: [
        { tag: "h1", md: "=" },
        { tag: "h2", md: "-" },
        // NXTLVL:
        { tag: "h3", md: "_" },
        { tag: "h4", md: "\\+" },
        { tag: "h5", md: "\\*" },
        { tag: "h6", md: "\\." }
    ],
    
    classic: [
        { tag: "b", md: "\\*\\*" },
        { tag: "b", md: "__" },
        { tag: "i", md: "\\*" },
        { tag: "i", md: "_" }
    ]
};

export const SyntaxPatterns = {
    list: {
        oneLine: "^{md}\\s+|(?<=^{md}\\s+.+)<br>\\n",
        upperLine: ".+(?=<br>\\n^{md}{1,}<br>)",
        classic: "{md}(?=.+{md})(?!(\\s+)?{md})|(?<={md}.+)(?<!{md}(\\s+)?){md}"
    },

    match: (content, symbolGroup, symbol) => {
        const pattern = SyntaxPatterns.getPattern(symbolGroup, symbol);
        const regex = new RegExp(pattern, "gm");

        const advancedMatches = [...content.matchAll(regex)];

        const matches = [];
        advancedMatches.forEach(advancedMatch => matches.push({ md: advancedMatch[0], position: advancedMatch.index }));

        return matches;
    },

    getPattern: (symbolGroup, symbol) => {
        let pattern = "";
        Object.keys(SyntaxPatterns.list).forEach((key, index) => { if(symbolGroup === key) pattern = Object.values(SyntaxPatterns.list)[index] });

        pattern = pattern.replace(/{md}/g, symbol.md);
        return pattern;
    }
};

export default Syntax;
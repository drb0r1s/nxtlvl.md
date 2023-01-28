const Syntax = {
    oneLine: [
        { tag: "h1", md: "#" },
        { tag: "h2", md: "##" },
        { tag: "h3", md: "###" },
        { tag: "h4", md: "####" },
        { tag: "h5", md: "#####" },
        { tag: "h6", md: "######" },
    ],

    multipleLines: [
        { tag: "blockquote", md: ">" },
        // NXTLVL:
        { tag: "b", md: "\\*\\*" },
        { tag: "i", md: "\\*" }
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

    //listing: [],
    
    classic: [
        { tag: "b", md: "\\*\\*" },
        { tag: "b", md: "__" },
        { tag: "i", md: "\\*" },
        { tag: "i", md: "_" }
    ]
};

export const SyntaxPatterns = {
    list: {
        oneLine: "((?<=^>(\\s+)?)#{1,6}|^{md})\\s+|(?<=(^>(\\s+)?#{1,6}|^{md})\\s+.+)<br>\\n",
        multipleLines: "(?!^{md}\\s+<br>)(^>(?=<h\\d>)|^{md}(?=\\s+))\s*.+|^\\({md}(\\s+)?<br>|^{md}\\)(\\s+)?<br>",
        upperLine: ".+(?=<br>\\n^{md}+<br>)",
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
    },

    getSyntax(params) {
        const { group, tag, md } = params;
        const target = { group: [], search: [] };

        if(group) Object.keys(Syntax).forEach((key, index) => {
            if(group === key) target.group = Object.values(Syntax)[index];
        });

        if(group && target.group.length === 0) return;
        const groupParam = target.group.length !== 0;

        if(groupParam) search(target.group);
        else Object.values(Syntax).forEach(syntaxObjects => search(syntaxObjects));

        const result = [];

        target.search.forEach(s => {
            let newS = {};
            const removeBackslash = /\\+/g;

            newS = {...s, md: s.md.replace(removeBackslash, "")};
            result.push(newS);
        });

        if(result.length === 1) return result[0];
        return result;

        function search(syntaxObjects) {
            syntaxObjects.forEach(syntaxObject => {
                const results = [];

                const removeBackslash = /\\+/g;
                const clearMd = syntaxObject.md.replace(removeBackslash, "");
                
                switch(true) {
                    case typeof tag === "string" && typeof md === "string":
                        if(syntaxObject.tag === tag && clearMd === md) results.push(syntaxObject);
                        break;
                    case typeof tag === "string":
                        if(syntaxObject.tag === tag) results.push(syntaxObject);
                        break;
                    case typeof md === "string":
                        if(clearMd === md) results.push(syntaxObject);
                        break;
                    default: results.push(syntaxObject);
                }

                if(results.length > 0) target.search.push(...results);
            });
        }
    }
};

export default Syntax;
import Escape from "../functions/Escape.js";
import Match from "../functions/Match.js";

const Syntax = {
    groups: {
        oneLine: [
            { tag: "h1", md: "#" },
            { tag: "h2", md: "##" },
            { tag: "h3", md: "###" },
            { tag: "h4", md: "####" },
            { tag: "h5", md: "#####" },
            { tag: "h6", md: "######" },
            { tag: "pre", md: "@" }
        ],
        
        upperLine: [
            { tag: "h1", md: "=" },
            { tag: "h2", md: "-" },
            // NXTLVL:
            { tag: "h3", md: "_" },
            { tag: "h4", md: "+" },
            { tag: "h5", md: "*" },
            { tag: "h6", md: "." }
        ],
        
        classic: [
            { tag: "b", md: "**" },
            { tag: "b", md: "__" },
            { tag: "i", md: "*" },
            { tag: "i", md: "_" },
            // NXTLVL:
            { tag: "span", md: "%" }
        ],

        multipleLines: [
            { tag: "blockquote", md: ">" },
            // NXTLVL:
            { tag: "details", md: "((?<=\\()<(?=<br>)|<(?=\\)<br>)|<(?=\\s))", regex: true },
            // ----------
            { tag: "ol", md: "\\s*[0-9]+\\.(\\s+|(?=\\)?<br>))", regex: true },
            { tag: "ul", md: "\\s*[*+-](\\s+|(?=\\)?<br>))", regex: true }
        ]
    },

    patterns: {
        oneLine: "((?<=^([<>\\s]+)?(>\\s*|<\\s+)){md}|^{md})(?!\\s*(<br>|$))\\s+.+(<br>|$)",
        multipleLines: "((?<=^<(blockquote|details|summary|ol|ul).+\">){md}|(?<=^[<>\\s]*){md}).+|^\\({md}<br>|^{md}\\)<br>",
        upperLine: "[^<>\\s].+<br>(?=\\n(^(>\\s*|<\\s+)|^){md}+(<br>|$))",
        classic: "(?<!<(b|i)\\sclass=\"nxtlvl\\sclassic\\s(b|i)\\s)({md}(?=.+{md})(?!\\s*{md}))(?!\">)|(?<!<(b|i)\\sclass=\"nxtlvl\\sclassic\\s(b|i)\\s)((?<={md}.+)(?<!{md}\\s*){md})(?!\">)",
        
        get: (params = {}) => {
            const { group, tag, md } = params;
            const target = { patterns: {}, results: {} };

            Object.keys(Syntax.patterns).forEach((key, index) => {
                const pattern = Object.values(Syntax.patterns)[index];
                if(typeof pattern !== "string") return;
                
                if(group && (group === key)) target.patterns = { [group]: pattern };
                else if(!group) target.patterns = {...target.patterns, [key]: pattern};
            });

            Object.keys(target.patterns).forEach((key, index) => {
                const pattern = Object.values(target.patterns)[index];
                const symbols = Syntax.search({ group: key, tag, md });

                if(symbols.length === 0) return;

                const patterns = [];

                symbols.forEach(symbol => {
                    let parsedPattern = pattern;
                    parsedPattern = parsedPattern.replace(/{md}/g, symbol.regex ? symbol.md : Escape.regex(symbol.md));

                    patterns.push(parsedPattern);
                });

                target.results = {...target.results, [key]: patterns};
            });

            return target.results;
        }
    },

    match: (content, symbol, pattern) => {
        const matches = [];
        const regex = new RegExp(pattern, "gm");

        const advancedMatches = Match.all(content, regex);
        advancedMatches.forEach(advancedMatch => matches.push({...symbol, md: advancedMatch.content, positions: advancedMatch.positions}));

        return matches;
    },

    search: (params = {}) => {
        const { group, tag, md } = params;
        const target = { group: [], search: [] };

        if(group) Object.keys(Syntax.groups).forEach((key, index) => {
            if(group === key) target.group = Object.values(Syntax.groups)[index];
        });

        if(group && target.group.length === 0) return;
        const groupParam = target.group.length !== 0;

        if(groupParam) search(target.group);
        else Object.values(Syntax.groups).forEach(symbols => search(symbols));

        return target.search;

        function search(symbols) {
            symbols.forEach(symbol => {
                const results = [];

                const removeBackslash = /\\+/g;
                const clearMd = symbol.regex ? symbol.md : symbol.md.replace(removeBackslash, "");
                
                switch(true) {
                    case typeof tag === "string" && typeof md === "string":
                        if(symbol.tag === tag && clearMd === md) results.push(symbol);
                        break;
                    case typeof tag === "string":
                        if(symbol.tag === tag) results.push(symbol);
                        break;
                    case typeof md === "string":
                        if(clearMd === md) results.push(symbol);
                        break;
                    default: results.push(symbol);
                }

                if(results.length > 0) target.search.push(...results);
            });
        }
    }
};

export default Syntax;
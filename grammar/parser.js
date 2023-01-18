import Syntax from "./Syntax.js";

export default function parser(content) {
    let parsedContent = content;
    whitespacesConfig();

    Object.keys(Syntax).forEach((key, index) => {
        const symbols = Object.values(Syntax)[index];

        if(Array.isArray(symbols)) symbols.forEach(symbol => parseSymbols(key, symbol));
        else if(typeof symbols === "object") parseSymbols(key, symbols);
    });

    parsedContent = parsedContent.replaceAll("<br>\n", "<br>");
    
    return parsedContent;

    function whitespacesConfig() {
        parsedContent = parsedContent.replaceAll("\n", "<br>\n");

        const regex = {
            firstLine: /^<br>\n/,
            whitespaces: /^(\s+|\t)/gm
        };

        Object.values(regex).forEach(r => { parsedContent = parsedContent.replace(r, "") });
    }

    function parseSymbols(symbolsGroup, symbol) {
        const matches = parsedContent.match(symbol.pattern);
        const advancedMatches = [...parsedContent.matchAll(symbol.pattern)];
            
        switch(symbolsGroup) {
            case "headings":
                matches.forEach(match => { parsedContent = parsedContent.replace(match, `<h${match.trim().length}>`) });

                if(symbol.end === "eol") {
                    const headingsRegex = {
                        start: [...parsedContent.matchAll(/^<h[1-6]>/gm)],
                        end: [...parsedContent.matchAll(/(?<=^<h[1-6]>.*)<br>/gm)]
                    };
                        
                    let headingsEnd = {};

                    headingsRegex.start.forEach((startSymbol, index) => {
                        const heading = startSymbol[0].substring(1, startSymbol[0].length - 1);
                        headingsEnd = {...headingsEnd, [heading]: headingsRegex.end[index].index};
                    });

                    let addingDifference = 0;

                    Object.keys(headingsEnd).forEach((heading, index) => {
                        const position = Object.values(headingsEnd)[index] + addingDifference;
                        parsedContent = parsedContent.substring(0, position) + `</${heading}>` + parsedContent.substring(position);

                        addingDifference += `</${heading}>`.length;
                    });
                }

                break;
            case "bold":
            case "italic":
                const validMatches = blockNoContentSymbols();
                if(validMatches.length === 0) return;

                validMatches.length % 2 === 0 ? validMatches : validMatches.pop();

                let addingDifference = 0;
            
                validMatches.forEach((match, index) => {
                    const position = match.index + addingDifference;
                    const tag = `<${index % 2 === 0 ? "" : "/"}${symbol.tag}>`;
                    
                    parsedContent = parsedContent.substring(0, position) + tag + parsedContent.substring(position);
                    addingDifference += tag.length;
                });

                let removingDifference = 0;

                break;
            default: ;
        }

        function blockNoContentSymbols() {
            const targetSymbol = advancedMatches[0] ? advancedMatches[0][0] : "";
            if(!targetSymbol) return [];

            const multicharacterAddition = targetSymbol.length - 1;

            const indexes = { all: [], valid: [], blocked: [] };

            advancedMatches.forEach((advancedMatch, index) => {
                const multicharacter = advancedMatch.index + (index % 2 === 0 ? multicharacterAddition : 0);
                indexes.all.push({ real: advancedMatch.index, multicharacter });
            });

            let prevMatch = true;

            indexes.all.forEach((index, i) => {
                const nextIndex = indexes.all[i + 1];
                    
                if(!nextIndex) return;
                if(index.multicharacter + 1 === nextIndex.multicharacter) indexes.blocked.push(index.real, nextIndex.real);

                if((i % 2 === 0) || !prevMatch) {
                    let mdString = "";
                    for(let i = index.real + targetSymbol.length; i < nextIndex.real; i++) mdString += parsedContent[i];
                    mdString = mdString.replaceAll("<br>", "");

                    if(!mdString.trim()) {
                        indexes.blocked.push(index.real);
                        prevMatch = false;
                    }

                    else prevMatch = true;
                }
            });

            indexes.all.forEach(index => {
                if(indexes.blocked.indexOf(index.real) > -1) return;
                indexes.valid.push(index.real);
            });

            const validMatches = [];

            advancedMatches.forEach(advancedMatch => {
                if(indexes.valid.indexOf(advancedMatch.index) === -1) return;
                validMatches.push(advancedMatch);
            });

            return validMatches;
        }
    }
}
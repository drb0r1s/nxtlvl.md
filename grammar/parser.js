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
                const targetSymbol = advancedMatches[0][0];
                const multicharacterAddition = targetSymbol.length - 1;

                const indexes = [];
                advancedMatches.forEach((advancedMatch, index) => indexes.push(advancedMatch.index + (index % 2 === 0 ? 0 : multicharacterAddition)));
            
                matches.length % 2 === 0 ? matches : matches.pop();
                matches.forEach((match, index) => { parsedContent = parsedContent.replace(match, `<${index % 2 === 0 ? "" : "/"}${symbol.tag}>`) });

                break;
            default: ;
        }
    }
}
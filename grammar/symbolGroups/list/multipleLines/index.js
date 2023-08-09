import Syntax from "../../../Syntax.js";
import getPairFunctions from "./getPairFunctions/index.js";
import Remove from "./Remove.js";

export default function multipleLines({ content, symbol, matches }) {
    let parsedContent = content;

    const pairFunctions = getPairFunctions({ content: parsedContent, symbol });
    const pairs = { classic: [], special: [], formatted: [] };

    let addingDifference = 0;

    if(symbol.tag === "blockquote" || symbol.tag === "details") init("repeat");
    else init("default");

    return parsedContent;

    function init(type) {
        if(type === "repeat") {
            let currentMatches = matches;
            let i = 0;

            while(currentMatches.length > 0) {
                resetPairs();
                setPairs(pairs, currentMatches);

                if(symbol.tag === "blockquote") parsedContent = Remove.md(parsedContent, symbol);
                if(!i) parsedContent = Remove.fakeMd(parsedContent, symbol);

                i++;
                addingDifference = 0;

                currentMatches = getMatches();
            }

            parsedContent = Remove.lastBr(parsedContent);
        }

        else {
            setPairs(pairs, matches);

            parsedContent = Remove.md(parsedContent, symbol);
            parsedContent = Remove.lastBr(parsedContent);
        }

        function setPairs(pairsCopy, matches) {
            pairFunctions.forEach(f => {
                const { newPairs, newContent, newAddingDifference } = f({ pairs: pairsCopy, matches, content: parsedContent, addingDifference });
                
                pairs.classic = newPairs.classic;
                pairs.special = newPairs.special;
                pairs.formatted = newPairs.formatted;

                if(newContent) parsedContent = newContent;
                if(newAddingDifference) addingDifference = newAddingDifference;
            });
        }

        function resetPairs() {
            pairs.classic = [];
            pairs.special = [];
            pairs.formatted = [];
        }

        function getMatches() {
            const { multipleLines } = Syntax.patterns.get({ group: "multipleLines", md: symbol.md });
            const [pattern] = multipleLines;
            
            const noSpecialMdPattern = pattern.split("|^\\(")[0];
            const matches = Syntax.match(parsedContent, symbol, noSpecialMdPattern);

            const newMatches = symbol.tag === "details" ? [] : matches;

            if(symbol.tag === "details") matches.forEach(match => {
                if(match.md.endsWith("</summary></details>")) newMatches.push(Remove.details(match));
                else newMatches.push(match);
            });

            return newMatches;
        }
    }
}
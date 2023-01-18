export default function classic(content, symbol) {
    let parsedContent = content;
    
    const advancedMatches = [...parsedContent.matchAll(symbol.pattern)] || [];
    
    const validMatches = blockNoContentSymbols();
    if(validMatches.length === 0) return parsedContent;

    validMatches.length % 2 === 0 ? validMatches : validMatches.pop();

    let addingDifference = 0;

    validMatches.forEach((match, index) => {
        const position = match.index + addingDifference;
        const tag = `<${index % 2 === 0 ? "" : "/"}${symbol.tag}>`;
        
        parsedContent = parsedContent.substring(0, position) + tag + parsedContent.substring(position);
        addingDifference += tag.length;
    });

    parsedContent = parsedContent.replaceAll(`<${symbol.tag}>${validMatches[0][0]}`, `<${symbol.tag}>`);
    parsedContent = parsedContent.replaceAll(`</${symbol.tag}>${validMatches[0][0]}`, `</${symbol.tag}>`);

    return parsedContent;

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
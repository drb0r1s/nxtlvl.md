import Syntax from "../Syntax.js";
import generateTags from "../../functions/generateTags.js";

import oneLine from "./list/oneLine.js";
import multipleLines from "./list/multipleLines.js";
import upperLine from "./list/upperLine.js";
import classic from "./list/classic.js";

export default function parseSymbolGroups(content) {
    const groups = { oneLine, multipleLines, upperLine, classic };

    let parsedContent = content;
    const tagMap = [];

    Object.keys(groups).forEach((key, index) => {
        const patternsObject = Syntax.patterns.get({ group: key });
        const patterns = Object.values(patternsObject)[0];

        const symbols = Syntax.search({ group: key });

        patterns.forEach((pattern, i) => {
            const regex = new RegExp(pattern, "gm");
            if(!regex.test(parsedContent)) return;

            const parseGroup = Object.values(groups)[index];
            
            const symbol = {...symbols[i], group: key};
            const matches = Syntax.match(parsedContent, symbol, pattern);
            
            parsedContent = parseGroup({
                content: parsedContent,
                symbol,
                pattern: new RegExp(pattern, "gm"),
                matches,
                tags: generateTags(symbol)
            });

            console.log(matches)
        });
    });

    return parsedContent;
}
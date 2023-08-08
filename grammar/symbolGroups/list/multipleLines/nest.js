export default function nest(pairs) {
    const nestedPairs = [];
    const blockedPairs = [];

    pairs.forEach((pair, index) => {
        if(isBlocked(pair)) return;
        nestedPairs.push({...pair, ...getInnerPairs(index)});
    });

    return nestedPairs;

    function getInnerPairs(index) {
        const innerPairs = { inner: [] };

        const currentPair = pairs[index];
        let nextIndex = 1;

        while(nextIndex !== 0) {
            const nextPair = pairs[index + nextIndex];

            if(nextPair && (currentPair.end > nextPair.start)) {
                if(!isBlocked(nextPair)) innerPairs.inner.push({...nextPair, ...getInnerPairs(index + nextIndex)});
                nextIndex++;
            }

            else nextIndex = 0;
        }

        blockedPairs.push(...innerPairs.inner);

        if(innerPairs.inner.length === 0) return {};
        return innerPairs;
    }

    function isBlocked(pair) {
        let result = false;
        blockedPairs.forEach(block => { if(pair.start === block.start && pair.end === block.end) result = true });

        return result;
    }
}
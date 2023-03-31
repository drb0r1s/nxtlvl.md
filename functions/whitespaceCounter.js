export default function whitespaceCounter(string) {
    let status = true;
    let counter = 0;

    while(status) {
        if(string[counter] === " ") counter++;
        else status = false;
    }

    return counter;
}
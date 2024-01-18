export default function getEmptyBoard() {
    return [...Array(3)].map(() => [...Array(3)].map(() => null));
}

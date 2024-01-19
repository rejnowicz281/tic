import uniqid from "uniqid";

export default function generatePlayerObject(name, sign, ai = false) {
    return {
        id: uniqid(),
        name,
        sign,
        ai,
    };
}

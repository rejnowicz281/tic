// return player based on sign

export default function getPlayer(sign, player1, player2) {
    return sign === player1.sign ? player1 : sign === player2.sign ? player2 : null;
}

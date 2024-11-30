import {suit, value, Card, Deck, Contract, Player, Board, Game} from "./classes.js"


let default_cardpath = "/images/cards/"

let valtopngstr = (value) => {
    switch (value) {
        case 2:
          return "2"
        case 3:
          return "3"
        case 4:
          return "4"
        case 5:
          return "5"
        case 6:
          return "6"
        case 7:
          return "7"
        case 8:
          return "8"
        case 9:
          return "9"
        case 10:
          return "10"
        case 11:
          return "J"
        case 12:
          return "A"
        case 13:
          return "K"
        case 14:
          return "A"
        default:
            return "A"
    }
}

let suittopngstr = (suit) => {
    switch (suit) {
        case 0:
            return "S"
        case 1:
            return "H"
        case 2:
            return "D"
        case 3:
            return "C"
        default:
            return "NA"
    }
}

let getCardPath = (card) => {
    return default_cardpath + valtopngstr(card.value) + suittopngstr(card.suit) + ".png";
}

export {getCardPath}
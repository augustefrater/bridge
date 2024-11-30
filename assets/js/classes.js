
const suit = {
    spade: 0,
    hearts: 1,
    diamond: 2,
    clubs: 3,
    na : 4,
}

const value = {
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    jack: 11,
    queen: 12,
    king: 13,
    ace: 14
}

class Card {
    constructor(suit = suit.na, value = suit.ace) {
        this.suit = suit
        this.value = value
    }
    static isBigger(self, other) {
        if (self.suit == other.suit) {
            return self.value > other.value ? 1 : -1
        }
        return self.suit > other.suit ? 1 : -1
    }
}

class Deck {
    constructor(players = []) {
        this.cards = Deck.generateDeck()
        this.players = players
    }
    static generateDeck() {
        let cards = []
        for (let s = 0; s < 4; s++) {
            for (let v  = 2; v < 15; v++) {
                cards.push(new Card(s, v))
            }
        }
        return cards
    }
    static randomizeDeck(deck) {
        deck.cards.sort(() => Math.random() - 0.5)
    }
    deal(room) {
        if (this.players.length == 4) {
            let p = 0;
            for (let i = 0; i < 52 ; i++) {
                p %= 4 
                room.push("player:getcard", {player: this.players.at(p).name, card: this.cards.at(i)})
                p ++
            }
        }
    }
}

class Contract {
    constructor(suit = 4, value = 1) {
        this.suit = suit
        this.value = value
        this.tricks_made = []
    }
    addTrick(newtrick) {
        this.tricks_made.push(newtrick)
    }
    isCompleted() {
        return this.tricks_made.length > this.value + 6
    }
}

class Player {
    constructor(pos, name) {
        this.CardinalPos = pos
        this.name = name
        this.contract = new Contract()
        this.hand = []
        this.score = 0
        this.bid = 0
        this.teamMate
    }
    makeContract(suit, value) {
        this.contract = new Contract(suit, value)
    }
    setTeamMate(player) {
        this.teamMate = player
    }
    playHand(cardIndex, room) {
    }
    playDummy(cardIndex) {
        //to do
    }
    getCard(newCard) {
        this.hand.push(newCard)
    }
    sortHand() {
        this.hand.sort(Card.isBigger)
    }
}

class Board {
    constructor(startingPlayer, suit) {
        this.startingPlayer = startingPlayer
        this.suit = suit
        this.trick = []
        this.turn = ""
    }
    trickWinner() {
        let winner = 0
        let current = 0
        if (this.trick.length != 4) {
            return -1
        }
        for (let i = 0; i < 4; i++) {
            if ((this.trick.at(winner).suit != this.suit && this.trick.at(winner).value < this.trick.at(i).value) ||
                (this.trick.at(winner).suit != this.suit && this.trick.at(i).suit == this.suit) ||
                (this.trick.at(winner).suit == this.suit && this.trick.at(i).suit == this.suit && this.trick.at(winner).value < this.trick.at(i).value)) {
                    winner = current
                }
            current ++
        }
        return winner
    }
}

class Game {
    constructor () {
        this.players = []
        this.Board = new Board(0, suit.na)
    }
    connect(player) {
        if (this.players.length < 4) {
            this.players.push(player)
        }
    }
    makePairs() {
        if (this.players.length == 4) {
            this.players.at(0).setTeamMate(this.players.at(2))
            this.players.at(1).setTeamMate(this.players.at(3))
            this.players.at(2).setTeamMate(this.players.at(0))
            this.players.at(3).setTeamMate(this.players.at(3))
        }
    }
    static startGame(players, game) {
        for(let i = 0; i < 4; i++) {
            game.connect(players.at(i))
        }
        game.makePairs()
    }
    gameLoop() {
        //to do
    }
}

export {suit, value, Card, Deck, Contract, Player, Board, Game}
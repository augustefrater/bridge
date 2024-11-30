// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
import "./user_socket.js"

// You can include dependencies in two ways.
//
// The simplest option is to put them in assets/vendor and
// import them using relative paths:
//
//     import "../vendor/some-package.js"
//
// Alternatively, you can `npm install some-package --prefix assets` and import
// them using a path starting with the package name:
//
//     import "some-package"
//

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html"
// Establish Phoenix Socket and LiveView configuration.
import {Socket, Presence} from "phoenix"
import {LiveSocket} from "phoenix_live_view"
import topbar from "../vendor/topbar"
import {suit, value, Card, Deck, Contract, Player, Board, Game} from "./classes.js"

import board_html from `../../lib/bridge_web/controllers/page_html/board.txt`
import { getCardPath } from "./displayCards.js"

let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content")
let liveSocket = new LiveSocket("/live", Socket, {
  longPollFallbackMs: 2500,
  params: {_csrf_token: csrfToken}
})

let user = document.getElementById("user").innerText
let socket = new Socket("/socket", {params: {user: user}})
socket.connect()

let presences = {}
let players = []
let game = new Game()

let formatedTimestamp = (Ts) => {
  let date = new Date(Ts)
  return date
}

let listBy = (user, {metas : metas}) => {
  return {
    user: user,
    onlineAt : formatedTimestamp(metas[0].online_at)
  }
}

let gameLoop = (game) => {
  if (players.at(0).name == user) {
    let deck = new Deck(players)
    Deck.randomizeDeck(deck)
    deck.deal(room)
    room.push("board:setturn", {turn: players.at(0).name})
  } else {
    console.log("not host")
  }
}

let userList = document.getElementById("userList")
let render = (presences) => {
  var list = Presence.list(presences, listBy)
  list.sort((a, b) => a.onlineAt.getTime() - b.onlineAt.getTime())
  if (list.length >= 4) {
    document.getElementById("whole_page").innerHTML = board_html
    list.map(presence => newPlayer(presence.user))
    Game.startGame(players, game)
    renderPlayers(players)
    gameLoop(game)
  }
  else {
    userList.innerHTML = list.map(
      presence =>`
        <li>
          ${presence.user}
          <br/>
          <small>online since ${presence.onlineAt}</small>
        </li>
    `).join("")
  }
}

let room = socket.channel("room:lobby")
room.on("presence_state", state => {
  presences = Presence.syncState(presences, state)
  render(presences)
})

room.on("presence_diff", diff => {
  presences = Presence.syncDiff(presences, diff)
  render(presences)
})

room.join("")

let messageInput = document.getElementById("newMessage")
messageInput.addEventListener("keypress", (e) => {
  if (e.key == "Enter" && messageInput.value != "") {
    room.push("message:new", messageInput.value)
    messageInput.value = ""
  }
})

let messagelist = document.getElementById("messageList")
let renderMessage = (message) => {
  let messageElement = document.createElement("li")
  messageElement.innerHTML = `
  <b>${message.user}</b>
  <i>${formatedTimestamp(message.timestamp)}</i>
  <p>${message.body}</p>`

  messagelist.appendChild(messageElement)
  messagelist.scrollTop = messagelist.scrollHeight;
}

let newPlayer = (name) => {
  if (players.length < 4) {
    let newPlayer = new Player(players.length, name)
    // for (let i = 2; i < 15; i++) {
    //   newPlayer.getCard(new Card(0, i))
    // }
    players.push(newPlayer)
  }
}

// let suitString = (suit) => {
//   switch (suit) {
//     case 0:
//       return "spade"
//     case 1:
//       return "hearts"
//     case 2:
//       return "diamond"
//     case 3:
//       return "clubs"
//     default:
//       return "na"
//   }
// }

// let valueString = (val) => {
//   switch (val) {
//     case 2:
//       return "two"
//     case 3:
//       return "three"
//     case 4:
//       return "four"
//     case 5:
//       return "five"
//     case 6:
//       return "six"
//     case 7:
//       return "seven"
//     case 8:
//       return "eight"
//     case 9:
//       return "nine"
//     case 10:
//       return "ten"
//     case 11:
//       return "jack"
//     case 12:
//       return "queen"
//     case 13:
//       return "king"
//     case 14:
//       return "ace"
//     default:
//       return "error"
//   }
// }

let renderPlayers = (players) => {
  userpos = players.findIndex((element) => element.name == user)
  if (userpos == -1) {
    return;
  }
  let userHand = document.getElementById("user_hand")
  let oppositecards = document.getElementById("player_opposite")
  let leftCards = document.getElementById("player_left")
  let RightCards = document.getElementById("player_right")
  let trickCards = document.getElementById("trick")
  let turn = document.getElementById("turn")
  let cardInput = document.getElementById("input_number")
  cardInput.addEventListener("keypress", (e) => {
    let userpos = players.findIndex((element) => element.name == user)
    if (e.key == "Enter" && cardInput.value != "" && cardInput.value > 0 && cardInput.value <= players.at(userpos).hand.length + 1) {
      room.push("player:playCard", {player: players.at(userpos).name, index: cardInput.value - 1})
      cardInput.value = ""
    }
  })
  userHand.innerHTML = players.at(userpos).hand.map(card => `
    <button phx-click="player:playCard" phx-value-player="${players.at(userpos).name}" phx-value-card="${card}">
    <img src="${getCardPath(card)}" style="width: 64px; height: 89px;">
    </button>
    `
  ).join("")
  oppositecards.innerHTML = players.at((userpos + 2) % 4).hand.map(card => `
    <img src="${getCardPath(card)}" style="width: 64px; height: 89px;">
    `
  ).join("")
  leftCards.innerHTML = players.at((userpos + 1) % 4).hand.map((card, index) => `
    <img src="/images/cards/red_back.png" style="width: 68px; height: 89px; transform: rotate(90deg); vertical-align: bottom;">
    `
  ).join("")
  RightCards.innerHTML = players.at((userpos + 3) % 4).hand.map((card, index) => `
    <img src="/images/cards/red_back.png" style="width: 64px; height: 89px; transform: rotate(270deg);">
    `
  ).join("")
  trickCards.innerHTML = game.Board.trick.map(card => `
    <img src="${getCardPath(card)}" style="width: 64px; height: 89px;">
    `
  ).join("")
  turn.innerText = `turn: ${game.Board.turn}`
}

let handle_trick_win = () => {
  console.log("win detected")
  let winner = game.Board.trickWinner()
  let other = (winner + 2) % 4
  room.push("board:clear")
  room.push("player:setscore", {player: players.at(winner).name, score: players.at(winner).score + 1})
  room.push("player:setscore", {player: players.at(other).name, score: players.at(other).score + 1})
  room.push("board:setturn", {turn: players.at(winner).name})  
}

room.on("message:new", message => renderMessage(message))
room.on("player:getcard", message => {
    let target_player = players.find((element) => message.body.player == element.name)   
    target_player.getCard(message.body.card)
    target_player.sortHand()
    renderPlayers(players)
  }
)
room.on("player:playCard", message => {
  if (players.at(0).name == user) {
    if (message.body.player == game.Board.turn) {
      room.push("server:playCard", {player: message.body.player, index: message.body.index})
      room.push("board:setturn", {turn:  players.at((players.findIndex((element) => element.name == game.Board.turn) + 1) % 4).name})
    }
  }
  renderPlayers(players)
})
room.on("server:playCard", message => {
  let target_player = players.find((element) => message.body.player == element.name)
  let card = target_player.hand.splice(message.body.index, 1).at(0)
  if (players.at(0).name == user && game.Board.trick.length == 0) {
      room.push("board:setsuit", {suit: card.suit})
    }
    game.Board.trick.push(card)
    if (players.at(0).name == user && game.Board.trick.length == 4) {
      handle_trick_win()
    }
    renderPlayers(players)
  }
)
room.on("player:setscore", message => {
  let target_player = players.find((element) => message.body.player == element.name)
  target_player.score = message.body.score
  renderPlayers(players)
})
room.on("board:setturn", message => {
  game.Board.turn = message.body.turn
  renderPlayers(players)
})
room.on("board:setsuit", message => {
  game.Board.suit = message.body.suit
})
room.on("board:clear", _message => {
  for (let i = 0; i < 4; i++) {
    game.Board.trick.pop()
  }
  renderPlayers(players)
})
// Show progress bar on live navigation and form submits
topbar.config({barColors: {0: "#29d"}, shadowColor: "rgba(0, 0, 0, .3)"})
window.addEventListener("phx:page-loading-start", _info => topbar.show(300))
window.addEventListener("phx:page-loading-stop", _info => topbar.hide())

// connect if there are any LiveViews on the page
liveSocket.connect()

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket


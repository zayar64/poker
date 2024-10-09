var RANKS = [];
var RANK_NAMES = {};
for (let i = 2; i <= 14; i++) {
    RANKS.push(i);
    RANK_NAMES[i] = String(i);
}

RANK_NAMES[11] = "JACK";
RANK_NAMES[12] = "QUEEN";
RANK_NAMES[13] = "KING";
RANK_NAMES[14] = "ACE";

const SUITS = ["SPADE", "CLUB", "HEART", "DIAMOND"];

var DECK = [];
RANKS.forEach(rank => {
    SUITS.forEach(suit => {
        let card = { rank: rank, suit: suit };
        DECK.push(card);
    });
});

function copyDeck(deck) {
    let newDeck = [];
    deck.forEach(card => newDeck.push(card));
    return newDeck;
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function drawCard(deck) {
    return shuffleDeck(deck).pop();
}

function holdCard(card) {
    if (card.style.backgroundColor != hold_color) {
        card.style.backgroundColor = hold_color;
    } else {
        card.style.backgroundColor = default_color;
    }
}

function sortRank(hand) {
    return hand.map(card => card.rank).sort((a, b) => a - b);
}

function getRankFrequencies(hand) {
    const rankCounts = {};
    for (let card of hand) {
        const rank = card.rank;
        rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    }
    return rankCounts;
}

function hasHighCard(hand) {
    return hand.filter(card => card.rank >= 11).length >= 1;
}

function hasPair(hand) {
    const rankCounts = Object.values(getRankFrequencies(hand));
    return rankCounts.includes(2);
}

function hasTwoPair(hand) {
    const rankCounts = Object.values(getRankFrequencies(hand));
    return rankCounts.filter(count => count === 2).length === 2;
}

function hasThreeOfAKind(hand) {
    const rankCounts = Object.values(getRankFrequencies(hand));
    return rankCounts.includes(3);
}

function hasStraight(hand) {
    sortedRank = sortRank(hand);
    if (sortedRank.includes(2) && sortedRank.includes(14)) {
        sortedRank.pop();
        sortedRank.unshift(1);
    }
    for (let i = 1; i < sortedRank.length; i++) {
        if (sortedRank[i - 1] !== sortedRank[i] - 1) return false;
    }
    return true;
}

function hasFlush(hand) {
    const suits = hand.map(card => card.suit);
    return suits.every(suit => suit === suits[0]);
}

function hasFullHouse(hand) {
    const rankCounts = Object.values(getRankFrequencies(hand));
    return rankCounts.includes(3) && rankCounts.includes(2);
}

function hasFourOfAKind(hand) {
    const rankCounts = Object.values(getRankFrequencies(hand));
    return rankCounts.includes(4);
}

function hasStraightFlush(hand) {
    return hasStraight(hand) && hasFlush(hand);
}

function hasRoyalFlush(hand) {
    return hasStraightFlush(hand) && sortRank(hand)[0] === 10;
}

const HAND_RANKINGS = [
    {
        name: "ROYAL FLUSH",
        checkHand: hasRoyalFlush,
        rank: 1
    },

    {
        name: "STRAIGHT FLUSH",
        checkHand: hasStraightFlush,
        rank: 2
    },

    {
        name: "FOUR OF A KIND",
        checkHand: hasFourOfAKind,
        rank: 3
    },

    {
        name: "FULL HOUSE",
        checkHand: hasFullHouse,
        rank: 4
    },

    {
        name: "Flush",
        checkHand: hasFlush,
        rank: 5
    },

    {
        name: "STRAIGHT",
        checkHand: hasStraight,
        rank: 6
    },

    {
        name: "THREE OF A KIND",
        checkHand: hasThreeOfAKind,
        rank: 7
    },

    {
        name: "TWO PAIR",
        checkHand: hasTwoPair,
        rank: 8
    },

    {
        name: "PAIR",
        checkHand: hasPair,
        rank: 9
    },

    {
        name: "HIGH CARD",
        checkHand: hasHighCard,
        rank: 10
    }
];

function getPairName(hand) {
    let rankFrequencies = getRankFrequencies(hand);
    for (let i in rankFrequencies) {
        if (rankFrequencies[i] === 2) return `PAIR OF ${RANK_NAMES[i]}`;
    }
}

function getHandProperty(hand) {
    for (let property of HAND_RANKINGS) {
        if (property.checkHand(hand)) {
            if (property.name === "PAIR") {
                property.name = getPairName(hand);
            }

            return property;
        }
    }
    return { name: null, rank: HAND_RANKINGS.length + 1 };
}

// Visualization

var deck = copyDeck(DECK);

var emptyHand = [];
var hand = [];
var table_hand = document.querySelector(".table .hand");

const hold_color = "lightgreen";
const default_color = "white";
const cards_in_hands = 5;
const card_image_directory = "./card_images";
const default_card_image = card_image_directory + "/back.png";

function getCardImage(card) {
    return card.rank
        ? `${card_image_directory}/${RANK_NAMES[card.rank]}_of_${
              card.suit
          }s.png`
        : default_card_image;
}

for (let i = 0; i < cards_in_hands; i++) {
    emptyHand.push({});
    hand.push(drawCard(deck));
}

function showHand(hand) {
    table_hand.innerHTML = "";
    hand.forEach(card => {
        let div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
<img src=${getCardImage(card)} width="50" height="75" />
                <button onClick="holdCard(this)">Hold</button>
        `;
        table_hand.appendChild(div);
    });
}

showHand(emptyHand);
setTimeout(() => {
    showHand(hand);
}, 500);

function swapCards(e) {
    document.querySelector("#hand-name").innerHTML = "";

    document.querySelectorAll(".card button").forEach((btn, i) => {
        let card_img = btn.parentNode.children[0];

        if (btn.style.backgroundColor != hold_color) {
            card_img.src = "./card_images/back.png";

            setTimeout(() => {
                let card = drawCard(deck);
                card_img.src = getCardImage(card);
                hand[i] = card;
            }, 500);
        }

        btn.style.background = default_color;
        btn.disabled = true;
    });

    e.disabled = true;
    document.querySelector("#reloader").style.display = "flex";

    setTimeout(() => {
        let new_hand = getHandProperty(hand);
        if (new_hand.name?.includes("PAIR OF")) {
            new_hand.name = getPairName(hand);
        }
        document.querySelector("#hand-name").innerHTML =
            new_hand.rank <= HAND_RANKINGS.length
                ? new_hand.name
                : "You Lost!";
    }, 500);
}
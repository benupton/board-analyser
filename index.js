const board = require('./board.json');

/**
 * Number of games to simulate
 */
const numberOfSimulations = 10000;

/**
 * Track the number of landings on each space
 */
const visits = Array(Object.keys(board).length).fill(0);

/**
 * Track the total number of landings
 */
let numberOfLandings = 0;

/**
 * Roll the dice: Generate a random value between 1 - 6
 */
function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Randomly choose a path at a junction space
 */
function choosePath(paths) {
  const randomIndex = Math.floor(Math.random() * paths.length);
  return paths[randomIndex];
}

/**
 * Loop through all simulations. Each iteration is one game.
 */
for (let i = 0; i < numberOfSimulations; i++) {
  // Position refers to the space on the board
  let position = 0;
  // Steps remaining within this dice roll
  let stepsRemaining = rollDice();
  // Track the number of points the player has accumulated
  let points = 0;

  // Move the dice. Each iteration is the player moving one space until they reach the end of the dice roll, or the end of the board
  // Loop breaks when finish space is reach with sufficient points
  while (true) {
    // End of dice roll move
    if (stepsRemaining === 0) {
      // Record the landing position
      visits[position]++;
      numberOfLandings++;
      // Add any points if relevant
      if (board[position].isJob) {
        points += 0.5;
      }
      // If landing on a isNextReroll, move to the reroll space
      if (board[position].isNextReroll) {
        position = board[position].positionToJumpTo;
      }
      // Reroll the dice
      stepsRemaining = rollDice();
      continue;
    }

    // End space reached and has sufficient points
    if (board[position].isFinish && points >= 3) {
      break;
    }

    // Check if this is a nextIsRoll space at a path end, e.g. Job 4
    if (board[position].isNextReroll && board[position].isPathEnd) {
      // Record the landing position
      visits[position]++;
      numberOfLandings++;
      // Add any points if relevant
      if (board[position].isJob) {
        points += 0.5;
      }
      position = board[position].positionToJumpTo;
      // Reroll the dice
      stepsRemaining = rollDice();

      continue;
    }

    // Check if we are at a space with path alternatives
    if (board[position].connections.length > 1) {
      let nextSpaceIdx = choosePath(board[position].connections);
      position = nextSpaceIdx;
    } else {
      // Else just move to the next space
      position = board[position].connections[0];
    }
    stepsRemaining--;
  }
}

const probabilities = visits.map((count) => count / numberOfLandings);
const averageLandingsPerGame = numberOfLandings / numberOfSimulations;

console.log('Probabilities of landing on each space:');
probabilities.map((prob, idx) =>
  console.log(
    `${idx}: ${(prob * 100).toFixed(2)} | av. per game: ${(
      prob * averageLandingsPerGame
    ).toFixed(2)}`
  )
);

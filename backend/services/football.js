// Simulated Live Multi-Sport Matches Service
let matches = [
  {
    id: 'match_1',
    sport: 'Football',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    homeScore: 0,
    awayScore: 0,
    minute: 0,
    status: 'LIVE',
    goalEvent: null,
    detail: 'El Clasico'
  },
  {
    id: 'match_2',
    sport: 'Cricket',
    homeTeam: 'India',
    awayTeam: 'Australia',
    homeScore: 245, // runs
    awayScore: 3,   // wickets
    overs: 38.0,
    target: 312,
    batsman: 'Virat Kohli',
    bowler: 'Mitchell Starc',
    status: 'LIVE',
    goalEvent: null,
    detail: 'India needs 67 runs from 12 overs'
  },
  {
    id: 'match_3',
    sport: 'Badminton',
    homeTeam: 'P.V. Sindhu',
    awayTeam: 'Carolina Marin',
    homeScore: 11, // current set point
    awayScore: 14, // current set point
    sets: '1 - 0', // past set scores (Sindhu won 1st set 21-18)
    status: 'LIVE',
    goalEvent: null,
    detail: 'Set 2 in progress'
  }
];

const SCORERS = {
  'Real Madrid': ['Vinicius Jr.', 'Mbappe', 'Bellingham', 'Rodrygo'],
  'Barcelona': ['Lewandowski', 'Raphinha', 'Yamal', 'Gavi']
};

const CRICKET_BATSMEN = ['Virat Kohli', 'Rohit Sharma', 'KL Rahul', 'Hardik Pandya', 'Rishabh Pant'];
const CRICKET_BOWLERS = ['Mitchell Starc', 'Pat Cummins', 'Josh Hazlewood', 'Adam Zampa'];

// Start a background timer to increment game states
export function startFootballSimulation() {
  setInterval(() => {
    matches = matches.map(match => {
      // 1. Reset match if finished
      if (match.status === 'FINISHED') {
        if (Math.random() > 0.8) {
          if (match.sport === 'Football') {
            return {
              ...match,
              homeScore: 0,
              awayScore: 0,
              minute: 0,
              status: 'LIVE',
              goalEvent: null
            };
          } else if (match.sport === 'Cricket') {
            return {
              ...match,
              homeScore: 0,
              awayScore: 0,
              overs: 0.0,
              target: 280,
              batsman: CRICKET_BATSMEN[0],
              bowler: CRICKET_BOWLERS[0],
              status: 'LIVE',
              goalEvent: null,
              detail: 'First Innings in progress'
            };
          } else if (match.sport === 'Badminton') {
            return {
              ...match,
              homeScore: 0,
              awayScore: 0,
              sets: '0 - 0',
              status: 'LIVE',
              goalEvent: null,
              detail: 'Match Started'
            };
          }
        }
        return match;
      }

      let goalEvent = null;

      // 2. Football Simulation
      if (match.sport === 'Football') {
        const nextMinute = match.minute + Math.floor(Math.random() * 3) + 1;
        let status = 'LIVE';
        if (nextMinute >= 90) {
          status = 'FINISHED';
        }

        let homeScore = match.homeScore;
        let awayScore = match.awayScore;

        if (status === 'LIVE' && Math.random() < 0.12) {
          const isHomeGoal = Math.random() > 0.5;
          const scoringTeam = isHomeGoal ? match.homeTeam : match.awayTeam;
          const scorersList = SCORERS[scoringTeam] || ['Unknown Player'];
          const scorer = scorersList[Math.floor(Math.random() * scorersList.length)];
          
          if (isHomeGoal) homeScore += 1;
          else awayScore += 1;

          goalEvent = {
            team: scoringTeam,
            scorer: scorer,
            minute: Math.min(nextMinute, 90),
            score: `${homeScore} - ${awayScore}`,
            detail: `GOAL! ${scorer} scores for ${scoringTeam}!`
          };
        }

        return {
          ...match,
          minute: Math.min(nextMinute, 90),
          status,
          homeScore,
          awayScore,
          goalEvent
        };
      }

      // 3. Cricket Simulation
      if (match.sport === 'Cricket') {
        let overs = match.overs;
        let homeScore = match.homeScore; // runs
        let awayScore = match.awayScore; // wickets
        let batsman = match.batsman;
        let bowler = match.bowler;
        let status = 'LIVE';

        // Increment ball
        let nextOvers = parseFloat((overs + 0.1).toFixed(1));
        if (nextOvers % 1 >= 0.6) {
          nextOvers = Math.floor(nextOvers) + 1.0;
          // Rotate bowler on over end
          bowler = CRICKET_BOWLERS[Math.floor(Math.random() * CRICKET_BOWLERS.length)];
        }

        const ballEvent = Math.random();
        let detail = match.detail;

        if (ballEvent < 0.08) {
          // Wicket!
          awayScore += 1;
          const dismissed = batsman;
          if (awayScore >= 10) {
            status = 'FINISHED';
            detail = `All Out! Australia wins.`;
          } else {
            // New batsman
            batsman = CRICKET_BATSMEN[awayScore % CRICKET_BATSMEN.length];
            detail = `${dismissed} OUT! Caught behind off ${bowler}.`;
          }

          goalEvent = {
            team: 'Australia',
            scorer: bowler,
            minute: nextOvers,
            score: `${homeScore}/${awayScore} (${nextOvers} ov)`,
            detail: `WICKET! ${dismissed} is OUT! Bowled by ${bowler}.`
          };
        } else if (ballEvent < 0.25) {
          // Boundary 4 or 6
          const isSix = Math.random() > 0.7;
          const boundaryRuns = isSix ? 6 : 4;
          homeScore += boundaryRuns;
          detail = `${batsman} hits a massive ${boundaryRuns}!`;

          goalEvent = {
            team: 'India',
            scorer: batsman,
            minute: nextOvers,
            score: `${homeScore}/${awayScore} (${nextOvers} ov)`,
            detail: `BOUNDARY! ${batsman} hits a ${boundaryRuns} off ${bowler}!`
          };
        } else {
          // Normal runs
          const runs = Math.floor(Math.random() * 4); // 0, 1, 2, 3 runs
          homeScore += runs;
          detail = `${batsman} scores ${runs} run(s).`;
        }

        // Check if India chases target
        if (homeScore >= match.target) {
          status = 'FINISHED';
          detail = `India wins by ${10 - awayScore} wickets!`;
          goalEvent = {
            team: 'India',
            scorer: batsman,
            minute: nextOvers,
            score: `${homeScore}/${awayScore}`,
            detail: `MATCH WINNER! India chased down target of ${match.target}!`
          };
        } else if (nextOvers >= 50.0) {
          status = 'FINISHED';
          detail = `Overs completed. Australia wins.`;
        }

        return {
          ...match,
          overs: nextOvers,
          homeScore,
          awayScore,
          batsman,
          bowler,
          status,
          goalEvent,
          detail
        };
      }

      // 4. Badminton Simulation
      if (match.sport === 'Badminton') {
        let homeScore = match.homeScore; // current set points home
        let awayScore = match.awayScore; // current set points away
        let sets = match.sets; // sets score e.g. "1 - 0"
        let status = 'LIVE';
        let detail = match.detail;

        const isHomePoint = Math.random() > 0.48; // slightly favor home
        if (isHomePoint) homeScore += 1;
        else awayScore += 1;

        // Parse sets
        const setsArr = sets.split(' - ').map(Number);
        
        // Check if set is won (needs 21 points and lead of at least 2, max 30)
        const isSetEnded = (homeScore >= 21 || awayScore >= 21) && Math.abs(homeScore - awayScore) >= 2;
        const isSetMaxed = (homeScore === 30 || awayScore === 30);
        
        if (isSetEnded || isSetMaxed) {
          const homeWonSet = homeScore > awayScore;
          if (homeWonSet) setsArr[0] += 1;
          else setsArr[1] += 1;

          sets = `${setsArr[0]} - ${setsArr[1]}`;
          detail = `${homeWonSet ? match.homeTeam : match.awayTeam} wins set: ${homeScore}-${awayScore}!`;

          goalEvent = {
            team: homeWonSet ? match.homeTeam : match.awayTeam,
            scorer: homeWonSet ? match.homeTeam : match.awayTeam,
            minute: setsArr[0] + setsArr[1],
            score: sets,
            detail: `SET COMPLETED! ${homeWonSet ? match.homeTeam : match.awayTeam} takes the set (${homeScore}-${awayScore})!`
          };

          homeScore = 0;
          awayScore = 0;

          // Check if match won (best of 3 sets)
          if (setsArr[0] === 2 || setsArr[1] === 2) {
            status = 'FINISHED';
            detail = `${setsArr[0] === 2 ? match.homeTeam : match.awayTeam} WINS THE MATCH!`;
          }
        } else {
          detail = `Set Score: ${sets}. Game point: ${homeScore} - ${awayScore}`;
        }

        return {
          ...match,
          homeScore,
          awayScore,
          sets,
          status,
          goalEvent,
          detail
        };
      }

      return match;
    });
  }, 12000); // Ticks every 12 seconds
}

export function getLiveMatches() {
  return matches;
}


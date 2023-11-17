import { useEffect, useState } from 'react';
import './App.css';
import { useHotkeys } from '@mantine/hooks';

// app globals
const refreshRate = 5;  // ms

// motion parameters
const PWIDTH = "20px";
const PHEIGHT = "150px";
const MAX_PLAYER_SPEED = 5.0;
const BALL_SPEED = 0.1;

// positions on screen
const START = 45;
const MIN = 0;
const MAX = 85;

function ntop(num: number): string {
  // number to percentage
  return JSON.stringify(num) + "%";
}

interface PaddleProps {
  // fixed x from left
  readonly x: number,
  // current y
  y: number,
}

function Paddle(props: PaddleProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: ntop(props.y),
        left: ntop(props.x),
        background: "#FFFFFF",
        width: PWIDTH,
        height: PHEIGHT
      }}
    ></div>
  );
}

interface BallProps {
  // current x
  x: number,
  // current y
  y: number,
  // current speed x
  vx: number,
  // current speed y
  vy: number,
}

function Ball(props: BallProps) {
  const diameter = "50px";

  return (
    <div
      style={{
        position: "absolute",
        top: ntop(props.y),
        left: ntop(props.x),
        background: "#FFFFFF",
        width: diameter,
        height: diameter,
        borderRadius: "50%",
      }}
    >
    </div>
  );
}

interface PlayerConfig {
  // fixed x position from left
  x: number,
  // y between essentially 0 and 100, translated to 0% to 100% of screen
  y: number,
  // current score: non-negative int
  score: number
}

function App() {
  const [player, changePlayer] = useState<PlayerConfig>({x: 10, y: START, score: 0});
  const [computer, changeComputer] = useState<PlayerConfig>({x: 90, y: START, score: 0});
  const [ball, changeBall] = useState<BallProps>({x: 50, y: START, vx: BALL_SPEED, vy: BALL_SPEED});

  // use space to control this
  const [playing, setPlaying] = useState<boolean>(true);

  const updatePaddleY = function(y: number, amount: number): number {
    return Math.min(Math.max(y + amount, MIN), MAX)
  }

  const updateBetweenZeroAndHundred = function(x: number, amount: number): number {
    return Math.min(Math.max(x + amount, 0.0), 100.0);
  }

  /* arrow controls */
  useHotkeys([
    ["ArrowUp", () => changePlayer({...player, y: updatePaddleY(player.y, -MAX_PLAYER_SPEED)})],
    ["ArrowDown", () => changePlayer({...player, y: updatePaddleY(player.y, MAX_PLAYER_SPEED)})]
  ]);


  /* Ball and computer paddle physics */
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!playing) {
        return;
      }
  
      // physics for ball
      let newBallX = updateBetweenZeroAndHundred(ball.x, ball.vx);
      let newBallY = updateBetweenZeroAndHundred(ball.y, ball.vy);
      let newVx = ball.vx;
      let newVy = ball.vy;
  
      // 90-2 for the width of the paddle
      if (newBallX < 10 || newBallX > 90 - 2) {
        newVx = -newVx;
      }
  
      if (newBallY <= 5 || newBallY >= 95) {
        newVy = -newVy;
      }

      // physics for simple computer
      const diff = newBallY - computer.y;
      let direction = (diff === 0) ? 0 : diff / Math.abs(diff);
      let newComputerY = updatePaddleY(computer.y, BALL_SPEED * direction);
  
      changeBall({x: newBallX, y: newBallY, vx: newVx, vy: newVy});
      changeComputer({...computer, y: newComputerY})
    }, refreshRate);

    return () => clearInterval(intervalId);
  });

  return (
    <div style={{
      height: "100vh",
      width: "100vw",
      display: "block",
      background: "#000000",
    }}>
      <Paddle key="player" x={player.x} y={player.y} />
      <Paddle key="computer" x={computer.x} y={computer.y} />
      <Ball key="ball" {...ball} />
    </div>
  );
}

export default App;

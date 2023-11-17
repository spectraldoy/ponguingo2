import { useEffect, useState } from 'react';
import './App.css';
import { useHotkeys } from '@mantine/hooks';

// TODO: scoring

// app globals
const refreshRate = 20;  // ms
const serverURL = "http://localhost:3001/";

// motion parameters
const PWIDTH = 20;
const PHEIGHT = 150;
const BALL_DIAMETER = 50;
const PLAYER_X = 10;
const COMPUTER_X = 90;
const MAX_PLAYER_SPEED = 10.0;
const SENSITIVITY = 2.5 ;
const BALL_SPEED = 1.5;

// positions on screen
const START = 45;
const MIN = 0;
const MAX = 85;

function ntop(num: number): string {
  // number to percentage
  return JSON.stringify(num) + "%";
}

function scalePxToPos(num: number, scale: number = 0.1): number {
  return num * scale;
}

interface ScoreProps {
  // score
  score: number,
  // displacement from left
  left: number | string,
}

function Score(props: ScoreProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 50,
        left: props.left,
        color: "#FFFFFF",
        fontSize: 64,
        fontFamily: "monospace"
      }}
    >
      {props.score}
    </div>
  );
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
  return (
    <div
      style={{
        position: "absolute",
        top: ntop(props.y),
        left: ntop(props.x),
        background: "#FFFFFF",
        width: BALL_DIAMETER,
        height: BALL_DIAMETER,
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

interface IMUData {
  ax: number,
  ay: number,
  az: number,
  gx: number,
  gy: number,
  gz: number,
}

function App() {
  const [player, changePlayer] = useState<PlayerConfig>({x: PLAYER_X, y: START, score: 0});
  const [computer, changeComputer] = useState<PlayerConfig>({x: COMPUTER_X, y: START, score: 0});
  const [ball, changeBall] = useState<BallProps>({x: 50, y: START, vx: -BALL_SPEED / 2, vy: 0});
  // controlled by space
  const [playing, setPlaying] = useState<boolean>(false);

  const [_IMUData, setIMUData] = useState<IMUData>({ ax: 0, ay: 0, az: 0, gx: 0, gy: 0, gz: 0 });

  const updatePaddleY = function(y: number, amount: number): number {
    return Math.min(Math.max(y + amount, MIN), MAX)
  }

  const updateBetweenZeroAndHundred = function(x: number, amount: number): number {
    return Math.min(Math.max(x + amount, 0.0), 100.0);
  }

  /* arrow controls */
  useHotkeys([
    ["ArrowUp", () => changePlayer({...player, y: updatePaddleY(player.y, -MAX_PLAYER_SPEED)})],
    ["ArrowDown", () => changePlayer({...player, y: updatePaddleY(player.y, MAX_PLAYER_SPEED)})],
    ["space", () => {
      if (!playing) {
        setPlaying(true);
        changeBall({x: 50, y: START, vx: -BALL_SPEED / 2, vy: 0});
      }
    }],
  ]);

  /* Ball, player and computer paddle physics */
  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (!playing) {
        return;
      }
  
      // physics for ball
      let newBallX = updateBetweenZeroAndHundred(ball.x, ball.vx);
      let newBallY = updateBetweenZeroAndHundred(ball.y, ball.vy);
      let newVx = ball.vx;
      let newVy = ball.vy;
  
      // simulate bouncing off a paddle
      // 2 is the width of the paddle, 15 is the height of the paddle
      const diffScaler = 3;
      if (newBallX >= PLAYER_X  && newBallX <= PLAYER_X + scalePxToPos(PWIDTH) && 
          newBallY >= player.y - scalePxToPos(BALL_DIAMETER) && newBallY <= player.y + scalePxToPos(PHEIGHT)) {
        // hitting the player's paddle
        const center = player.y + scalePxToPos(PHEIGHT) / 2;
        const diff = (newBallY  - center) * diffScaler;
        newVy = BALL_SPEED * Math.min(Math.abs(diff) / scalePxToPos(PHEIGHT), Math.sin(Math.PI / 4)) + Math.random() * 0.25;
        if (diff <= 0) {
          newVy = -newVy;
        }

        newVx = BALL_SPEED;
      } else if (newBallX + scalePxToPos(BALL_DIAMETER) / 2 >= COMPUTER_X && newBallX + scalePxToPos(BALL_DIAMETER) / 2 <= COMPUTER_X + scalePxToPos(PWIDTH)
                 && newBallY >= computer.y - scalePxToPos(BALL_DIAMETER) && newBallY <= computer.y + scalePxToPos(PHEIGHT)) {
        // hitting the computer's paddle
        const center = computer.y + scalePxToPos(PHEIGHT) / 2;
        const diff = (newBallY - center) * diffScaler;
        newVy = BALL_SPEED * Math.min(Math.abs(diff) / scalePxToPos(PHEIGHT), Math.sin(Math.PI / 4)) + Math.random() * 0.25;
        if (diff <= 0) {
          newVy = -newVy;
        }

        newVx = -BALL_SPEED;
      }

      // if go past a paddle, increase score
      if (newBallX <= 0) {
        // increase computer's score
        setPlaying(false);
        changeComputer({...computer, score: computer.score + 1});
        return;
      } else if (newBallX >= 100 - scalePxToPos(BALL_DIAMETER) / 2) {
        setPlaying(false);
        changePlayer({...player, score: player.score + 1});
        return;
      }
  
      // bouncing off the wall
      if (newBallY <= scalePxToPos(BALL_DIAMETER) / 2 || newBallY >= 100 - scalePxToPos(BALL_DIAMETER) / 2) {
        newVy = -newVy;
      }

      // update player
      const data = await fetch(serverURL, {
        method: "POST",
        mode: "cors",
        credentials: "same-origin",
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
      const res: IMUData = await data.json();
      setIMUData(res);
      let ax: number | undefined = res.ax;
      if (ax === undefined) {
        return;
      }
      ax = -ax;
      ax = Math.max(Math.min(ax * SENSITIVITY, MAX_PLAYER_SPEED), -MAX_PLAYER_SPEED);
      let newPlayerY = updatePaddleY(player.y, ax);

      // physics for simple computer
      const speedScaler = 0.5;
      const diff = newBallY - computer.y - scalePxToPos(PHEIGHT) / 2;
      let direction = (diff === 0) ? 0 : diff / Math.abs(diff);
      let newComputerY = updatePaddleY(computer.y, BALL_SPEED * direction * speedScaler);
  
      changeBall({x: newBallX, y: newBallY, vx: newVx, vy: newVy});
      changeComputer({...computer, y: newComputerY})
      changePlayer({...player, y: newPlayerY});
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
      <Score key="playerscore" score={player.score} left="20vw"/>
      <Score key="computerscore" score={computer.score} left="80vw"/>
      <Paddle key="player" x={player.x} y={player.y} />
      <Paddle key="computer" x={computer.x} y={computer.y} />
      <Ball key="ball" {...ball} />
    </div>
  );
}

export default App;

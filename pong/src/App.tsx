import { useState } from 'react';
import './App.css';
import { Box, Group, Stack, Space } from "@mantine/core";
import { useHotkeys } from '@mantine/hooks';

const PWIDTH = "20px";
const PHEIGHT = "150px";
const SPEED = 5.0;

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
        top: JSON.stringify(props.y) + "%",
        left: JSON.stringify(props.x) + "%",
        background: "#FFFFFF",
        width: PWIDTH,
        height: PHEIGHT
      }}
    ></div>
  );
}

interface PlayerConfig {
  // fixed x position from left
  x: number,
  // y between 0 and 100, translated to 0% to 100% of screen
  y: number,
  // current score: non-negative int
  score: number
}

function App() {
  const [player, changePlayer] = useState<PlayerConfig>({x: 10, y: 50, score: 0});
  const [computer, changeComputer] = useState<PlayerConfig>({x: 90, y: 50, score: 0});

  const updateY = function(y: number, amount: number) {
    return Math.min(Math.max(y + amount, 0.0), 100.0)
  }

  useHotkeys([
    ["ArrowUp", () => changePlayer({...player, y: updateY(player.y, -SPEED)})],
    ["ArrowDown", () => changePlayer({...player, y: updateY(player.y, SPEED)})],
  ])

  return (
    <div style={{
      height: "100vh",
      width: "100vw",
      display: "block",
      background: "#000000"
    }}>
      <Paddle key="player" x={player.x} y={player.y} />
      <Paddle key="computer" x={computer.x} y={computer.y} />
    </div>
  );
}

export default App;

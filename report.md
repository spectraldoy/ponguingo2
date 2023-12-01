# Report for CS M119 M5

My gestures in M4 were simply based on rotation around the y axis. The speed of the user's pong paddle was proportional to the `gy` reported from the Arduino's IMU. That is, the faster the user rotated the Arduino in one direction, the faster the paddle would go up; the faster the user rotated the Arduino in the other direction, the faster the paddle would go down. The user could keep twisting the Arduino in the direction they wanted, to move the paddle in that direction.

In M5, the gestures are based on tilting around the Y axis, and use `ay` and `az` instead:
- Up: User tilts the Arduino left
- Down: User tilts the Arduino right
- Stop: User positions the Arduino facing up (i.e. `az ~= 1.0`)

For the Up and Down gestures, the higher the angle of tilting (that is, the larger the magnitude of `ay`), the faster the speed of the paddle in the associated direction.

Both my gestures use absolute mapping. The speed of the paddle is directly determined by the rotational speed (M4) or angle of tilt (M5) of the Arduino.

# Comparing Gestures

## Metrics of success
- Ease of use / Playability
- Avoidance of the Nulling problem
- Rate of false positives

## M4

- Ease of use: One of the issues with this was the sensitivity of the gyroscope. When the user twists very fast, the acceleration shoots up very quickly, usually much faster than the user intends. On top of that, with the resources I had available, the Arduino had to be connected with a cable to my laptop. Thus, when I twisted it, the cable would also twist, and would exert some torque trying to twist the Arduino in the other direction. This made it hard to keep moving in one direction once you had twisted the Arduino enough
- Avoidance of the nulling problem: I would say this avoided the nulling problem quite well. The user can twist infinitely in whichever direction they want. The user has to stop twisting at some point, which naturally translates to setting the speed of the paddle to 0, i.e., stopping the paddle. If the user wants to go in the other direction, the user can start from where they are (no rotational speed) and just twist in the other direction.
- Rate of false positives: Since there was no "Stop" state, whenever the Arduino was twisted slightly in one direction, the paddle would respond and move. Furthermore, with the resources I had available, the Arduino had to be connected with a cable to my laptop. Thus, when I twisted it, the cable would also twist, and would exert some torque that would twist in the opposite direction that I had been twisting in, thus causing the paddle to slightly move back from where I wanted it to be when I would stop twisting. Thus, the rate of false positives with my M4 gestures was high, either because it responded to random motions by the user, or because of the connection to a cable.

## M5

- Ease of use: this one is very easy to use. You can tilt left, or tilt right using your wrist, and it doesn't strain your wrist. Because of the "Stop" state that we have when the Arduino is facing up, it is also easy to prevent random motions of the user from causing false positives, and also makes it easy to switch directions - the paddle always stops before it starts moving in the other direction, and it doesn't have to decelerate all the way to 0 to do so. There is also no problem of infinite twisting that causes the cable to twist.
- Avoidance of the nulling problem: unfortunately, my gestures still experience the nulling problem to a noticeable degree. If you want to set the speed of the paddle all the way in the opposite direction in which you are currently moving, you must go through the Stop state, setting the speed of the paddle to 0, and then proceed in the desired direction. It is only slight as the Stop state is a fairly wide range, `az > 0.6`, meaning that it doesn't take much motion for the user to traverse through the Stop state into motion in the other direction.
- False positives: Due to the stop state, if the user is holding their paddle in the Stop position, false positives are avoided to a high degree. Only if the user tilts the Arduino in the y direction to a noticeable extent will the paddle start to move.

## Conclusion

While my gestures in M4 are able to avoid the nulling problem better than my gestures in M5, my gestures in M5 are easier to use and better at avoiding false positives.

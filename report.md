# Report for CS M119 M5

My gestures in M4 were simply based on rotation around the y axis. The speed of the user's pong paddle was proportional to the `gy` reported from the Arduino's IMU. That is, the faster the user rotated the Arduino in one direction, the faster the paddle would go up; the faster the user rotated the Arduino in the other direction, the faster the paddle would go down. The user could keep twisting the Arduino in the direction they wanted, to move the paddle in that direction.

In M5, the gestures are based on tilting around the Y axis, and use `ay` and `az` instead:
- Up: User tilts the Arduino left
- Down: User tilts the Arduino right
- Stop: User positions the Arduino facing up (i.e. `az ~= 1.0`)

For the Up and Down gestures, the higher the angle of tilting (that is, the larger the magnitude of `ay`), the faster the speed of the paddle in the associated direction.


# Comparing Gestures

M4: rotation around Y-axis: speed was proportional to gy. Negative gy => move down, Positive gy => move up

M5: tilting around the Y axis, and use `ay` and `az` instead:
- Up: User tilts the Arduino left
- Down: User tilts the Arduino right
- Stop: User positions the Arduino facing up (i.e. `az ~= 1.0`)

In both labs, I used absolute mapping (from IMU data to speed of the paddle).

## Metrics of success
- Ease of use / Playability
- Avoidance of the Nulling problem
- Rate of false positives

## M4

- Ease of use: Gyroscope very sensitive, usually moved paddle faster than user intended. Hard to calibrate.
- Avoidance of the nulling problem: Avoided the nulling problem quite well. The user naturally stops twisting their Arduino, which automatically nulls the speed.
- Rate of false positives: Because of the cable, and no stop state, rate of false positives was high.

## M5

- Ease of use: You can tilt left, or tilt right using your wrist, and it doesn't strain your wrist. Stop state makes it easy to null, paddle has to stop before moving in the other direction
- Avoidance of the nulling problem: Nulling problem is noticeable. You have to turn your wrist to stop the paddle from moving before moving in the other direction.
- False positives: Easy to avoid false positives due to the Stop state.

## Conclusion

While my gestures in M4 are able to avoid the nulling problem better than my gestures in M5, my gestures in M5 are easier to use and better at avoiding false positives.

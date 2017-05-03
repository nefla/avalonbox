import Direction from '../constants/Direction'

function oppositeDirection(DIRECTION) {
  return DIRECTION === Direction.LEFT ? Direction.RIGHT : Direction.LEFT
}

export default oppositeDirection

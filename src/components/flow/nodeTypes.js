import StartNode from './nodes/StartNode';
import StateNode from './nodes/StateNode';
import JackpotNode from './nodes/JackpotNode';
import EventNode from './nodes/EventNode';

const nodeTypes = {
  start: StartNode,
  state: StateNode,
  jackpot: JackpotNode,
  event: EventNode,
};

export default nodeTypes;

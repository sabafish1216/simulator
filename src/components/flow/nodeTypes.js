import StartNode from './nodes/StartNode';
import StateNode from './nodes/StateNode';
import JackpotNode from './nodes/JackpotNode';

const nodeTypes = {
  start: StartNode,
  state: StateNode,
  jackpot: JackpotNode,
};

export default nodeTypes;

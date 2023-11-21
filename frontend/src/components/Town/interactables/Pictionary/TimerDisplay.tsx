import { useState, useEffect } from "react";
import PictionaryAreaController from "../../../../classes/interactable/PictionaryAreaController";

function TimerDisplay({ gameAreaController }: {gameAreaController: PictionaryAreaController }): JSX.Element {
  const [betweenTurns, setBetweenTurns] = useState(gameAreaController.betweenTurns);
  const [timer, setTimer] = useState(gameAreaController.timer);

  useEffect(() => {
    setTimer(gameAreaController.timer);
    setBetweenTurns(gameAreaController.betweenTurns);
  }, [gameAreaController.timer, gameAreaController.betweenTurns])

  // TODO: Put these in a single point of control
  const turnLength = 30;
  const intermissionLength = 5;

  return (
    <div>
      {
        betweenTurns
        ? `Next turn in ${intermissionLength - timer} seconds`
        : `${turnLength - timer} seconds remaining`
      }
    </div>
  );
}
export default TimerDisplay;

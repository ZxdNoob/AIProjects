import './Dice3D.less';

const dot = (x: number, y: number, i: number) => (
  <span className="dot" style={{ left: `${x * 25}%`, top: `${y * 25}%` }} key={`${x}-${y}-${i}`} />
);

const faceDots = [
  [],
  [dot(2, 2, 0)], // 1
  [dot(1, 1, 0), dot(3, 3, 1)], // 2
  [dot(1, 1, 0), dot(2, 2, 1), dot(3, 3, 2)], // 3
  [dot(1, 1, 0), dot(1, 3, 1), dot(3, 1, 2), dot(3, 3, 3)], // 4
  [dot(1, 1, 0), dot(1, 3, 1), dot(2, 2, 2), dot(3, 1, 3), dot(3, 3, 4)], // 5
  [dot(1, 1, 0), dot(1, 3, 1), dot(2, 1, 2), dot(2, 3, 3), dot(3, 1, 4), dot(3, 3, 5)], // 6
];

// 骰子旋转映射：根据点数找到对应的旋转角度
const pointToRotate = {
  1: 'rotateY(0deg)',     // 显示正面（1点）
  2: 'rotateX(90deg)',    // 显示底部（2点）
  3: 'rotateY(-90deg)',   // 显示右侧（3点）
  4: 'rotateY(90deg)',    // 显示左侧（4点）
  5: 'rotateX(-90deg)',   // 显示顶部（5点）
  6: 'rotateY(180deg)',   // 显示背面（6点）
};

// 获取点数对应的颜色类
const getDotColorClass = (point: number) => {
  if (point === 1) return 'dot-red';
  if (point === 6) return 'dot-blue';
  return 'dot-black';
};

export default function Dice3D({ point, rolling }: { point: number, rolling: boolean }) {
  const rotate = pointToRotate[point as keyof typeof pointToRotate] || pointToRotate[1];
  return (
    <div className="dice3d-scene">
      <div
        className={`dice3d-cube${rolling ? ' rolling' : ''}`}
        style={{ transform: rolling ? 'rotateX(720deg) rotateY(720deg)' : rotate }}
      >
        <div className={`dice3d-face dice3d-face-front ${getDotColorClass(1)} dot-point-1`}>{faceDots[1]}</div>
        <div className={`dice3d-face dice3d-face-back ${getDotColorClass(6)} dot-point-6`}>{faceDots[6]}</div>
        <div className={`dice3d-face dice3d-face-right ${getDotColorClass(3)} dot-point-3`}>{faceDots[3]}</div>
        <div className={`dice3d-face dice3d-face-left ${getDotColorClass(4)} dot-point-4`}>{faceDots[4]}</div>
        <div className={`dice3d-face dice3d-face-top ${getDotColorClass(5)} dot-point-5`}>{faceDots[5]}</div>
        <div className={`dice3d-face dice3d-face-bottom ${getDotColorClass(2)} dot-point-2`}>{faceDots[2]}</div>
      </div>
    </div>
  );
}
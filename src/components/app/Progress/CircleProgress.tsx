// ProgressBar.tsx
import styled from 'styled-components';

interface Props {
  percentage: number;
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 80px;
  height: 80px;
  background-color: var(--block-bg);
`;

const Circle = styled.svg`
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
`;

const Background = styled.circle`
  fill: none;
  stroke: grey;
  stroke-width: 10;
`;

const Progress = styled.circle<Props>`
  fill: none;
  stroke: var(--primary-color);
  stroke-width: 10;
  stroke-linecap: round;
  stroke-dasharray: ${2 * Math.PI * 45};
  stroke-dashoffset: ${(props) => (1 - props.percentage / 100) * 2 * Math.PI * 45};
  transition: stroke-dashoffset 0.5s ease-out;
`;

const Percentage = styled.span`
  position: absolute;
  font-size: 1rem;
  padding-left: 0.5rem;
  font-weight: bold;
  color: var(--primary-color);
`;

const CircleProgress = ({ percentage }: Props) => {
  return (
    <Container>
      <Circle viewBox="0 0 100 100">
        <Background cx="50" cy="50" r="45" />
        <Progress cx="50" cy="50" r="45" percentage={percentage} />
      </Circle>
      <Percentage>{percentage}%</Percentage>
    </Container>
  );
};

export default CircleProgress;

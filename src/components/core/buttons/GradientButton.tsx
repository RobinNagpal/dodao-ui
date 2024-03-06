import styled from 'styled-components';
import LoadingSpinner from '@/components/core/loaders/LoadingSpinner';
import React, { FormEvent } from 'react';

export type ButtonProps = {
  backgroundColor?: string;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onClick?: (e?: FormEvent<HTMLButtonElement>) => void;
  className?: string;
};

const GradientButton = styled.button<ButtonProps>`
  padding: 10px 25px;
  background-image: ${(props) =>
    props.backgroundColor
      ? `linear-gradient(to right, ${props.backgroundColor}, ${shadeColor(props.backgroundColor, 20)})`
      : 'linear-gradient(to right, #f9d423, #ffdd00)'};
  color: white;
  font-family: 'Arial', sans-serif;
  font-size: 1rem;
  font-weight: bold;
  text-transform: uppercase;
  border: none;
  border-radius: 20px; // Rounded corners
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  outline: none;
  transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;

  &:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
  }

  &:active {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transform: translateY(1px);
  }

  &:disabled {
    background-image: linear-gradient(to right, #cccccc, #dddddd); // Disabled gradient
    cursor: not-allowed;
    box-shadow: none;
    opacity: 0.6;
  }
`;

// Function to lighten or darken a color
const shadeColor = (color: string, percent: number): string => {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.min(255, Math.floor((R * (100 + percent)) / 100));
  G = Math.min(255, Math.floor((G * (100 + percent)) / 100));
  B = Math.min(255, Math.floor((B * (100 + percent)) / 100));

  const RR = R.toString(16).padStart(2, '0');
  const GG = G.toString(16).padStart(2, '0');
  const BB = B.toString(16).padStart(2, '0');

  return `#${RR}${GG}${BB}`;
};

const CustomGradientButton = ({ backgroundColor, loading, type = 'button', disabled, style, children, onClick, className }: ButtonProps) => {
  return (
    <GradientButton type={type} backgroundColor={backgroundColor} disabled={disabled || loading} style={style} onClick={onClick} className={className}>
      {loading && <LoadingSpinner />}
      {children}
    </GradientButton>
  );
};

export default CustomGradientButton;

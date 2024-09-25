import styles from './../IconColor.module.scss';

export default function TextAlignCenter() {
  return (
    <svg
      className={styles.iconColor}
      xmlns="http://www.w3.org/2000/svg"
      height="20px"
      width="20px"
      viewBox="0 0 25 25"
      fill="currentColor"
      stroke="currentColor"
    >
      <line x1="21" y1="6" x2="3" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="19" y1="10" x2="5" y2="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="21" y1="14" x2="3" y2="14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="19" y1="18" x2="5" y2="18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
